import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { stripe } from '@/lib/server/stripe';
import { db } from '@/lib/server/supabase';
import { markPaid } from '@/lib/server/bids';
import { after } from 'next/server'; 
import { notifyDeposit } from '@/lib/server/notify';

export const runtime = 'nodejs';

async function onSessionPaid(session: Stripe.Checkout.Session) {
  const bidId = session.metadata?.bid_id;
  console.log('onSessionPaid', { bidId, payment_status: session.payment_status, metadata: session.metadata });
  if (!bidId || (session.payment_status !== 'paid' && session.payment_status !== 'no_payment_required')) {
    console.log('skipped: missing bid_id or not paid'); return;
  }
  const { data: bid, error } = await db().from('bids').select('payment_mode,status').eq('id', bidId).single();
  console.log('bid lookup', { bid, error });
  if (!bid || bid.status === 'paid' || bid.status === 'cancelled') { console.log('skipped: bid missing or final'); return; }
  if (bid.payment_mode === 'full') await markPaid(bidId);
  else {
    // só dispara quando ESTA chamada fez a transição (Stripe reenvia webhooks; evita ligar duas vezes)
    const { data: moved } = await db().from('bids')
      .update({ status: 'pending_offer' }).eq('id', bidId).eq('status', 'awaiting_payment')
      .select('id, spot_id, amount, deposit, display_name, bidders(name, phone, email)')    
    if (moved?.length) after(() => notifyDeposit(moved[0]));
  }}

export async function POST(req: Request) {
  const sig = req.headers.get('stripe-signature');
  const body = await req.text(); // raw body is required for signature verification
  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(body, sig ?? '', process.env.STRIPE_RV_STRIPE_WEBHOOK_KEY!);
  } catch {
    return new NextResponse('Bad signature', { status: 400 });
  }
  try {
    switch (event.type) {
      case 'checkout.session.completed':
      case 'checkout.session.async_payment_succeeded':   // Pix / bank debits confirm later
        await onSessionPaid(event.data.object as Stripe.Checkout.Session);
        break;
      case 'checkout.session.async_payment_failed':
      case 'checkout.session.expired': {
        const id = (event.data.object as Stripe.Checkout.Session).metadata?.bid_id;
        if (id) await db().from('bids').update({ status: 'cancelled' }).eq('id', id).eq('status', 'awaiting_payment');
        break;
      }
      case 'invoice.paid': {                               // balance invoice for a deposit offer
        const id = (event.data.object as Stripe.Invoice).metadata?.bid_id;
        if (id) await markPaid(id);
        break;
      }
    }
  } catch (e) {
    console.error('webhook handler failed', e);
    return new NextResponse('Handler error', { status: 500 }); // Stripe will retry
  }
  return NextResponse.json({ received: true });
}

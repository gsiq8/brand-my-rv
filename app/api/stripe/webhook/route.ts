import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { stripe } from '@/lib/server/stripe';
import { db } from '@/lib/server/supabase';
import { markPaid } from '@/lib/server/bids';

export const runtime = 'nodejs';

async function onSessionPaid(session: Stripe.Checkout.Session) {
  const bidId = session.metadata?.bid_id;
  if (!bidId || (session.payment_status !== 'paid' && session.payment_status !== 'no_payment_required')) return;
  const { data: bid } = await db().from('bids').select('payment_mode,status').eq('id', bidId).single();
  if (!bid || bid.status === 'paid' || bid.status === 'cancelled') return;
  if (bid.payment_mode === 'full') await markPaid(bidId);                      // paid in full: logo goes live
  else await db().from('bids').update({ status: 'pending_offer' }).eq('id', bidId); // deposit: you call / invoice the balance
}

export async function POST(req: Request) {
  const sig = req.headers.get('stripe-signature');
  const body = await req.text(); // raw body is required for signature verification
  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(body, sig ?? '', process.env.STRIPE_WEBHOOK_SECRET!);
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

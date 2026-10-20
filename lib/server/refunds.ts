import { NextResponse, after } from 'next/server';
import type Stripe from 'stripe';
import { stripe } from '@/lib/server/stripe';
import { db } from '@/lib/server/supabase';
import { markPaid, bidPlaced } from '@/lib/server/bids';
import { notifyDeposit, notifyLogoCheck } from '@/lib/server/notify';

export const runtime = 'nodejs';

async function onSessionPaid(session: Stripe.Checkout.Session) {
  const bidId = session.metadata?.bid_id;
  if (!bidId) return;

  const pi = typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id;
  if (pi) await db().from('bids').update({ payment_intent_id: pi }).eq('id', bidId);

  const { data: bid, error } = await db().from('bids').select('payment_mode,status').eq('id', bidId).single();
  if (!bid || bid.status === 'paid' || bid.status === 'cancelled') return;

  if (bid.payment_mode === 'full') {
    const { data: moved } = await db().from('bids')
      .update({ status: 'pending_capture' }).eq('id', bidId).eq('status', 'awaiting_payment')
      .select('id, spot_id, amount, deposit, display_name, bidders(name, phone, email)');

    if (moved?.length) {
      const b = moved[0];
      after(async () => {
        await notifyLogoCheck(b, b.amount, 'card hold');
        await bidPlaced(b, b.amount, 'card hold');
      });
    }
    return;
  }

  const { data: moved } = await db().from('bids')
    .update({ status: 'pending_offer' }).eq('id', bidId).eq('status', 'awaiting_payment')
    .select('id, spot_id, amount, deposit, display_name, bidders(name, phone, email)');

  if (moved?.length) after(async () => {
    const b = moved[0];
    await notifyDeposit(b);
    await notifyLogoCheck(b, b.deposit, 'secure deposit');
    await bidPlaced(b, b.deposit, 'secure deposit');
  });
}

export async function POST(req: Request) {
  const sig = req.headers.get('stripe-signature');
  const body = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(body, sig ?? '', process.env.STRIPE_RV_STRIPE_WEBHOOK_KEY!);
  } catch {
    return new NextResponse('Bad signature', { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
      case 'checkout.session.async_payment_succeeded':
        await onSessionPaid(event.data.object as Stripe.Checkout.Session);
        break;
      case 'checkout.session.async_payment_failed':
      case 'checkout.session.expired': {
        const id = (event.data.object as Stripe.Checkout.Session).metadata?.bid_id;
        if (id) await db().from('bids').update({ status: 'cancelled' }).eq('id', id).eq('status', 'awaiting_payment');
        break;
      }
      case 'payment_intent.canceled': {
        const id = (event.data.object as Stripe.PaymentIntent).metadata?.bid_id;
        if (id) await db().from('bids').update({ status: 'cancelled' }).eq('id', id).eq('status', 'pending_capture');
        break;
      }
      case 'charge.captured': {
        const id = (event.data.object as Stripe.Charge).metadata?.bid_id;
        if (id) await markPaid(id);
        break;
      }
      case 'invoice.paid': {
        const id = (event.data.object as Stripe.Invoice).metadata?.bid_id;
        if (id) await markPaid(id);
        break;
      }
    }
  } catch (e) {
    console.error('webhook handler failed', e);
    return new NextResponse('Handler error', { status: 500 });
  }
  return NextResponse.json({ received: true });
}


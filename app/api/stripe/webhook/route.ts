import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { stripe } from '@/lib/server/stripe';
import { onSessionCompleted, onSessionExpired, onPaymentCanceled } from '@/lib/server/auction';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const sig = req.headers.get('stripe-signature');
  const body = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(body, sig ?? '', process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return new NextResponse('Bad signature', { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await onSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case 'checkout.session.expired':
        await onSessionExpired(event.data.object as Stripe.Checkout.Session);
        break;
      case 'payment_intent.canceled':
        await onPaymentCanceled(event.data.object as Stripe.PaymentIntent);
        break;
    }
  } catch (e) {
    console.error('webhook handler failed', event.type, e);
    return new NextResponse('Handler error', { status: 500 });   // Stripe retries; every handler is idempotent
  }
  return NextResponse.json({ received: true });
}
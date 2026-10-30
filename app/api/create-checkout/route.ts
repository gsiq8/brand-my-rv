// app/api/create-checkout/route.js
import { cookies } from 'next/headers';
import { stripe, SITE } from '@/lib/server/stripe';

export async function POST() {
  const cookieStore = await cookies();

  const session = await stripe().checkout.sessions.create({
    line_items: [{ price: 'price', quantity: 1 }],
    mode: 'payment', // or 'subscription'
    success_url: `${SITE}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${SITE}/`,
    metadata: {
      datafast_visitor_id: cookieStore.get('datafast_visitor_id')?.value ?? '',
      datafast_session_id: cookieStore.get('datafast_session_id')?.value ?? '',
    },
  });

  return Response.json({ sessionId: session.id });
}
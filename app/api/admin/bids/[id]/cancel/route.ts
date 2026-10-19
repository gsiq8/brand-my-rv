import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/server/admin';
import { db } from '@/lib/server/supabase';
import { stripe } from '@/lib/server/stripe';
import { refundStripe } from '@/lib/server/refunds';

// Cancels a bid that is not live yet and refunds what Stripe holds. Live bids (status paid) are refused.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdmin(req)) return new NextResponse('Unauthorized', { status: 401 });
  const { id } = await params;

  const { data: bid } = await db().from('bids').select('*').eq('id', id).single();
  if (!bid) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (bid.status === 'paid') return NextResponse.json({ error: 'Already live, cannot cancel' }, { status: 400 });
  if (bid.status === 'cancelled') return NextResponse.json({ ok: true, refunded: 0, manualRefundDue: 0 });

  const s = stripe();
  // Best effort: stop the customer from paying something you just cancelled.
  if (bid.stripe_invoice_id) {
    try { await s.invoices.voidInvoice(bid.stripe_invoice_id); } catch (e) { console.error('void invoice', e); }
  }
  if (bid.stripe_session_id && bid.status === 'awaiting_payment') {
    try { await s.checkout.sessions.expire(bid.stripe_session_id); } catch (e) { console.error('expire session', e); }
  }

  // Money was taken (deposit or full): refund first, cancel only if the refund went through.
  let refunded = 0, manualRefundDue = 0;
  if (bid.status !== 'awaiting_payment') {
    try { refunded = (await refundStripe(bid)) / 100; }
    catch (e) { console.error('refund failed', e); return NextResponse.json({ error: `Stripe refund failed, bid NOT cancelled: ${String(e)}` }, { status: 502 }); }
    // part paid outside Stripe (transfer, cash) has to be returned by hand
    manualRefundDue = Math.max(0, (bid.status === 'review' ? bid.amount : bid.deposit) - refunded);
  }

  const { error } = await db().from('bids').update({
    status: 'cancelled', refunded_at: new Date().toISOString(),
    ...(manualRefundDue > 0 ? { refund_note: `manual refund due: ${manualRefundDue}` } : {}),
  }).eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, refunded, manualRefundDue });
}
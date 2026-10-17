import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/server/admin';
import { db } from '@/lib/server/supabase';
import { stripe } from '@/lib/server/stripe';

// Cancels a bid that was never fulfilled. Paid bids (logo already live) are refused.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdmin(req)) return new NextResponse('Unauthorized', { status: 401 });
  const { id } = await params;

  const { data: bid } = await db().from('bids')
    .select('id, status, stripe_session_id, stripe_invoice_id').eq('id', id).single();
  if (!bid) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (bid.status === 'paid') return NextResponse.json({ error: 'Already paid, cannot cancel' }, { status: 400 });
  if (bid.status === 'cancelled') return NextResponse.json({ ok: true });

  const s = stripe();
  // Best effort: stop the customer from paying something you just cancelled.
  if (bid.stripe_invoice_id) {
    try { await s.invoices.voidInvoice(bid.stripe_invoice_id); } catch (e) { console.error('void invoice', e); }
  }
  if (bid.stripe_session_id && bid.status === 'awaiting_payment') {
    try { await s.checkout.sessions.expire(bid.stripe_session_id); } catch (e) { console.error('expire session', e); }
  }

  const { error } = await db().from('bids').update({ status: 'cancelled' }).eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/server/admin';
import { db } from '@/lib/server/supabase';
import { stripe } from '@/lib/server/stripe';

// Sends the BALANCE (bid – deposit) as a Stripe invoice. The customer can pay by bank transfer, card, etc.,
// depending on what you enabled in Stripe (Settings > Billing > Invoices). When it is paid, the
// `invoice.paid` webhook marks the bid as paid and publishes the logo.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdmin(req)) return new NextResponse('Unauthorized', { status: 401 });
  const { id } = await params;
  const { data: bid } = await db().from('bids').select('*, bidders(*)').eq('id', id).single();
  if (!bid || !bid.bidders) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const remaining = bid.amount - bid.deposit;
  if (remaining <= 0) return NextResponse.json({ error: 'Nothing left to invoice' }, { status: 400 });

  const s = stripe();
  const customer = await s.customers.create({
    name: bid.bidders.name, email: bid.bidders.email, phone: bid.bidders.phone,
    address: { line1: bid.bidders.address }, metadata: { bid_id: id },
  });
  const invoice = await s.invoices.create({
    customer: customer.id, collection_method: 'send_invoice', days_until_due: 7,
    currency: bid.currency, metadata: { bid_id: id }, auto_advance: false,
  });
  await s.invoiceItems.create({
    customer: customer.id, invoice: invoice.id!, currency: bid.currency, amount: remaining * 100,
    description: `Ad spot ${bid.spot_id} – balance (bid ${bid.amount}, deposit ${bid.deposit} already paid)`,
  });
  const finalized = await s.invoices.finalizeInvoice(invoice.id!);
  await s.invoices.sendInvoice(finalized.id!);
  await db().from('bids').update({ status: 'invoiced', stripe_invoice_id: finalized.id }).eq('id', id);
  return NextResponse.json({ ok: true, hostedUrl: finalized.hosted_invoice_url });
}

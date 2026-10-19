import { db } from './supabase';
import { SITE, stripe } from './stripe';
import { notifyAdmin } from './notify';
import { klaviyoTrack } from './klaviyo';
import { notifyBidder, tgLink } from './telegram';
import { SPOTS } from '@/lib/spots';
import { CONFIG } from '@/lib/config';

type Bidder = { name?: string; phone?: string; email?: string };
type Bid = {
  id: string; spot_id: string; amount: number; deposit: number; status: string; display_name: string;
  payment_intent_id: string | null; stripe_invoice_id: string | null;
  bidders?: Bidder | Bidder[] | null;
};

/** Every succeeded Stripe payment tied to this bid: Checkout (deposit or full) + balance invoice. */
async function paymentIntentsOf(bid: Bid): Promise<string[]> {
  const s = stripe(), ids = new Set<string>();
  if (bid.payment_intent_id) ids.add(bid.payment_intent_id);
  else {   // bids paid before payment_intent_id was saved: Checkout copied bid_id to the PaymentIntent metadata
    const found = await s.paymentIntents.search({ query: `metadata['bid_id']:'${bid.id}' AND status:'succeeded'` });
    found.data.forEach((p) => ids.add(p.id));
  }
  if (bid.stripe_invoice_id) {
    const pays = await s.invoicePayments.list({ invoice: bid.stripe_invoice_id, status: 'paid' });
    for (const p of pays.data) {
      const pi = p.payment.payment_intent;
      if (pi) ids.add(typeof pi === 'string' ? pi : pi.id);
    }
  }
  return [...ids];
}

/** Refunds everything Stripe holds for this bid. Returns the refunded amount in cents. */
export async function refundStripe(bid: Bid): Promise<number> {
  const s = stripe();
  let cents = 0;
  for (const pi of await paymentIntentsOf(bid)) {
    const intent = await s.paymentIntents.retrieve(pi);
    try {
      await s.refunds.create(
        { payment_intent: pi, reason: 'requested_by_customer', metadata: { bid_id: bid.id, why: 'outbid' } },
        { idempotencyKey: `outbid-${bid.id}-${pi}` },
      );
    } catch (e) {
      if ((e as { code?: string }).code !== 'charge_already_refunded') throw e;
    }
    cents += intent.amount_received;
  }
  return cents;
}

type Top = { id: string; display_name: string; amount: number };

/** Tells the bidder who lost the spot (email via Klaviyo flow + Telegram if connected). Never throws. */
async function tellOutbid(b: Bid, top: Top, spotName: string) {
  const email = (Array.isArray(b.bidders) ? b.bidders[0] : b.bidders)?.email;
  const winBack = top.amount + CONFIG.bidStep;
  await Promise.allSettled([
    klaviyoTrack(email, 'Bid Outbid', {
      brand: b.display_name, outbidder: top.display_name, spot: spotName,
      your_bid: b.amount, top_bid: top.amount, min_to_win_back: winBack, site_url: SITE, telegram_link: tgLink(b.id),
    }, `outbid-${b.id}-${top.id}`),
    notifyBidder(email, `${top.display_name} outbid your spot "${spotName}" with $${top.amount}. Win it back with $${winBack} or more at ${SITE}.`),
  ]);
}

/**
 * Call after any bid becomes paid. Finds everyone who can no longer hold the spot and refunds them:
 *  - paid bids that are not the top paid bid (the old leader, or a lower bid that paid late)
 *  - deposit offers (pending_offer / invoiced) at or below the top paid bid, which can never win now
 * No-refund spots (the corner) refund nothing, but the previous holder is still told.
 */
export async function refundOutbid(spotId: string) {
  const spot = SPOTS.find((x) => x.id === spotId);
  if (!spot) return;

  const { data } = await db().from('bids').select('*, bidders(name, phone, email)')
    .eq('spot_id', spotId).in('status', ['paid', 'pending_offer', 'invoiced']).is('refunded_at', null);
  const rows = (data ?? []) as (Bid & { paid_at: string | null })[];
  const top = rows.filter((r) => r.status === 'paid')
    .sort((a, b) => b.amount - a.amount || +new Date(a.paid_at ?? 0) - +new Date(b.paid_at ?? 0))[0];
  if (!top) return;

  if (spot.noRefund) {   // keeps no marker, so only the holder right below the new top is told
    const prev = rows.filter((r) => r.status === 'paid' && r.id !== top.id).sort((a, b) => b.amount - a.amount)[0];
    if (prev) await tellOutbid(prev, top, spot.name);
    return;
  }

  for (const b of rows.filter((r) => r.id !== top.id && (r.status === 'paid' || r.amount <= top.amount))) {
    // Claim first, atomically, so a retried webhook can't refund twice.
    const { data: claimed } = await db().from('bids')
      .update({ refunded_at: new Date().toISOString(), ...(b.status === 'paid' ? {} : { status: 'cancelled' }) })
      .eq('id', b.id).is('refunded_at', null).select('id');
    if (!claimed?.length) continue;

    const bidder = Array.isArray(b.bidders) ? b.bidders[0] : b.bidders;
    const who = `${bidder?.name ?? b.display_name} · ${bidder?.phone ?? '-'} · ${bidder?.email ?? '-'}`;
    await tellOutbid(b, top, spot.name);
    try {
      if (b.status === 'invoiced' && b.stripe_invoice_id) {   // stop them paying an invoice for a lost spot
        try { await stripe().invoices.voidInvoice(b.stripe_invoice_id); } catch (e) { console.error('void invoice', e); }
      }
      const refunded = await refundStripe(b);
      const expected = (b.status === 'paid' ? b.amount : b.deposit) * 100;   // what the customer should have paid in total
      const manual = Math.max(0, expected - refunded) / 100;                  // the part that never went through Stripe
      const line = `Spot ${b.spot_id}: outbid by ${top.display_name} (${top.amount}).\n${who}\nRefunded automatically via Stripe: ${refunded / 100}`;
      if (manual > 0) {
        await db().from('bids').update({ refund_note: `manual refund due: ${manual}` }).eq('id', b.id);
        await notifyAdmin('REFUND BY HAND', `${line}\nYOU MUST REFUND ${manual} OUTSIDE STRIPE (they paid you by transfer or similar).`);
      } else {
        await notifyAdmin('Outbid - refunded', line);
      }
    } catch (e) {
      console.error('refund failed', b.id, e);
      await db().from('bids').update({ refund_note: `refund failed: ${String(e)}` }).eq('id', b.id);
      await notifyAdmin('REFUND FAILED', `Spot ${b.spot_id}: ${who}\nRefund it in the Stripe Dashboard.\n${String(e)}`);
    }
  }
}
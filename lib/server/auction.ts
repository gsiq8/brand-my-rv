import type Stripe from 'stripe';
import { db } from './supabase';
import { SITE, stripe } from './stripe';
import { notifyAdmin, notifyPaid } from './notify';
import { klaviyoTrack, klaviyoAddToList, type KlaviyoMetric } from './klaviyo';
import { notifyBidder, tgLink } from './telegram';
import { SPOTS, isRv } from '@/lib/spots';
import { CONFIG } from '@/lib/config';
import { closeAt, defaultCaptureCents } from '@/lib/pricing';
import { money } from '@/lib/format';

/**
 * Bid status:
 *   awaiting_payment -> review      card hold confirmed (timer starts on timed spots)
 *   review -> paid                  logo approved: LIVE, sets the price, releases the previous leader
 *   review|paid -> cancelled        refused / expired
 *   paid -> outbid                  a higher live bid went live; hold released
 *   paid -> won                     spot closed with this as the top live bid
 *   won -> settled                  wire received; hold released
 *   won -> defaulted                wire late; media fee captured, rest of the hold released
 * The Strip is not timed: it is charged at checkout, and refused payments are refunded.
 * Money changes always happen AFTER the status change, so the webhook sees no "surprise" cancel.
 */

const BID = '*, bidders(name, phone, email, list_consent)';
type Bidder = { name: string; phone: string; email: string; list_consent: boolean };
export type BidRow = {
  id: string; spot_id: string; bidder_id: string; display_name: string; amount: number; currency: string;
  status: string; upload_path: string; logo_path: string | null; logo_approved: boolean; website: string | null;
  payment_intent_id: string | null; stripe_session_id: string | null; created_at: string;
  bidders: Bidder | Bidder[] | null;
};

const spotOf = (id: string) => SPOTS.find((s) => s.id === id);
const spotName = (id: string) => spotOf(id)?.name ?? id;
const isTimed = (id: string) => { const s = spotOf(id); return !!s && isRv(s); };
const bidderOf = (b: BidRow) => (Array.isArray(b.bidders) ? b.bidders[0] : b.bidders) ?? undefined;
const emailOf = (b: BidRow) => bidderOf(b)?.email;
const tell = (b: BidRow, text: string) => notifyBidder(emailOf(b), text);
const track = (b: BidRow, metric: KlaviyoMetric, extra: Record<string, unknown> = {}) =>
  klaviyoTrack(emailOf(b), metric,
    { brand: b.display_name, spot: spotName(b.spot_id), bid_amount: b.amount, site_url: SITE, ...extra },
    `${metric}-${b.id}`);

export const logoUrl = (path: string) => db().storage.from('logos').getPublicUrl(path).data.publicUrl;

async function findBid(id: string) {
  const { data, error } = await db().from('bids').select(BID).eq('id', id).maybeSingle();
  if (error) throw error;
  return (data as unknown as BidRow | null) ?? null;
}
async function mustBid(id: string) {
  const b = await findBid(id);
  if (!b) throw new Error(`bid not found: ${id}`);
  return b;
}

/** True while the spot still accepts bids (open, and the timer has not passed). */
async function auctionOpen(spotId: string) {
  const { data } = await db().from('spot_auctions').select('status, closes_at').eq('spot_id', spotId).maybeSingle();
  return !data || (data.status === 'open' && (!data.closes_at || new Date(data.closes_at) > new Date()));
}

/** Starts the countdown once. Idempotent: safe on webhook retries. */
export async function startTimer(spotId: string) {
  await db().from('spot_auctions').upsert({ spot_id: spotId }, { onConflict: 'spot_id', ignoreDuplicates: true });
  const { error } = await db().from('spot_auctions')
    .update({ closes_at: closeAt(new Date()).toISOString() })
    .eq('spot_id', spotId).eq('status', 'open').is('closes_at', null);
  if (error) throw error;
}

/** Releases money for a bid: cancels an uncaptured hold, or refunds a captured payment (the Strip). */
async function releaseMoney(pi: string | null) {
  if (!pi) return;
  const s = stripe();
  const intent = await s.paymentIntents.retrieve(pi);
  if (intent.status === 'requires_capture') await s.paymentIntents.cancel(pi);
  else if (intent.status === 'succeeded') await s.refunds.create({ payment_intent: pi });
}

async function publishLogo(b: BidRow) {
  const { data, error } = await db().storage.from('logo-uploads').download(b.upload_path);
  if (error || !data) throw error ?? new Error('logo missing');
  const path = `${b.spot_id}/${b.id}.png`;
  const up = await db().storage.from('logos').upload(path, data, { contentType: 'image/png', upsert: true });
  if (up.error) throw up.error;
  return path;
}

/* ---------- Stripe webhook entry points ---------- */

export async function onSessionCompleted(session: Stripe.Checkout.Session) {
  const id = session.metadata?.bid_id;
  if (!id) return;
  const pi = typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id ?? null;

  const cur = await findBid(id);
  if (!cur || cur.status !== 'awaiting_payment') return;          // duplicate webhook, or already handled

  if (isTimed(cur.spot_id)) {
    if (!(await auctionOpen(cur.spot_id))) {                       // the spot closed while checkout was open
      await refuse({ ...cur, payment_intent_id: pi }, 'the auction closed before your hold was confirmed.');
      return;
    }
    await startTimer(cur.spot_id);                                 // timer starts with the first confirmed hold
  }

  const { data, error } = await db().from('bids')
    .update({ status: 'review', payment_intent_id: pi })
    .eq('id', id).eq('status', 'awaiting_payment').select(BID);
  if (error) throw error;
  const b = data?.[0] as unknown as BidRow | undefined;
  if (!b) return;

  await Promise.allSettled([
    track(b, 'Bid Placed', { telegram_link: tgLink(b.id) }),
    bidderOf(b)?.list_consent ? klaviyoAddToList(emailOf(b), b.display_name) : Promise.resolve(),
    tell(b, `We received your ${isTimed(b.spot_id) ? 'card hold' : 'payment'} for ${spotName(b.spot_id)}. It goes live once your logo is approved.`),
    notifyAdmin('Logo approval needed', `${b.display_name} · ${spotName(b.spot_id)} · ${money(b.amount)} · ${SITE}/admin`),
  ]);
}

export async function onSessionExpired(session: Stripe.Checkout.Session) {
  const id = session.metadata?.bid_id;
  if (id) await db().from('bids').update({ status: 'cancelled', refund_note: 'checkout expired' })
    .eq('id', id).eq('status', 'awaiting_payment');
}

/** Stripe released a hold on its own (e.g. authorization expired). Our own releases set the status first, so they are ignored here. */
export async function onPaymentCanceled(pi: Stripe.PaymentIntent) {
  const id = pi.metadata?.bid_id;
  if (!id) return;
  const b = await findBid(id);
  if (!b) return;
  if (b.status === 'review') {
    await db().from('bids').update({ status: 'cancelled', refund_note: 'hold released by Stripe' }).eq('id', id).eq('status', 'review');
    await tell(b, 'Your card hold was released before the logo was approved. Please place the bid again.');
  } else if (b.status === 'paid' || b.status === 'won') {
    await notifyAdmin('LIVE HOLD LOST', `${b.display_name} on ${spotName(b.spot_id)}: Stripe released the hold. Collect manually or refuse.`);
  }
}

/* ---------- Admin actions ---------- */

/** Logo approved. If the bid is in review, it goes live now. */
export async function approveLogo(bidId: string) {
  const b = await mustBid(bidId);
  if (b.status !== 'review' && b.status !== 'paid') throw new Error(`bid is ${b.status}`);
  if (b.status === 'paid') return;
  await db().from('bids').update({ logo_approved: true }).eq('id', b.id);
  await track(b, 'Logo Approved');
  await goLive(b);
}

async function goLive(b: BidRow) {
  const { data: top } = await db().from('bids').select('amount')
    .eq('spot_id', b.spot_id).eq('status', 'paid').order('amount', { ascending: false }).limit(1);
  const floor = top?.[0] ? top[0].amount + CONFIG.bidStep : (spotOf(b.spot_id)?.price ?? 0);
  if (b.amount < floor) return refuse(b, `another bid went live first, and the minimum is now ${money(floor)}.`);
  const { data: spot } = await db().from('spot_auctions')
  .select('status, closes_at').eq('spot_id', b.spot_id).maybeSingle();
  if (spot && (spot.status !== 'open' || (spot.closes_at && new Date(spot.closes_at) <= new Date()))) {
  return refuse(b, 'the auction closed before your logo was approved.');
}

  const logo_path = await publishLogo(b);
  const { data: moved, error } = await db().from('bids')
    .update({ status: 'paid', logo_path, logo_approved: true, paid_at: new Date().toISOString() } as Record<string, unknown>)
    .eq('id', b.id).eq('status', 'review').select('id');
  if (error) throw error;
  if (!moved?.length) return;

  const { data: previous } = await db().from('bids').select(BID)
    .eq('spot_id', b.spot_id).eq('status', 'paid').neq('id', b.id);
  for (const p of (previous ?? []) as unknown as BidRow[]) await outbid(p, b.amount);

  if (isTimed(b.spot_id)) await startTimer(b.spot_id);             // fallback, normally already running
  await Promise.allSettled([notifyPaid(b), tell(b, `Your logo is live on ${spotName(b.spot_id)} at ${money(b.amount)}.`)]);
}

async function outbid(p: BidRow, newTop: number) {
  await db().from('bids').update({ status: 'outbid' }).eq('id', p.id).eq('status', 'paid');
  if (isTimed(p.spot_id)) {
    try { await releaseMoney(p.payment_intent_id); }
    catch (e) { await notifyAdmin('Hold release failed', `${p.display_name} on ${spotName(p.spot_id)}: ${String(e)}`); }
  }
  const minToWin = newTop + CONFIG.bidStep;
  await Promise.allSettled([
    track(p, 'Bid Outbid', { top_bid: newTop, min_to_win_back: minToWin }),
    tell(p, `You were outbid on ${spotName(p.spot_id)}. The top bid is now ${money(newTop)}. Bid at least ${money(minToWin)} to win back your spot at ${SITE}.${isTimed(p.spot_id) ? ' Your card hold is released.' : ''}`),
  ]);
}

async function refuse(b: BidRow, reason: string) {
  await db().from('bids').update({ status: 'cancelled', refund_note: reason }).eq('id', b.id);
  await releaseMoney(b.payment_intent_id);
  await Promise.allSettled([
    track(b, 'Bid Refused'),
    tell(b, `Your bid on ${spotName(b.spot_id)} was not accepted: ${reason} Any hold is released and any payment refunded.`),
  ]);
}

/** Refuse a bid. Refusing a live bid does NOT reinstate the bids it outbid. */
export async function cancelBid(bidId: string) {
  const b = await mustBid(bidId);
  if (!['awaiting_payment', 'review', 'paid'].includes(b.status))
    throw new Error(`a bid that is ${b.status} cannot be cancelled`);

  let pi = b.payment_intent_id;
  if (b.stripe_session_id) {
    const s = stripe();
    const session = await s.checkout.sessions.retrieve(b.stripe_session_id);
    if (session.status === 'open') await s.checkout.sessions.expire(session.id);
    // the hold lives on the PaymentIntent; recover it if the webhook never saved it
    pi = pi ?? (typeof session.payment_intent === 'string'
      ? session.payment_intent
      : session.payment_intent?.id ?? null);
  }

  if (b.status === 'review') await track(b, 'Logo Refused');
  await refuse({ ...b, payment_intent_id: pi }, 'refused by the organizer.');
}

/** Wire received for a won spot. Releases the hold and closes the spot as sold. */
export async function settleBid(bidId: string) {
  const b = await mustBid(bidId);
  if (b.status !== 'won') throw new Error(`only a won bid can be settled (this one is ${b.status})`);
  await db().from('bids').update({ status: 'settled' }).eq('id', b.id).eq('status', 'won');
  await db().from('spot_auctions').update({ status: 'settled' }).eq('spot_id', b.spot_id);
  await releaseMoney(b.payment_intent_id);
  await tell(b, `Payment received for ${spotName(b.spot_id)}. Thank you.`);
}

/* ---------- Scheduled (called by /api/cron/close) ---------- */

/** Closes spots whose timer has run out. Waits while any hold is still in review, so no live-looking bid is ignored. */
/** Closes spots whose timer has run out. Does not wait for logo reviews: a late approval is refused in goLive. */
export async function closeDueAuctions() {
  const { data: due } = await db().from('spot_auctions').select('spot_id')
    .eq('status', 'open').not('closes_at', 'is', null).lte('closes_at', new Date().toISOString());
  const closed: string[] = [];

  for (const { spot_id } of due ?? []) {
    const { data: top } = await db().from('bids').select(BID)
      .eq('spot_id', spot_id).eq('status', 'paid')
      .order('amount', { ascending: false }).order('created_at', { ascending: true }).limit(1);
    const w = top?.[0] as unknown as BidRow | undefined;

    if (!w) {                                                       // nobody live: reopen, timer restarts with next hold
      await db().from('spot_auctions').update({ closes_at: null }).eq('spot_id', spot_id).eq('status', 'open');
      continue;
    }

    // Claim the winner first. If another run already did, this matches no rows and we stop.
    const { data: marked } = await db().from('bids').update({ status: 'won' })
      .eq('id', w.id).eq('status', 'paid').select('id');
    if (!marked?.length) continue;

    const wireBy = new Date(Date.now() + CONFIG.wireHours * 3600e3).toISOString();
    await db().from('spot_auctions').update({
      status: 'closed', winner_bid_id: w.id, closed_at: new Date().toISOString(), wire_deadline_at: wireBy,
    }).eq('spot_id', spot_id).eq('status', 'open');
    closed.push(spot_id);

    await Promise.allSettled([
      track(w, 'Bid Won'),
      tell(w, `You won ${spotName(spot_id)} at ${money(w.amount)}. The contract and invoice are on the way. Sign and wire within ${CONFIG.wireHours} hours.`),
      notifyAdmin('Spot closed', `${spotName(spot_id)}: ${w.display_name} at ${money(w.amount)}. Wire due ${wireBy}.`),
    ]);
  }
  return closed;
}

/** Winners who missed the wire window: capture the media fee, release the rest of the hold. */
export async function defaultDueAuctions() {
  const { data: due } = await db().from('spot_auctions').select('spot_id, winner_bid_id')
    .eq('status', 'closed').lte('wire_deadline_at', new Date().toISOString());
  const out: string[] = [];

  for (const d of due ?? []) {
    const { data } = await db().from('bids').select(BID).eq('id', d.winner_bid_id).maybeSingle();
    const w = data as unknown as BidRow | null;
    if (!w || w.status !== 'won' || !w.payment_intent_id) continue;

    const cents = defaultCaptureCents(w.amount);
    try {
      // Stripe releases the uncaptured remainder automatically: no refund needed.
      await stripe().paymentIntents.capture(w.payment_intent_id, { amount_to_capture: cents });
    } catch (e) {
      await notifyAdmin('DEFAULT CAPTURE FAILED', `${w.display_name} on ${spotName(w.spot_id)}: ${String(e)}. Charge manually or check the hold.`);
      continue;
    }
    await db().from('bids').update({ status: 'defaulted', refund_note: `media fee captured: ${cents / 100}` }).eq('id', w.id);
    await db().from('spot_auctions').update({
      status: 'open',
      closes_at: null,
      winner_bid_id: null,
      wire_deadline_at: null,
    }).eq('spot_id', d.spot_id);
    await Promise.allSettled([
      tell(w, `The wire was not received in time, so a ${CONFIG.defaultPercent}% media exposure fee was charged to your card. The rest of the hold was released.`),
      notifyAdmin('Spot defaulted', `${spotName(w.spot_id)}: fee ${cents / 100} captured from ${w.display_name}.`),
    ]);
    out.push(d.spot_id);
  }
  return out;
}
import { db } from './supabase';
import { after } from 'next/server';
import { notifyPaid, notifyLogoCheck } from './notify';
import { refundOutbid } from './refunds';
import { klaviyoTrack, klaviyoAddToList } from './klaviyo';
import { notifyBidder, tgLink } from './telegram';
import { SITE } from './stripe';
import { SPOTS } from '@/lib/spots';

export type Leader = { name: string; amount: number; logoPath: string | null };

/** Highest PAID bid per spot (paid = payment cleared AND logo approved). */
export async function topBids(): Promise<Record<string, Leader>> {
  const { data, error } = await db()
    .from('bids').select('spot_id, display_name, amount, logo_path')
    .eq('status', 'paid').order('amount', { ascending: false });
  if (error) throw error;
  const out: Record<string, Leader> = {};
  for (const r of data ?? []) if (!out[r.spot_id]) out[r.spot_id] = { name: r.display_name, amount: r.amount, logoPath: r.logo_path };
  return out;
}

export async function pendingCounts(): Promise<Record<string, number>> {
  const { data, error } = await db().from('bids').select('spot_id').eq('status', 'pending_offer');
  if (error) throw error;
  const out: Record<string, number> = {};
  for (const r of data ?? []) out[r.spot_id] = (out[r.spot_id] ?? 0) + 1;
  return out;
}

export const logoUrl = (path: string) => db().storage.from('logos').getPublicUrl(path).data.publicUrl;

/** Copy the uploaded logo to the public bucket (this is the moment the image is "disclosed"). */
async function publishLogo(bid: { id: string; spot_id: string; upload_path: string }) {
  const { data, error } = await db().storage.from('logo-uploads').download(bid.upload_path);
  if (error || !data) throw error ?? new Error('logo missing');
  const path = `${bid.spot_id}/${bid.id}.png`;
  const up = await db().storage.from('logos').upload(path, data, { contentType: 'image/png', upsert: true });
  if (up.error) throw up.error;
  return path;
}

const BID = '*, bidders(name, phone, email)';

const emailOf = (b: { bidders?: unknown }) =>
  ((Array.isArray(b.bidders) ? b.bidders[0] : b.bidders) as { email?: string } | null | undefined)?.email;

/** Payment confirmed: add to the Klaviyo list, email (Klaviyo flow) + Telegram (if connected). Never throws. */
export async function bidPlaced(bid: { id: string; spot_id: string; amount: number; display_name: string; bidders?: unknown }, paidNow: number, category: string) {
  const email = emailOf(bid), spot = SPOTS.find((s) => s.id === bid.spot_id)?.name ?? bid.spot_id;
  await Promise.allSettled([
    klaviyoAddToList(email, bid.display_name),
    klaviyoTrack(email, 'Bid Placed', { brand: bid.display_name, spot, bid_amount: bid.amount, paid_now: paidNow, category, telegram_link: tgLink(bid.id), site_url: SITE }, `placed-${bid.id}-${category}`),
    notifyBidder(email, `Payment received: $${paidNow} (${category}) for ${spot}. Your logo is reviewed before it goes live.`),
  ]);
}

/** Paid + approved logo: publish it and make the bid the leader. */
async function goLive(bid: { id: string; spot_id: string; upload_path: string; paid_at: string | null }) {
  const logo_path = await publishLogo(bid);
  const { error } = await db().from('bids')
    .update({ status: 'paid', logo_path, paid_at: bid.paid_at ?? new Date().toISOString() }).eq('id', bid.id);
  if (error) throw error;
  // outbid refunds wait until here, so a logo that gets refused never costs the current leader the spot
  after(async () => { await notifyPaid(bid); await refundOutbid(bid.spot_id); });
}

/** Idempotent: safe to call twice (Stripe retries webhooks). Full payment cleared, logo may still need review. */
export async function markPaid(bidId: string) {
  const { data: bid, error } = await db().from('bids').select(BID).eq('id', bidId).single();
  if (error || !bid) throw new Error(`bid not found: ${bidId} ${error?.message}`);
  if (['paid', 'cancelled', 'review'].includes(bid.status)) return;

  if (bid.payment_mode === 'full') after(() => bidPlaced(bid, bid.amount, 'full payment'));   // deposit bids were announced at the deposit
  if (bid.logo_approved) return goLive(bid);

  const { error: e2 } = await db().from('bids').update({ status: 'review', paid_at: new Date().toISOString() }).eq('id', bidId);
  if (e2) throw e2;
  after(() => notifyLogoCheck(bid, bid.amount, 'full payment'));
}

/** Admin OK on the logo. If the money is already in, the bid goes live now; otherwise it goes live when the balance is paid. */
export async function approveLogo(bidId: string) {
  const { data: bid, error } = await db().from('bids').select(BID).eq('id', bidId).single();
  if (error || !bid) throw new Error('bid not found');
  if (bid.status === 'awaiting_payment' || bid.status === 'cancelled') throw new Error(`bid is ${bid.status}`);
  if (!bid.logo_approved) {
    const { error: e2 } = await db().from('bids').update({ logo_approved: true }).eq('id', bidId);
    if (e2) throw e2;
  }
  if (bid.status === 'review') await goLive(bid);
}
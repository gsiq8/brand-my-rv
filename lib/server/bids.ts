import { db } from './supabase';

export type Leader = { name: string; amount: number; logoPath: string | null };

/** Highest PAID bid per spot. */
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

/** Idempotent: safe to call twice (Stripe retries webhooks). */
export async function markPaid(bidId: string) {
  const { data: bid } = await db().from('bids').select('*').eq('id', bidId).single();
  if (!bid || bid.status === 'paid' || bid.status === 'cancelled') return;
  const logo_path = await publishLogo(bid);
  await db().from('bids').update({ status: 'paid', logo_path, paid_at: new Date().toISOString() }).eq('id', bidId);
}

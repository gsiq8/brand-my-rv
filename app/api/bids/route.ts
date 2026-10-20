import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { SPOTS, brandAllowed, TRUCK_ONLY_MSG, BUILDER_ONLY_MSG } from '@/lib/spots';
import { CONFIG } from '@/lib/config';
import { minBidFor } from '@/lib/pricing';
import { db } from '@/lib/server/supabase';
import { SITE, stripe } from '@/lib/server/stripe';
import { topBids } from '@/lib/server/bids';
import { normalizeUrl } from '@/lib/url';

export const runtime = 'nodejs';

const fail = (error: string, status = 400) => NextResponse.json({ error }, { status });
const clean = (v: unknown, max = 200) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

function parsePng(x: unknown): Buffer | null {
  if (typeof x !== 'string') return null;
  const m = /^data:image\/png;base64,([A-Za-z0-9+/=]+)$/.exec(x);
  if (!m) return null;
  const buf = Buffer.from(m[1], 'base64');
  const isPng = buf.length > 8 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47;
  return isPng && buf.length <= 2_000_000 ? buf : null;
}

export async function POST(req: Request) {
  if (CONFIG.auctionEnd && Date.now() > new Date(CONFIG.auctionEnd).getTime())
    return fail('The auction has ended.');

  let b: Record<string, unknown>;
  try { b = await req.json(); } catch { return fail('Invalid request'); }

  const spot = SPOTS.find((s) => s.id === b.spotId);
  if (!spot) return fail('Unknown spot');

  const top = (await topBids())[spot.id];
  const min = minBidFor(spot, top ? top.amount : null);
  const amount = Number(b.amount);
  if (!Number.isInteger(amount) || amount < min || amount > 1_000_000) return fail(`The minimum bid is ${min}.`);

  const f = { name: clean(b.name, 80), phone: clean(b.phone, 40), email: clean(b.email, 120), address: clean(b.address, 250), taxId: clean(b.taxId, 40) };
  if (Object.values(f).some((v) => !v)) return fail('Please fill in all fields.');
  if (!/^\S+@\S+\.\S+$/.test(f.email)) return fail('Invalid email.');
  if ((f.phone.match(/\d/g) ?? []).length < 8) return fail('Invalid phone number.');
  const website = normalizeUrl(clean(b.website, 300));
  if (!website) return fail('Enter a valid website.');
  if (!brandAllowed(spot, f.name)) return fail(spot.builderOnly ? BUILDER_ONLY_MSG : TRUCK_ONLY_MSG);

  const png = parsePng(b.logo);
  if (!png) return fail('The logo must be a PNG under 2 MB.');

  const id = randomUUID();
  const upload_path = `${id}.png`;

  const { data: bidder, error: e1 } = await db().from('bidders')
    .insert({ name: f.name, phone: f.phone, email: f.email, address: f.address, tax_id: f.taxId }).select('id').single();
  if (e1 || !bidder) { console.error('bidders insert', e1); return fail('Could not save your details.', 500); }
  const up = await db().storage.from('logo-uploads').upload(upload_path, png, { contentType: 'image/png' });
  if (up.error) { console.error('logo upload', up.error); return fail('Could not save your logo.', 500); }

  const { error: e2 } = await db().from('bids').insert({
    id, spot_id: spot.id, bidder_id: bidder.id, display_name: f.name, amount, currency: CONFIG.currency,
    payment_mode: 'full', deposit: 0, upload_path, website,
  });
  if (e2) { console.error('bids insert', e2); return fail('Could not save your bid.', 500); }

  try {
    const session = await stripe().checkout.sessions.create({
      mode: 'payment',
      customer_email: f.email,
      line_items: [{
        quantity: 1,
        price_data: {
          currency: CONFIG.currency,
          unit_amount: amount * 100,
          product_data: {
            name: `Ad spot: ${spot.name}`,
            description: `Bid ${amount} / ${spot.period ?? CONFIG.periodLabel} — card hold until auction close`,
          },
        },
      }],
      metadata: { bid_id: id, payment_flow: 'hold' },
      payment_intent_data: {
        capture_method: 'manual',
        metadata: { bid_id: id, payment_flow: 'hold' },
      },
      success_url: `${SITE}/bid/success?bid=${id}`,
      cancel_url: `${SITE}/?cancelled=1`,
      expires_at: Math.floor(Date.now() / 1000) + 3600,
    });

    const { error: e3 } = await db().from('bids').update({ stripe_session_id: session.id }).eq('id', id);
    if (e3) console.error('session id update failed', e3);
    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error(e);
    await db().from('bids').update({ status: 'cancelled' }).eq('id', id);
    return fail('Could not start the payment hold.', 502);
  }
}




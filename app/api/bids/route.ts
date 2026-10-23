import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { SPOTS, brandAllowed, isRv, TRUCK_ONLY_MSG, BUILDER_ONLY_MSG } from '@/lib/spots';
import { CONFIG } from '@/lib/config';
import { db } from '@/lib/server/supabase';
import { SITE, stripe } from '@/lib/server/stripe';
import { normalizeUrl } from '@/lib/url';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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

  const amount = Number(b.amount);
  if (!Number.isInteger(amount) || amount < 1 || amount > 1_000_000) return fail('Invalid amount.');

  const f = {
    name: clean(b.name, 80), phone: clean(b.phone, 40), email: clean(b.email, 120),
    address: clean(b.address, 250), taxId: clean(b.taxId, 40),
  };
  if (Object.values(f).some((v) => !v)) return fail('Please fill in all fields.');
  if (!/^\S+@\S+\.\S+$/.test(f.email)) return fail('Invalid email.');
  if ((f.phone.match(/\d/g) ?? []).length < 8) return fail('Invalid phone number.');
  const website = normalizeUrl(clean(b.website, 300));
  if (!website) return fail('Enter a valid website.');
  if (!brandAllowed(spot, f.name)) return fail(spot.builderOnly ? BUILDER_ONLY_MSG : TRUCK_ONLY_MSG);
  const png = parsePng(b.logo);
  if (!png) return fail('The logo must be a PNG under 2 MB.');
  const listConsent = b.listConsent === true;

  const id = randomUUID();
  const upload_path = `${id}.png`;
  const timed = isRv(spot);

  const { data: bidder, error: e1 } = await db().from('bidders')
    .insert({ name: f.name, phone: f.phone, email: f.email, address: f.address, tax_id: f.taxId, list_consent: listConsent })
    .select('id').single();
  if (e1 || !bidder) { console.error('bidders insert', e1); return fail('Could not save your details.', 500); }

  const undo = async () => {
    await db().from('bidders').delete().eq('id', bidder.id);
    await db().storage.from('logo-uploads').remove([upload_path]);
  };

  const up = await db().storage.from('logo-uploads').upload(upload_path, png, { contentType: 'image/png' });
  if (up.error) { console.error('logo upload', up.error); await undo(); return fail('Could not save your logo.', 500); }

  // Minimum, tie and closed-auction checks run inside the database, under a row lock.
  const { error: e2 } = await db().rpc('place_bid', {
    p_id: id, p_spot: spot.id, p_bidder: bidder.id, p_name: f.name, p_amount: amount,
    p_currency: CONFIG.currency, p_upload: upload_path, p_website: website,
    p_start: spot.price, p_step: CONFIG.bidStep,
  });
  if (e2) {
    await undo();
    const m = e2.message ?? '';
    if (m.includes('AUCTION_CLOSED')) return fail('This spot has closed.', 409);
    const min = /MIN_BID:(\d+)/.exec(m);
    if (min) return fail(`The minimum bid is ${min[1]}.`, 400);
    if (m.includes('TIED')) return fail('Someone just placed this exact amount. Bid a little higher.', 409);
    console.error('place_bid', e2);
    return fail('Could not save your bid.', 500);
  }

  try {
   const session = await stripe().checkout.sessions.create({
    mode: 'payment',
    payment_method_configuration: process.env.STRIPE_CARD_ONLY_CONFIG!,
    customer_email: f.email,
      line_items: [{
        quantity: 1,
        price_data: {
          currency: CONFIG.currency,
          unit_amount: amount * 100,
          product_data: {
            name: `Ad spot: ${spot.name}`,
            description: timed
              ? `Card hold of ${amount}, released if you are outbid or pay by wire`
              : `One-time payment of ${amount}, non-refundable`,
          },
        },
      }],
      metadata: { bid_id: id },
      payment_intent_data: {
        metadata: { bid_id: id },
        ...(timed ? { capture_method: 'manual' as const } : {}),
      },
      success_url: `${SITE}/bid/success?bid=${id}`,
      cancel_url: `${SITE}/?cancelled=1`,
      expires_at: Math.floor(Date.now() / 1000) + 3600,
    });
    await db().from('bids').update({ stripe_session_id: session.id }).eq('id', id);
    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error('checkout', e);
    await db().from('bids').update({ status: 'cancelled', refund_note: 'checkout not created' }).eq('id', id);
    return fail('Could not start the payment.', 502);
  }
}
import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { SPOTS } from '@/lib/spots';
import { CONFIG } from '@/lib/config';
import { depositFor, minBidFor } from '@/lib/pricing';
import { db } from '@/lib/server/supabase';
import { SITE, stripe } from '@/lib/server/stripe';
import { topBids } from '@/lib/server/bids';

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

  // The server decides the minimum – never trust the browser.
  const top = (await topBids())[spot.id];
  const min = minBidFor(spot, top ? top.amount : null);
  const amount = Number(b.amount);
  if (!Number.isInteger(amount) || amount < min || amount > 1_000_000) return fail(`The minimum bid is ${min}.`);

  const mode = b.mode === 'deposit' && !spot.noDeposit ? 'deposit' : 'full';
  const f = { name: clean(b.name, 80), phone: clean(b.phone, 40), email: clean(b.email, 120), address: clean(b.address, 250), taxId: clean(b.taxId, 40) };
  if (Object.values(f).some((v) => !v)) return fail('Please fill in all fields.');
  if (!/^\S+@\S+\.\S+$/.test(f.email)) return fail('Invalid email.');
  if ((f.phone.match(/\d/g) ?? []).length < 8) return fail('Invalid phone number.');
  const png = parsePng(b.logo);
  if (!png) return fail('The logo must be a PNG under 2 MB.');

  const id = randomUUID();
  const upload_path = `${id}.png`;

  const { data: bidder, error: e1 } = await db().from('bidders')
    .insert({ name: f.name, phone: f.phone, email: f.email, address: f.address, tax_id: f.taxId }).select('id').single();
  if (e1 || !bidder) return fail('Could not save your details.', 500);

  const up = await db().storage.from('logo-uploads').upload(upload_path, png, { contentType: 'image/png' });
  if (up.error) return fail('Could not save your logo.', 500);

  const deposit = mode === 'deposit' ? depositFor(amount) : 0;
  const { error: e2 } = await db().from('bids').insert({
    id, spot_id: spot.id, bidder_id: bidder.id, display_name: f.name, amount, currency: CONFIG.currency,
    payment_mode: mode, deposit, upload_path,
  });
  if (e2) return fail('Could not save your bid.', 500);

  try {
    const charge = mode === 'deposit' ? deposit : amount;
    const session = await stripe().checkout.sessions.create({
      mode: 'payment',
      customer_email: f.email,
      // No payment_method_types: Checkout shows the methods you enabled in the Stripe Dashboard.
      line_items: [{
        quantity: 1,
        price_data: {
          currency: CONFIG.currency,
          unit_amount: charge * 100,
          product_data: {
            name: `${mode === 'deposit' ? 'Deposit – ' : ''}Ad spot: ${spot.name}`,
            description: `Bid ${amount} / ${spot.period ?? CONFIG.periodLabel}`,
          },
        },
      }],
      metadata: { bid_id: id },
      payment_intent_data: { metadata: { bid_id: id } },
      success_url: `${SITE}/bid/success?bid=${id}`,
      cancel_url: `${SITE}/?cancelled=1`,
      expires_at: Math.floor(Date.now() / 1000) + 3600,
    });
    await db().from('bids').update({ stripe_session_id: session.id }).eq('id', id);
    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error(e);
    await db().from('bids').update({ status: 'cancelled' }).eq('id', id);
    return fail('Could not start the payment.', 502);
  }
}

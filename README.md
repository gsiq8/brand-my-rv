# Motorhome ads – Next.js + Supabase + Stripe

3D motorhome (turnable, 6 ad spots) where brands bid for a spot: pick spot + logo + amount → details → pay (Stripe Checkout)
or reserve with a deposit. When a payment is confirmed the logo goes live and the bid board updates.

> This code was written without being run or type-checked. Expect to fix small things on the first `npm run dev` / `npm run build`.

## 1. Setup
1. `npm install`
2. Copy `.env.example` to `.env.local` and fill it in.
3. Supabase: open the SQL editor and run `supabase/001_init.sql` (tables + the two storage buckets), then `supabase/002_visits.sql` (visitor counter).
4. Stripe: Dashboard > Settings > Payment methods – enable what you want (cards, Pix, PayPal…). Checkout shows only enabled methods.
5. Webhook – send these events to `/api/stripe/webhook`:
   `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`,
   `checkout.session.expired`, `invoice.paid`.
   Locally: `stripe listen --forward-to localhost:3000/api/stripe/webhook` (it prints the `whsec_…` secret for `.env.local`).
6. `npm run dev` → http://localhost:3000   ·   admin: http://localhost:3000/admin (uses `ADMIN_SECRET`)

## 2. Page structure (same order as the Brand My Mac page)
Header (logo, nav: The auction · Leaderboard · Replay · The corner, **Get a spot**) → "Previously here" strip + current corner holder with **Claim** →
Hero: headline, sub, raised (+goal), view switch, **3D motorhome**, **The auction / Final look** switch, "Tap any spot…", pitch + buttons → **counter line (views on social · visitors · spots sold)** →
intro headline → "N of M spots taken" → **The auction, live.** (price tiers) → Top brands → All spots (filter tabs, bid count) → Day by day →
How it works → What the money buys (specs) → Questions & answers → The corner (holders + how long each held it) → About you → Footer.
Bidding opens in a side drawer so the motorhome stays visible while a logo is previewed. Also `/leaderboard`, `/replay`, `/privacy`, `/terms`, `/admin`.

## 3. Where things are
| What | File |
|---|---|
| **All page text** (headline, steps, specs, FAQ, your bio) – look for `[brackets]` | `lib/site.ts` |
| **Ad spots** (position, size, starting price, the website "corner") | `lib/spots.ts` |
| Currency, bid step, deposit rule, goal, motorhome length, sky/panorama | `lib/config.ts` |
| Page sections | `components/Hero.tsx`, `Auction.tsx`, `History.tsx`, `Corner.tsx`, `StaticSections.tsx`, `Header.tsx` |
| 3D scene | `components/Motorhome3D.tsx`, `lib/sky.ts` |
| Bid form (3 steps) | `components/BidWizard.tsx` |
| Create bid + start Stripe Checkout | `app/api/bids/route.ts` |
| Payment confirmation (logo goes live) | `app/api/stripe/webhook/route.ts` |
| Public board / history data | `app/api/board/route.ts` |
| Admin (mark paid, send balance invoice) | `app/admin/page.tsx`, `app/api/admin/…` |
| Styles | `app/globals.css` |

## 4. How a bid flows
1. Browser → `POST /api/bids`: the **server** re-checks the minimum (top paid bid + step), validates the logo (PNG only), stores the
   bidder (private table) and the logo (private bucket), creates a Stripe Checkout Session (full amount, or the deposit).
2. Stripe → webhook: full payment → `markPaid` copies the logo to the public bucket and sets the bid to `paid`.
   Deposit → status `pending_offer` (shown as "pending offer" on the board, logo NOT public).
3. Deposit bids: in `/admin` either **Send balance invoice** (Stripe emails an invoice; `invoice.paid` publishes the logo)
   or **Mark paid** after collecting the money yourself.
4. The board shows the highest **paid** bid per spot. Pending offers never raise the minimum.

## 5. Decide / do before going live
- **Outbid policy**: a lower paid bid is not refunded automatically – decide and handle refunds/credits.
- **Campaign terms**: the bid is "per month"; define duration, start date, cancellation and content rules in a contract.
- **Logo moderation**: logos go live automatically on payment. For a public vehicle you may want a manual approval step.
- **Currency**: Pix only works with `brl`; `lib/config.ts` has one currency for the whole site.
- **Abuse**: add rate limiting to `/api/bids` (e.g. Upstash, Vercel Firewall) and CAPTCHA if needed.
- **Admin**: `ADMIN_SECRET` is minimal protection. For production use Supabase Auth with an allow-list.
- **Personal data** (ID, address, phone): stored only in `bidders` (no public access). Add a privacy notice and a retention rule (LGPD/GDPR).
- **Taxes/invoicing**: check what you must issue (e.g. nota fiscal in Brazil).

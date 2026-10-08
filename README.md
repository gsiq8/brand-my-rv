# Motorhome ads – Next.js + Supabase + Stripe

3D motorhome (turnable, 6 ad spots) where brands bid for a spot: pick spot + logo + amount → details → pay (Stripe Checkout)
or reserve with a deposit. When a payment is confirmed the logo goes live and the bid board updates.

> This code was written without being run or type-checked. Expect to fix small things on the first `npm run dev` / `npm run build`.

## 1. Setup
1. `npm install`
2. Copy `.env.example` to `.env.local` and fill it in.
3. Supabase: open the SQL editor and run `supabase/001_init.sql` (tables + the two storage buckets).
4. Stripe: Dashboard > Settings > Payment methods – enable what you want (cards, Pix, PayPal…). Checkout shows only enabled methods.
5. Webhook – send these events to `/api/stripe/webhook`:
   `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`,
   `checkout.session.expired`, `invoice.paid`.
   Locally: `stripe listen --forward-to localhost:3000/api/stripe/webhook` (it prints the `whsec_…` secret for `.env.local`).
6. `npm run dev` → http://localhost:3000   ·   admin: http://localhost:3000/admin (uses `ADMIN_SECRET`)

## 2. Where things are
| What | File |
|---|---|
| **Ad spots** (position, size, starting price) | `lib/spots.ts` |
| Currency, bid step, deposit rule, sky/panorama | `lib/config.ts` |
| 3D scene | `components/Motorhome3D.tsx`, `lib/sky.ts` |
| Bid form (3 steps) | `components/BidWizard.tsx` |
| Create bid + start Stripe Checkout | `app/api/bids/route.ts` |
| Payment confirmation (logo goes live) | `app/api/stripe/webhook/route.ts` |
| Public board data | `app/api/board/route.ts` |
| Admin (mark paid, send balance invoice) | `app/admin/page.tsx`, `app/api/admin/…` |

## 3. How a bid flows
1. Browser → `POST /api/bids`: the **server** re-checks the minimum (top paid bid + step), validates the logo (PNG only), stores the
   bidder (private table) and the logo (private bucket), creates a Stripe Checkout Session (full amount, or the deposit).
2. Stripe → webhook: full payment → `markPaid` copies the logo to the public bucket and sets the bid to `paid`.
   Deposit → status `pending_offer` (shown as "pending offer" on the board, logo NOT public).
3. Deposit bids: in `/admin` either **Send balance invoice** (Stripe emails an invoice; `invoice.paid` publishes the logo)
   or **Mark paid** after collecting the money yourself.
4. The board shows the highest **paid** bid per spot. Pending offers never raise the minimum.

## 4. Decide / do before going live
- **Outbid policy**: a lower paid bid is not refunded automatically – decide and handle refunds/credits.
- **Campaign terms**: the bid is "per month"; define duration, start date, cancellation and content rules in a contract.
- **Logo moderation**: logos go live automatically on payment. For a public vehicle you may want a manual approval step.
- **Currency**: Pix only works with `brl`; `lib/config.ts` has one currency for the whole site.
- **Abuse**: add rate limiting to `/api/bids` (e.g. Upstash, Vercel Firewall) and CAPTCHA if needed.
- **Admin**: `ADMIN_SECRET` is minimal protection. For production use Supabase Auth with an allow-list.
- **Personal data** (ID, address, phone): stored only in `bidders` (no public access). Add a privacy notice and a retention rule (LGPD/GDPR).
- **Taxes/invoicing**: check what you must issue (e.g. nota fiscal in Brazil).

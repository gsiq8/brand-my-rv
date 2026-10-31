![Brand My RV](public/banner.png)

# Brand My RV

A 3D motorhome that anyone can bid on. Brands pick an ad spot on the vehicle, upload a logo, place a bid, and their logo rides along on a 12-month expedition from Patagonia to San Francisco.

The site is a single Next.js page with a 3D model of the motorhome, a live auction board, a bid wizard that takes payment through Stripe, and an admin panel for approving logos and handling balances.

![Demo](public/demo.gif)

## What it does

- **3D motorhome (Three.js)** with a painted sky that follows the visitor's local clock and the sun's real position over Patagonia.
- **Ad spots** on the sides, rear, roof and front. Each spot has its own size, starting price and view angle, set in `lib/spots.ts`.
- **Auction board** with the top bid per spot, a leaderboard, a replay of every paid bid, and a day-by-day history.
- **The strip**: a rolling bar at the top of the page, plus a "corner" card that anyone can claim for a one-time payment.
- **Bid wizard** in a side drawer: pick a spot and upload a logo, enter your bid, fill in your details, then pay.
- **Card hold model**: bids are placed as a Stripe hold. Nothing is charged until the spot closes and the bid is the winning one.
- **Logo review**: every logo is approved by hand before it goes live on the board and on the motorhome.
- **Outbid and refund handling**: outbid bids have their hold released automatically.
- **Admin panel** for approving logos, refusing bids, sending balance invoices and marking payments as collected.
- **Notifications** by email (Klaviyo) and Telegram, and an optional ntfy hook.

## Stack

- Next.js 16 (App Router, Turbopack), React 19, TypeScript
- Tailwind CSS v4
- Three.js with three-mesh-bvh for fast raycasting when placing ad spots on the model
- liquid-glass-react for the glass effects
- Supabase (Postgres, private and public storage buckets)
- Stripe Checkout with manual capture
- Klaviyo, Telegram and ntfy for notifications
- sharp to convert logos to WebP on publish
- Vercel for hosting

## The 3D model

The motorhome was generated with Hunyuan3D-2 from reference images, then cleaned up and retopologized in Blender before export as `public/models/motorhome.glb`. The ad spot positions are defined in model units, so if the model is rescaled, the spots in `lib/spots.ts` need to be checked too.

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in the values below
npm run dev
```

### Supabase

Run the SQL files in `supabase/` in this order:

1. `001_init.sql` (tables, RLS, storage buckets)
2. `002_visits.sql` (visitor counter)
3. Any later migration files in `supabase/`, in order

### Stripe

1. Enable the payment methods you want in **Settings → Payment methods**.
2. Create a configuration that shows only cards, and put its ID (starts with `pmc_`) in `STRIPE_CARD_ONLY_CONFIG`.
3. Add a webhook endpoint at `/api/stripe/webhook` with these events:
   - `checkout.session.completed`
   - `checkout.session.async_payment_succeeded`
   - `checkout.session.async_payment_failed`
   - `checkout.session.expired`
   - `payment_intent.canceled`
   - `charge.captured`
   - `invoice.paid`

Test and live mode each have their own API keys, webhook secrets and payment method configurations. Use the matching ones for each environment.

### Environment variables

| Variable | What it is |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Public URL of the site, used for Stripe redirects |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only Supabase key. Never expose it |
| `STRIPE_SECRET_KEY` | Stripe secret key (`sk_...`). Use a restricted key with write access to Checkout, PaymentIntents, Refunds, Customers and Invoices |
| `STRIPE_WEBHOOK_KEY` | Signing secret of the webhook endpoint (`whsec_...`) |
| `STRIPE_CARD_ONLY_CONFIG` | ID of the payment method configuration (`pmc_...`) |
| `ADMIN_SECRET` | Long random string protecting `/admin` and `/api/admin/*` |
| `KLAVIYO_PRIVATE_KEY` | Klaviyo private key (optional) |
| `KLAVIYO_LIST_ID` | Klaviyo list for bidders (optional) |
| `TELEGRAM_BOT_TOKEN`, `TELEGRAM_BOT_USERNAME`, `TELEGRAM_CHAT_ID`, `TELEGRAM_WEBHOOK_SECRET` | Telegram bot for updates (optional) |
| `DEPOSIT_HOOK_URL`, `PAYMENT_HOOK_URL` | ntfy topic URLs (optional) |

## Configuration

- `lib/config.ts`: currency, bid step, deposit rule, fundraising goal, motorhome length, sun latitude, auction end date.
- `lib/site.ts`: all page text (headline, steps, specs, FAQ, host bio).
- `lib/spots.ts`: ad spot positions, sizes and prices, and the brand lists for truck-only and builder-only spots.
- `lib/pricing.ts`: minimum bid and deposit calculation.

## Project structure

```
app/                  Pages and API routes (/, /leaderboard, /replay, /admin, /api/...)
components/           UI, 3D scene (Motorhome3D), bid wizard, strip, FAQ
lib/                  Config, spots, pricing, sky, shared types
lib/server/           Server-only logic: bids, auction close, refunds, notifications
supabase/             SQL migrations
public/models/        motorhome.glb (Hunyuan3D-2 + Blender)
scripts/              One-off maintenance scripts (for example logo conversion)
tests/                Playwright and Vitest tests
```

## Before going live

- [ ] Use live Stripe keys and a live webhook endpoint in production.
- [ ] Confirm `NEXT_PUBLIC_SITE_URL` points to the final domain.
- [ ] Change `ADMIN_SECRET`.
- [ ] Clear test data from Supabase (bids, bidders, spot auctions, the visit counter) and from the Stripe test dashboard if you want a clean start.
- [ ] Test the full flow once with a real low-value bid: bid, logo approval, outbid, refund.
- [ ] Add a privacy notice and a retention rule for personal data (LGPD/GDPR). The `/privacy` and `/terms` pages are drafts and should be reviewed.

## Known issues

- Some `<img>` elements render logos at fixed sizes without matching CSS dimensions, which makes Next.js print a warning in the browser console. The layout is correct; the warning does not affect the site.
- The `liquid-glass-react` library adds a dark background layer on some browsers. The component's behaviour depends on the browser's `backdrop-filter` and SVG filter support.
- Mobile Lighthouse performance is still limited by the size of the three.js bundle, which is loaded on the first page view. Which can be a bummer for older operating systems.

## License

Private project. All rights reserved unless a license is added here.
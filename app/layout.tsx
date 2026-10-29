import './globals.css';
import type { Metadata, Viewport } from 'next';
import { SpeedInsights } from "@vercel/speed-insights/next"

export const metadata: Metadata = { title: 'Brand the Motorhome', description: 'Bid for ad space on our motorhome.' };
export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover' };

// const DF = process.env.NEXT_PUBLIC_DATAFAST_ID;   // DataFast website id; unset = no analytics script
// const DOMAIN = new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').hostname;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <link rel="icon" href="https://emojifavicon.com/🚐" />
      <SpeedInsights/>
      <link rel="preconnect" href="https://bbegfjjabvchajnasqkb.supabase.co" crossOrigin="anonymous" />

      {/* <head>{DF && <script defer data-website-id={DF} data-domain={DOMAIN} src="https://datafa.st/js/script.js" />}</head> */}
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
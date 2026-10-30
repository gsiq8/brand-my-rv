// app/layout.tsx
import './globals.css';
import type { Metadata, Viewport } from 'next';
import { SpeedInsights } from "@vercel/speed-insights/next";
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'Brand the Motorhome',
  description: 'Bid for ad space on our motorhome.'
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="https://emojifavicon.com/🚐" />
        <link rel="preconnect" href="https://bbegfjjabvchajnasqkb.supabase.co" crossOrigin="anonymous" />
      </head>
      <body suppressHydrationWarning>
        {children}
        <SpeedInsights />
        <Script
          src="https://datafa.st/js/script.js"
          data-website-id="dfid_KFcu1pH2Oqtxl9sLfw32w"
          data-domain="brand-my-rv.vercel.app"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
import './globals.css';
import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = { title: 'Brand the Motorhome', description: 'Bid for ad space on our motorhome.' };
export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}

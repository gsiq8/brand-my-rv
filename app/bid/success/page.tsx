import Link from 'next/link';
import { tgLink } from '@/lib/server/telegram';

export default async function Success({ searchParams }: { searchParams: Promise<{ bid?: string }> }) {
  const { bid } = await searchParams;
  const tg = bid ? tgLink(bid) : '';
  const p = { padding: 0, fontSize: 16, lineHeight: 1.6, color: '#56565c' } as const;
  return (
    <main style={{ maxWidth: 520, margin: '12vh auto', padding: 24, textAlign: 'center' }}>
      <h1>Thank you!</h1>
      <p style={{ ...p, marginTop: 16 }}>
        We are confirming your card. For an auction spot, nothing is charged: the amount is only held, and released if you are outbid.
        Your logo goes live on the motorhome and on the bid board once it is approved.
      </p>
      <p style={{ ...p, marginTop: 12 }}>
        If you win, you will receive the contract and invoice by email. The balance is paid by bank transfer within 48 hours.
      </p>
      {tg && (
        <p style={{ ...p, marginTop: 12 }}>
          Want bid updates on Telegram too? <a href={tg} style={{ color: '#2563eb' }}>Open our bot and press Start</a>.
        </p>
      )}
      <Link href="/" className="btn pri" style={{ marginTop: 24 }}>Back to BrandMyRV</Link>
    </main>
  );
}
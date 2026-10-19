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
        We are confirming your payment. Once it is confirmed, your logo is reviewed; when it is approved it goes live on the motorhome and appears on the bid board.
        This usually takes a few seconds for the payment; some payment methods (such as Pix or bank transfer) can take longer.
      </p>
      <p style={{ ...p, marginTop: 12 }}>If you reserved with a deposit, we will contact you to arrange the balance.</p>
      {tg && (
        <p style={{ ...p, marginTop: 12 }}>
          Want bid updates on Telegram too? <a href={tg} style={{ color: '#2563eb' }}>Open our bot and press Start</a>.
        </p>
      )}
      <Link href="/" className="btn pri" style={{ marginTop: 24 }}>Back to BrandMyRV</Link>
    </main>
  );
}
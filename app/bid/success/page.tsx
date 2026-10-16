import Link from 'next/link';

export default function Success() {
  const p = { padding: 0, fontSize: 16, lineHeight: 1.6, color: '#56565c' } as const;
  return (
    <main style={{ maxWidth: 520, margin: '12vh auto', padding: 24, textAlign: 'center' }}>
      <h1>Thank you!</h1>
      <p style={{ ...p, marginTop: 16 }}>
        We are confirming your payment. When it is confirmed, your logo goes live on the motorhome and appears on the bid board.
        This usually takes a few seconds; some payment methods (such as Pix or bank transfer) can take longer.
      </p>
      <p style={{ ...p, marginTop: 12 }}>If you reserved with a deposit, we will contact you to arrange the balance.</p>
      <Link href="/" className="btn pri" style={{ marginTop: 24 }}>Back to BrandMyRV</Link>
    </main>
  );
}
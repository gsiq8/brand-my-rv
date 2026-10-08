import Link from 'next/link';

export default function Success() {
  return (
    <main style={{ maxWidth: 520, margin: '12vh auto', padding: 24, textAlign: 'center' }}>
      <h1>Thank you!</h1>
      <p>We are confirming your payment. When it is confirmed, your logo goes live on the motorhome and appears on the bid board.
        This usually takes a few seconds; some payment methods (such as Pix or bank transfer) can take longer.</p>
      <p>If you reserved with a deposit, we will contact you to arrange the balance.</p>
      <Link href="/">Back to the motorhome</Link>
    </main>
  );
}

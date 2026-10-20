import Legal, { CONTACT } from '@/components/Legal';

export default function Page() {
  return (
    <main className='max-w-3xl mx-auto py-14 px-6'>

      <Legal title="Terms" short="A bid creates a hold against the card limit, not an immediate charge. If you are outbid, the hold is released instantly. The amount is captured only when the auction closes and the spot is awarded to you." >
        <section className='mb-8'>
          <h4 className='text-xl font-semibold tracking-[-0.01em]'>What is being sold</h4>
          <div className='mt-3 muted space-y-3 text-[15px] leading-relaxed [&_a]:text-blue hover:[&_a]:underline [&_strong]:font-medium [&_strong]:text-ink'>

            <p>Advertising spots on the surfaces of a Class C expedition motorhome: sides, rear and roof (and the front, for truck and builder brands only). A spot buys a logo printed in automotive vinyl and displayed in the auction board, photos and public-facing trip record.</p>
            <p>You can also take “the strip”, the top of this website: a one-time payment, non-refundable, that stays at the top until someone bids higher; everyone who held it stays listed.</p>
            <p>This is a personal project run by Giovana Siquieroli, operating as "Gsiq". It is not affiliated with, endorsed by or sponsored by any vehicle maker or brand shown.</p>
          </div>
        </section>
        <section className='mb-8'>
          <h4 className='text-xl font-semibold tracking-[-0.01em]'>How bidding works</h4>
          <div className='mt-3 muted space-y-3 text-[15px] leading-relaxed [&_a]:text-blue hover:[&_a]:underline [&_strong]:font-medium [&_strong]:text-ink'>

            <ul>
              <li>Each spot has a starting price. A new bid must beat the highest live bid by at least US$100.</li>
              <li>When you place a bid, the <b>card limit is placed on a temporary hold</b> for the bid amount. This is not an immediate charge and no cash leaves your account at that moment.</li>
              <li>If another bidder raises the amount, the previous hold is <b>released instantly</b> and the reserved limit becomes available again without a physical refund or manual transfer.</li>
              <li>The amount is <b>captured only after the auction closes and the spot is awarded</b>. Until then, the reserve is just a hold against the available card limit.</li>
              <li>The winner is the highest valid bid at close. Some spots are reserved for truck or builder brands. I may refuse a bid on those spots from other brands.</li>
            </ul>
          </div>
        </section>
        <section className='mb-8'>
          <h4 className='text-xl font-semibold tracking-[-0.01em]'>If you are outbid</h4>
          <div className='mt-3 muted space-y-3 text-[15px] leading-relaxed [&_a]:text-blue hover:[&_a]:underline [&_strong]:font-medium [&_strong]:text-ink'>

            <p>When someone else’s live bid overtakes yours, the earlier hold is cancelled and released automatically. No money is debited from your account at that time, and no refund of physical cash is required. Your bid remains visible in the bid history and may be re-activated later if the auction rules allow a follow-up bid.</p>
          </div></section>
        <section className='mb-8'>
          <h4 className='text-xl font-semibold tracking-[-0.01em]'>Your logo</h4>
          <div className='mt-3 muted space-y-3 text-[15px] leading-relaxed [&_a]:text-blue hover:[&_a]:underline [&_strong]:font-medium [&_strong]:text-ink'>

            <p>By uploading a logo you confirm you have the right to use it and to let me display and print it for this project. <b>I review every logo by hand before it appears anywhere</b>. I may refuse or remove a logo that is misleading, unlawful, offensive, low-quality, or not suitable for the trip and the brand in question.</p>
            <p>If I refuse your logo, the hold is not captured and any amount already reserved is released. If a logo is approved but a later issue arises, I may remove it and, if applicable, refund the remaining unused portion of the spot assignment.</p>
          </div></section>
        <section className='mb-8'>
          <h4 className='text-xl font-semibold tracking-[-0.01em]'>Paying</h4>
          <div className='mt-3 muted space-y-3 text-[15px] leading-relaxed [&_a]:text-blue hover:[&_a]:underline [&_strong]:font-medium [&_strong]:text-ink'>

            <p>Card payments are processed by Stripe. A bid creates a pre-authorization hold on the card limit, which freezes the amount temporarily without moving the money out of the account. If you are outbid, the hold is released instantly. If you win, the hold is captured when the auction closes and the spot is awarded. I never see or store your full card number; Stripe handles the payment flow and the card data.</p>
          </div></section>
        <section className='mb-8'>
          <h4 className='text-xl font-semibold tracking-[-0.01em]'>What I promise, and what I don’t</h4>
          <div className='mt-3 muted space-y-3 text-[15px] leading-relaxed [&_a]:text-blue hover:[&_a]:underline [&_strong]:font-medium [&_strong]:text-ink'>

            <p>I will print your logo, put it on the motorhome and travel with it, and it will appear in the photos and videos I publish. I make <b>no promise about impressions, reach, views, clicks, leads, sales, or sponsor ROI</b>; the advertising effect is inherently uncertain.</p>
            <p>If a brand on the vehicle turns out to be fraudulent, unlawful or materially misrepresented, I may remove its logo and refund the remaining time pro rata.</p>
          </div></section>
        <section className='mb-8'>
          <h4 className='text-xl font-semibold tracking-[-0.01em]'>If things go wrong</h4>
          <div className='mt-3 muted space-y-3 text-[15px] leading-relaxed [&_a]:text-blue hover:[&_a]:underline [&_strong]:font-medium [&_strong]:text-ink'>

            <p>If the motorhome is damaged, sold or can’t finish the trip, I will move your logo to a replacement vehicle or refund you pro rata for the time remaining. If I cancel the auction or a spot becomes unavailable for a valid reason, I will refund any captured amount and explain the basis for the cancellation.</p>
          </div></section>
        <section className='mb-8'>
          <h4 className='text-xl font-semibold tracking-[-0.01em]'>Questions</h4>
          <div className='mt-3 muted space-y-3 text-[15px] leading-relaxed [&_a]:text-blue hover:[&_a]:underline [&_strong]:font-medium [&_strong]:text-ink'>

            <p>Email <a href={`mailto:${CONTACT}`}>{CONTACT}</a>. These terms are governed by the laws of Brazil.</p>
          </div></section>
      </Legal></main>
  );
}

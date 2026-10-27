import Legal, { CONTACT } from '@/components/Legal';
import Header from '@/components/Header';

export default function Page() {
  return (
    <>
      <Header />
      <main className='max-w-3xl mx-auto py-14 px-6'>
        <Legal title="Terms" short="The auction uses a card hold / pre-authorization. When you bid, the amount is reserved against the card limit, not charged immediately. If you are outbid, the hold is released instantly. The amount is captured only when the auction closes and the lot is awarded to you." >
          <section className='mb-8'>
            <h4 className='text-xl font-semibold tracking-[-0.01em]'>What is being sold</h4>
            <div className='mt-3 muted space-y-3 text-[15px] leading-relaxed [&_a]:text-blue hover:[&_a]:underline [&_strong]:font-medium [&_strong]:text-ink'>
              <p>Advertising spots on the surfaces of a Class C expedition motorhome: sides, rear and roof (and the front, for truck and builder brands only). A spot buys a logo printed in automotive vinyl and displayed in the auction board, photos and public-facing trip record.</p>
              <p>You can also take “the strip”, the top of this website: a one-time payment, non-refundable, that stays at the top until someone bids higher; everyone who held it stays listed.</p>
              <p>This is a personal project run by Giovana Siquieroli, operating as "GOIA". It is not affiliated with, endorsed by or sponsored by any vehicle maker or brand shown.</p>
            </div>
          </section>

          <section className='mb-8'>
            <h4 className='text-xl font-semibold tracking-[-0.01em]'>How bidding works</h4>
            <div className='mt-3 muted space-y-3 text-[15px] leading-relaxed'>
              <ul>
                <li>Each spot has a starting price. A new bid must be at least US$100 above the current live bid.</li>
                <li>A bid places a <b>card hold (pre-authorization)</b> for its amount on your card. Nothing is charged to the card.</li>
                <li>A bid goes live, and sets the price, only after its logo is approved. While a logo is under review, prices do not change.</li>
                <li>A spot closes <b>five days after its first card hold</b> is placed. Anyone may outbid until it closes.</li>
                <li>If two bids are for the same amount, the first one placed wins.</li>
              </ul>
            </div>
          </section>

          <section className='mb-8'>
            <h4 className='text-xl font-semibold tracking-[-0.01em]'>If you are outbid</h4>
            <div className='mt-3 muted space-y-3 text-[15px] leading-relaxed'>
              <p>When a higher bid goes live, your card hold is cancelled automatically. No money is debited, and no refund is needed. Your bid stays visible in the bid history.</p>
            </div>
          </section>

          <section className='mb-8'>
            <h4 className='text-xl font-semibold tracking-[-0.01em]'>Closing and settlement</h4>
            <div className='mt-3 muted space-y-3 text-[15px] leading-relaxed'>
              <ul>
                <li>When the spot closes, the highest live bid wins. The winner receives a Sponsorship Agreement and a Commercial Invoice from "GOIA" by email.</li>
                <li>The winner signs the agreement and pays the full amount by bank transfer within 48 hours of the closing notice. The bid is <b>not charged to the card</b>.</li>
                <li>When the transfer is received, the card hold is released and the spot is sold.</li>
                <li>If the transfer is not received within 48 hours, a media exposure fee of <b>10% of the winning bid</b> is charged to the held card, and the rest of the hold is released automatically. The spot is then not sold to that bidder.</li>
                <li>A logo is produced only after the Sponsorship Agreement is signed.</li>
              </ul>
            </div>
          </section>

          <section className='mb-8'>
            <h4 className='text-xl font-semibold tracking-[-0.01em]'>Your logo</h4>
            <div className='mt-3 muted space-y-3 text-[15px] leading-relaxed [&_a]:text-blue hover:[&_a]:underline [&_strong]:font-medium [&_strong]:text-ink'>
              <p>By uploading a logo you confirm you have the right to use it and to let me display and print it for this project. <b>I review every logo by hand before it appears anywhere</b>. I may refuse or remove a logo that is misleading, unlawful, offensive, low-quality, or not suitable for the trip and the brand in question.</p>
              <p>If I refuse your logo, the hold is not captured and any amount already reserved is released. If a logo is approved but a later issue arises, I may remove it and, if applicable, refund the remaining unused portion of the allocation.</p>
            </div>
          </section>

          <section className='mb-8'>
            <h4 className='text-xl font-semibold tracking-[-0.01em]'>Paying</h4>
            <div className='mt-3 muted space-y-3 text-[15px] leading-relaxed'>
              <p>Card payments are processed by Stripe. A bid places a pre-authorization on the card limit, which is not a charge. The Strip is a one-time card payment, charged at checkout, and refunded only if we refuse the logo. I never see or store your full card number.</p>
            </div>
          </section>

          <section className='mb-8'>
            <h4 className='text-xl font-semibold tracking-[-0.01em]'>What I promise, and what I don’t</h4>
            <div className='mt-3 muted space-y-3 text-[15px] leading-relaxed [&_a]:text-blue hover:[&_a]:underline [&_strong]:font-medium [&_strong]:text-ink'>
              <p>I will print your logo, put it on the motorhome and travel with it, and it will appear in the photos and videos I publish. I make <b>no promise about impressions, reach, views, clicks, leads, sales, or sponsor ROI</b>; the advertising effect is inherently uncertain.</p>
              <p>If a brand on the vehicle turns out to be fraudulent, unlawful or materially misrepresented, I may remove its logo and refund the remaining time pro rata.</p>
            </div>
          </section>

          <section className='mb-8'>
            <h4 className='text-xl font-semibold tracking-[-0.01em]'>If things go wrong</h4>
            <div className='mt-3 muted space-y-3 text-[15px] leading-relaxed [&_a]:text-blue hover:[&_a]:underline [&_strong]:font-medium [&_strong]:text-ink'>
              <p>If the motorhome is damaged, sold or can’t finish the trip, I will move your logo to a replacement vehicle or refund you pro rata for the time remaining. If I cancel the auction or a spot becomes unavailable for a valid reason, I will clear any live hold and explain the basis for the cancellation.</p>
            </div>
          </section>

          <section className='mb-8'>
            <h4 className='text-xl font-semibold tracking-[-0.01em]'>Questions</h4>
            <div className='mt-3 muted space-y-3 text-[15px] leading-relaxed [&_a]:text-blue hover:[&_a]:underline [&_strong]:font-medium [&_strong]:text-ink'>
              <p>Email <a href={`mailto:${CONTACT}`}>{CONTACT}</a>. These terms are governed by the laws of Uruguay.</p>
            </div>
          </section>
        </Legal>
      </main>
    </>
  );
}


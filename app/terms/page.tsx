import Legal, { CONTACT } from '@/components/Legal';

export default function Page() {
  return (
    <main className='max-w-3xl mx-auto py-14 px-6'>

      <Legal title="Terms" short="Highest paid bid on a spot holds it. If you are outbid, you are refunded. I review every logo by hand before it appears, and if I refuse yours you are refunded in full. I promise presence on the motorhome, not results.">
        <section className='mb-8'>
          <h4 className='text-xl font-semibold tracking-[-0.01em]'>What is being sold</h4>
          <div className='mt-3 muted space-y-3 text-[15px] leading-relaxed [&_a]:text-blue hover:[&_a]:underline [&_strong]:font-medium [&_strong]:text-ink'>

            <p>Advertising spots on the surfaces of a Class C expedition motorhome: sides, rear and roof (and the front, for truck and builder brands only). A spot buys a logo printed in automotive vinyl on that surface for the road trip, plus a listing on this page with a link to your site. The campaign runs for 12 months starting online with the auction on October 19th and in real life on December 1st, if the auction target is achieved. Prices range start from $4,400.00 to $49,000.00 per year, in US dollars.</p>
            <p>You can also take “the strip”, the top of this website: a one-time payment, non-refundable, that stays at the top until someone bids higher; everyone who held it stays listed.</p>
            <p>This is a personal project run by Giovana Siquieroli, operating as "Gsiq". It is not affiliated with, endorsed by or sponsored by any vehicle maker or brand shown.</p>
          </div>
        </section>
        <section className='mb-8'>
          <h4 className='text-xl font-semibold tracking-[-0.01em]'>How bidding works</h4>
          <div className='mt-3 muted space-y-3 text-[15px] leading-relaxed [&_a]:text-blue hover:[&_a]:underline [&_strong]:font-medium [&_strong]:text-ink'>

            <ul>
              <li>Each spot has a starting price. A new bid must beat the highest <b>paid</b> bid by at least US$100.</li>
              <li>You can <b>pay in full</b> now, or <b>reserve with an upfront deposit of 20% the spot price </b> (US$440 minimum) and pay the balance later by invoice or transfer.</li>
              <li>A bid counts, and your logo appears, only once it is <b>fully paid and the logo is approved</b>. A deposit reservation never raises the minimum for others.</li>
              <li>The highest paid bid on a spot holds it. The auction stays open until I announce a closing date on this page.</li>
              <li>Some spots are reserved for truck or builder brands. I may refuse a bid on those spots from other brands.</li>
            </ul>
          </div>
        </section>
        <section className='mb-8'>
          <h4 className='text-xl font-semibold tracking-[-0.01em]'>If you are outbid</h4>
          <div className='mt-3 muted space-y-3 text-[15px] leading-relaxed [&_a]:text-blue hover:[&_a]:underline [&_strong]:font-medium [&_strong]:text-ink'>

            <p>When someone else’s paid bid overtakes yours, what you paid through Stripe is <b>refunded automatically</b>, in full, and I email you. If you paid part by transfer or another method outside Stripe, I refund that by hand. “The strip” is the exception: it is a one-time purchase and is not refunded. You can bid again at any time.</p>
          </div></section>
        <section className='mb-8'>
          <h4 className='text-xl font-semibold tracking-[-0.01em]'>Your logo</h4>
          <div className='mt-3 muted space-y-3 text-[15px] leading-relaxed [&_a]:text-blue hover:[&_a]:underline [&_strong]:font-medium [&_strong]:text-ink'>

            <p>By uploading a logo you confirm you have the right to use it and to let me display and print it for this project. <b>I review every logo by hand before it appears anywhere</b>. I may refuse any logo or bid at my discretion, without having to justify it – the motorhome travels with me, and I keep the final say over what it carries. If I refuse yours, your bid is cancelled and everything you paid is refunded.</p>
          </div></section>
        <section className='mb-8'>
          <h4 className='text-xl font-semibold tracking-[-0.01em]'>Paying</h4>
          <div className='mt-3 muted space-y-3 text-[15px] leading-relaxed [&_a]:text-blue hover:[&_a]:underline [&_strong]:font-medium [&_strong]:text-ink'>

            <p>Card and other payments are processed by Stripe; I never see or store your card details. Amounts are charged in US dollars. For a deposit reservation, I send an invoice for the balance, due within 7 days. If the balance is not paid, the deposit is kept. I issue the invoice or tax document for what you paid [adapt to your tax rules]. Spots are sold as advertising to businesses and professionals, not consumers.</p>
          </div></section>
        <section className='mb-8'>
          <h4 className='text-xl font-semibold tracking-[-0.01em]'>What I promise, and what I don’t</h4>
          <div className='mt-3 muted space-y-3 text-[15px] leading-relaxed [&_a]:text-blue hover:[&_a]:underline [&_strong]:font-medium [&_strong]:text-ink'>

            <p>I will print your logo, put it on the motorhome and travel with it, and it will appear in the photos and videos I publish. I make <b>no promise about impressions, reach, views, clicks or results</b>; the channels for this trip are new and I will not invent a number. You are buying presence, not performance. A spot is a <b>paid placement, not an endorsement</b> in either direction.</p>
            <p>If a brand on the vehicle turns out to be fraudulent, unlawful or materially misrepresented, I may remove its logo and refund the remaining time pro rata.</p>
          </div></section>
        <section className='mb-8'>
          <h4 className='text-xl font-semibold tracking-[-0.01em]'>If things go wrong</h4>
          <div className='mt-3 muted space-y-3 text-[15px] leading-relaxed [&_a]:text-blue hover:[&_a]:underline [&_strong]:font-medium [&_strong]:text-ink'>

            <p>If the motorhome is damaged, sold or can’t finish the trip, I will [move your logo to its replacement or refund you pro rata for the time remaining – choose]. If I cancel the auction before your logo is printed, everything you paid is refunded.</p>
          </div></section>
        <section className='mb-8'>
          <h4 className='text-xl font-semibold tracking-[-0.01em]'>Questions</h4>
          <div className='mt-3 muted space-y-3 text-[15px] leading-relaxed [&_a]:text-blue hover:[&_a]:underline [&_strong]:font-medium [&_strong]:text-ink'>

            <p>Email <a href={`mailto:${CONTACT}`}>{CONTACT}</a>. These terms are governed by the laws of Brazil.</p>
          </div></section>
      </Legal></main>
  );
}
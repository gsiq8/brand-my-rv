import Legal, { CONTACT } from '@/components/Legal';

export default function Page() {
  return (
    <main className='max-w-3xl mx-auto py-14 px-6'>
      <Legal title="Privacy Policy" short="No advertising cookies and no cross-site tracking. To bid you give me your contact and tax details so I can invoice you, and I never see your card number. Only your brand name, logo, website and bid amount are public, and only after I approve your logo.">
        <section className='mb-8'>
          <h4 className='text-xl font-semibold tracking-[-0.01em]'>Who I am</h4>
          <div className='mt-3 muted space-y-3 text-[15px] leading-relaxed [&_a]:text-blue hover:[&_a]:underline [&_strong]:font-medium [&_strong]:text-ink'>
            <p>Brand My RV is run by Giovana Siquieroli, operating as "Gsiq" (“I”, “me”). I am the data controller for everything described here. Contact: <span className="text-orange-500"><a href={`mailto:${CONTACT}`}>{CONTACT}</a></span>.</p>
          </div>
        </section>
        <section className='mb-8'>
          <h4 className='text-xl font-semibold tracking-[-0.01em]'>What I collect when you bid</h4>
          <div className='mt-3 muted space-y-3 text-[15px] leading-relaxed [&_a]:text-blue hover:[&_a]:underline [&_strong]:font-medium [&_strong]:text-ink'>

            <ul>
              <li><b>Name or company</b> – shown publicly on the board if your bid is live.</li>
              <li><b>Email and phone</b> – to confirm your bid, tell you if you are outbid, and reach you about your deposit or logo.</li>
              <li><b>Address and ID / tax number</b> – needed to issue invoices and tax documents. Never published.</li>
              <li><b>Logo file and website</b> – what gets printed on the motorhome and linked from this page once approved.</li>
              <li><b>Bid amount and time</b> – the auction cannot work without them; the amount is public once your bid is live.</li>
              <li><b>A payment reference</b> – the identifiers Stripe returns, so a payment can be refunded or matched to an invoice. <b>Card numbers never reach this site</b>; you type them on Stripe’s own page.</li>
              <li><b>A Telegram chat ID</b> – only if you open our Telegram bot and press Start. It is used for bid updates and nothing else.</li>
            </ul>
          </div>
        </section>
        <section className='mb-8'>
          <h4 className='text-xl font-semibold tracking-[-0.01em]'>What is public and what is not</h4>
          <div className='mt-3 muted space-y-3 text-[15px] leading-relaxed [&_a]:text-blue hover:[&_a]:underline [&_strong]:font-medium [&_strong]:text-ink'>

            <p>Once your logo is approved and your payment cleared, your <b>brand name, logo, website and bid amount</b> appear on this site – that is the point of the auction. A deposit reservation appears in the bid history with the brand name and amount, but without a logo, until it is completed and approved. Your email, phone, address and ID are <b>never published</b> and never shared with other bidders. Your logo is not visible to anyone but me until I approve it.</p>
          </div>
        </section>
        <section className='mb-8'>
          <h4 className='text-xl font-semibold tracking-[-0.01em]'>Cookies and analytics</h4>
          <div className='mt-3 muted space-y-3 text-[15px] leading-relaxed [&_a]:text-blue hover:[&_a]:underline [&_strong]:font-medium [&_strong]:text-ink'>

            <p>This site sets no advertising or tracking cookies. Visits are measured with <a href="https://datafa.st">DataFast</a> in cookieless mode: it uses your IP address, browser user-agent and the page you landed on (and where you came from, such as a link on X) to build a pseudonymous identifier that rotates regularly. No advertising network, no cross-site tracking, no profile of you.</p>
            <p>The visitor total on the page is a single number that goes up once per browser session; your browser remembers locally that the visit was counted, and nothing about you is stored for it.</p>
          </div>
        </section>
        <section className='mb-8'>
          <h4 className='text-xl font-semibold tracking-[-0.01em]'>Who processes your data</h4>
          <div className='mt-3 muted space-y-3 text-[15px] leading-relaxed [&_a]:text-blue hover:[&_a]:underline [&_strong]:font-medium [&_strong]:text-ink'>

            <ul>
              <li><b>Supabase</b> – database and logo files.</li>
              <li><b>Stripe</b> – takes and refunds payments, and holds the card details this site never sees.</li>
              <li><b>Klaviyo</b> – sends the bid and outbid emails (it receives your email address and bid details).</li>
              <li><b>Telegram</b> – only if you connect the bot.</li>
              <li><b>DataFast</b> – cookieless visit statistics.</li>
              <li><b>Vercel</b> – hosts the site and keeps standard server logs.</li>
            </ul>
            <p className="mt-4">I do not sell your data and do not use it for anything other than running this auction.</p>
          </div>
        </section>
        <section className='mb-8'>
          <h4 className='text-xl font-semibold tracking-[-0.01em]'>How long I keep it</h4>
          <div className='mt-3 muted space-y-3 text-[15px] leading-relaxed [&_a]:text-blue hover:[&_a]:underline [&_strong]:font-medium [&_strong]:text-ink'>

            <p>Bid records stay while your ad is on the motorhome and for 12 months afterwards, as the record of who bought what. If your logo is refused or you ask me to delete your bid, the bid and the uploaded logo are removed within 30 days. Records of money – payments, refunds, invoices – are kept for as long as Brazil's tax and accounting law requires.</p>
          </div>
        </section>
        <section className='mb-8'>
          <h4 className='text-xl font-semibold tracking-[-0.01em]'>Your rights</h4>
          <div className='mt-3 muted space-y-3 text-[15px] leading-relaxed [&_a]:text-blue hover:[&_a]:underline [&_strong]:font-medium [&_strong]:text-ink'>

            <p>Under GDPR you can ask for a copy of your data, correct it, or have it deleted. Email <a href={`mailto:${CONTACT}`}>{CONTACT}</a> and I will answer within one month. You can also complain to ANPD.</p>
          </div>
        </section>
        <section className='mb-8'>
          <h4 className='text-xl font-semibold tracking-[-0.01em]'>Changes</h4>
          <div className='mt-3 muted space-y-3 text-[15px] leading-relaxed [&_a]:text-blue hover:[&_a]:underline [&_strong]:font-medium [&_strong]:text-ink'>

            <p>If this policy changes in a way that affects you, I will email everyone holding a spot. The date at the top always shows the current version.</p>
          </div>
        </section>
      </Legal>
    </main>
  );
}
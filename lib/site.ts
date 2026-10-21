/**
 * ALL THE TEXT OF THE PAGE lives here – edit freely. Anything in [square brackets] is a placeholder to replace.
 */
import { TOTAL_START } from "./spots";

export const COPY = {
  name: 'Brand My RV',
  headline: 'Your brand, on my RV.',
  sub: 'Join your logo on an adventure: from Patagonia to San Francisco.',
  tapHint: 'Tap any spot to place a bid.',
  pitchLead: 'To finance my first house over wheels by selliing its surfaces for advertising.',
  pitchSub: 'Roads, cities, campsites, photos and many nations, get your brand seen online and IRL.',
  introTitle: 'Everyone looks at a motorhome.',
  introTitle2: 'Put your logo right where they look.',
  auctionTitle: 'The auction, live.',
  auctionSub: 'Every spot shows its current top bid.',
  specsTitle: 'What the money buys.',
  specsSub: 'Here are the exact details.',
  specsPrice: '±U$440,000',
  specsLink: { label: 'Check the price', href: '#' },
  specsName: 'Overland Class C Motorhome',
  specsNote: 'The chassis comes from a manufacturer partner, so the final model is confirmed once a partner signs on. Anything raised past the goal pays for fuel, maintenance and the next trip. ',
  cornerLead: 'You can also brand this website. One spot, top of the page. Everyone who has held it stays on this list, with how long they lasted – being outbid moves you down, it does not remove you immediately.',
  cornerNote: 'One-time payment, no refund.',
  disclaimer: '[Add your disclaimer, e.g. not affiliated with any brand shown.]',
  counters: { viewsValue: '', viewsLabel: 'views on Instagram' },
  host: {
    name: 'Giovana',
    bio: 'Digital nomad for a year and something. Launching a new Substack to cover my roaming adventures and curation of spaces. Think ecoturism meets wellness, for extraordinary expirences in Latin America.',
    links: [{ label: 'Substack', href: 'http://humansandhorses.substack.com' }, { label: 'Email me', href: 'mailto:contact@siquieroli.com' }],
  },
};

export const STEPS = [
  { t: 'Pick a spot and size', d: 'Spots across the sides, rear and roof of the motorhome – priced by size and visibility.' },
  { t: 'Place your bid', d: 'Upload your logo and place a card hold against the bid amount. No money is taken immediately.' },
  { t: 'Your logo rides along', d: 'Your logo rides along with me during the trip and is only captured at auction close if the spot is awarded to you.' },
];

export const SPECS: [string, string][] = [
  ['Chassis', 'For a Class C 4x4 or a truck-based 4x4 expedition motorhome. Make and model set by a chassis partner.'],
  ['Traction', '4x4 with locking differentials or low range, and high ground clearance for dirt and snow roads.'],
  ['Length', '24 ft to 34 ft'],
  ['Fuel and Range', 'Diesel, with a range of at least 600mi (1,000 km) per tank.'],
  ['Solar', 'Roof array of at least 1,000 W'],
  ['Power', '20-24 Kwh lithium-ion battery bank, with a 5-7 kW inverter-charger'],
  ['Climate', 'Insulated for four seasons, with a diesel heater and air conditioning that runs on battery or solar'],
  ['Where it travels', 'Built for heat, cold and snow, humid and dry climates. It can endure Latam\'s climate from south to north. '],
];

export const FAQ: { q: string; a: string; [key: string]: string | undefined; }[] = [
  {
    q: 'Is this real?',
    a: 'Absolutely. This is a 12 month expedition across Patagonia to San Francisco. I\'ve been a digital nomad for a year now, staying at Airbnbs for one to three months at each location.',
    b: 'Nevertheless, it is a working life, and I spent many days locked inside somebody else\'s apartment. I really enjoy this lifestyle, tho. To get the most out of this time in my life, I want to build the RV and keep the trip moving.',
    c: 'Like me, your brand will meet curious, adventurous people and wild places.'
  },
  {
    q: 'Why this motorhome?',
    a: 'A Class C size is the minimum size we feel comfortable doing this long trip. We need 4x4 traction for snow, overlanding and adaptability. We\'re open to chassis and builder partners that meet the same standards.',
  },
  {
    q: 'What do I actually get?',
    a: 'Your brand showing up on social and in real life:',
    u_b: 'On the spot you choose, visible on the road, cities, campings and in the photos and videos we post on our socials (Instagram and Substack).',
    u_c: 'A place on this page with a link to your site.',
    d: 'This campaign has a 12 month period. Our channels for this trip are new, and this is our first time experimenting with automobile advertising. For these reasons we can\'t promise CTR or ROI, but the visibility is real and the vehicle will be seen in person and online.'
  },
  {
    q: 'How does payment work?',
    a: 'Auction spots use a card hold (pre-authorization). Nothing is charged to your card.',
    u_b: 'When you bid, your card limit is reserved for the bid amount. Nothing leaves your account.',
    u_c: 'If someone outbids you, the hold is released automatically when their bid goes live.',
    u_d: 'A spot closes five days after its first hold. The winner receives a contract and invoice and pays by bank transfer within 48 hours. Only then is the hold released.',
  },
  {
    q: 'What if someone outbids me?',
    a: 'The previous hold is released automatically. You keep your place in the bid history and can bid again if the auction rules allow a new offer.'
  },
  {
    q: 'Can any brand join?',
    a: 'Almost. Every sponsor is approved by hand before anything appears, and I keep the final say on what goes on the vehicle — it travels with me, after all. If your bid is refused, your card hold is released and no capture happens.'
  },
  {
    q: 'Why not just buy a motorhome?',
    a: 'Impecuniousness. I\'m in the most perfect moment to do this in terms of time, age, health, career, I just don\'t have the funds. If this flops, I\'ll keep looking for other ways to do the trip.'
  }
];


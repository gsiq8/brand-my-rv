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
  cornerLead: 'You can also brand this website. One spot, top of the page. Everyone who has held it stays on this list, with how long they lasted – being outbid moves you down, it does not remove you.',
  cornerNote: 'One-time payment, no refund.',
  disclaimer: '[Add your disclaimer, e.g. not affiliated with any brand shown.]',
  // Counter line under the hero. `viewsValue` is typed by hand (e.g. '2M+'); leave it '' to hide that item.
  counters: { viewsValue: '', viewsLabel: 'views on Instagram' },
  host: {
    name: 'Giovana',
    bio: 'Digital nomad for a year and something. Launching a new Substack to cover my roaming adventures and curation of spaces. Think ecoturism meets wellness, for extraordinary expirences in Latin America. ',
    links: [{ label: 'Substack', href: 'http://humansandhorses.substack.com' }, { label: 'Email me', href: 'mailto:contact@siquieroli.com' }],
  },
};

export const STEPS = [
  { t: 'Pick a spot and size', d: 'Spots across the sides, rear and roof of the motorhome – priced by size and visibility.' },
  { t: 'Place your bid', d: 'Upload your logo, set your bid and pay in full or reserve with a minimum U$10 deposit. The highest paid bid on each spot wins it.' },
  { t: 'Your logo rides along', d: 'During a 12 month road trip you logo rides alog with me across multiple countries and wild places. Printed in colored automotive vinyl.' },
];

export const SPECS: [string, string][] = [
  ['Chassis', 'For a Class C 4x4 or a truck-based 4x4 expedition motorhome. Make and model set by a chassis partner.'],
  ['Traction', '4x4 with locking differentials or low ranfe, and high ground clearence for dirt and snow roads.'],
  ['Length', '24 ft to 34 ft'],
  ['Fuel and Range', 'Diesel, with a range of at least 600mi (1,000 km) per tank.'],
  ['Solar', 'Roof array of at least 1,000 W'],
  ['Power', '20-24 Kwh lithium-ion battery bank, with a 5-7 kW inverter-charger'],
  ['Climate', 'Insulated for foour seasons, with a diesel heater and air conditioning that runs on battery or solar'],
  ['Where it travels', 'Built for heat, cold and snow, humid and dry climates. It can endure Latam\'s climate from south to north. '],
];

export const FAQ: { q: string; a: string; [key: string]: string | undefined; }[] = [
  /*site.ts*/
  {
  q: 'Is this real?',
  a: 'Absolutely. This is a 12 month expedition across Patagonia to San Francisco. I\'ve been a digital nomad for a year now, staying at Airbnbs for one to three months at each location.',
  b: 'Nevertheless, it is a working life, and I spent many days locked inside somebody else\'s apartment. I really enjoy this lifestyle, tho. To get the most out of this time in my life, I want to facilitate exploration and be closer to nature by motorhoming.',
  c: 'Like me, your brand will meet curious, adventurous people and wild places.'
},
{ 
  q: 'Why this motorhome?', 
  a: 'A Class C size is the minimum size we feel comfortable doing this long trip. We need 4x4 traction for snow, overlanding and adaptablity. We\'re open to chassis and builder partners that meet these criteria.' 
},
{ 
  q: 'What do I actually get?', 
  a: 'Your brand showing up on social and in real life:',
  u_b: 'On the spot you choose, visible on the road, cities, campings and in the photos and videos we post on our socials (Instagram and Substack).',
  u_c: 'A place on this page with a link to your site.',
  d: 'This campaign has a 12 month period. Our channels for this trip are new, and is our first time experimenting with automobile advertising. For these reasons we can\'t promisse CTR or ROI, but we\'ll track it and report back to you.' 
},
{ 
  q: 'How does payment work?', 
  a: 'Bidding takes a 20% deposit (minimum U$10), paid by card when you place the bid. If you don\'t win, it comes back in full, automatically. If you do, it counts toward the price and I send a payment link for the remainder. Bids are settled in dolars.' 
},
{ 
  q: 'What if someone outbids me?', 
  a: 'You get an honorable mention in the bid history and the chance to swing back. Outbids need to beat the current bid by at least U$10.' 
},
{ 
  q: 'Can any brand join?', 
  a: 'Almost. Every sponsor is approved by hand before anything appears, and I keep the final say on what goes on the vehicle — it travels with me, after all. If your bid is refused, your deposit comes back in full.' 
},
{ 
  q: 'Why not just buy a motorhome?', 
  a: 'Impecuniousness. I\'m in the most perfect moment to do this in terms of time, age, health, career, I just don\'t have the funds. If this flops, I\'ll keep looking for other ways to do the trip, but eventually this window of opportunity will close and may never happen again.' 

}
];

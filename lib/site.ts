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
  specsNote: 'The chassis comes from a manufacturer partner, so the final model is confirmed once a partner signs on. Anything raised past the goal pays for fuel, maintenance and the next trip. Check the price.',
  cornerLead: 'You can also brand this website. One spot, top of the page. Everyone who has held it stays on this list, with how long they lasted – being outbid moves you down, it does not remove you.',
  cornerNote: 'One-time payment. [State your refund policy.]',
  disclaimer: '[Add your disclaimer, e.g. not affiliated with any brand shown.]',
  // Counter line under the hero. `viewsValue` is typed by hand (e.g. '2M+'); leave it '' to hide that item.
  counters: { viewsValue: '', viewsLabel: 'views on Instagram' },
  host: {
    name: '[Your name]',
    bio: '[Two or three lines about you and the motorhome: who you are, where you travel, what you post and where.]',
    links: [{ label: 'Instagram', href: '#' }, { label: 'Email me', href: 'mailto:you@example.com' }],
  },
};

export const STEPS = [
  { t: 'Pick a spot and size', d: 'Spots across the sides, rear and roof of the motorhome – priced by size and visibility.' },
  { t: 'Place your bid', d: 'Upload your logo, set your bid and pay in full or reserve with a deposit. The highest paid bid on each spot wins it.' },
  { t: 'Your logo rides along', d: '[Describe how the ad is applied, e.g. printed vinyl, for how long, and what you post / where the motorhome goes.]' },
];

export const SPECS: [string, string][] = [
  ['Chassis', 'For a Class C 4x4 or a truck-based 4x4 expedition motorhome. Make and and model set by a chassis partner.'],
  ['Traction', '4x4 with locking differentials or low ranfe, and high ground clearence for dirt and snow roads.'],
  ['Length', '24 ft to 34 ft'],
  ['Fuel and Range', 'Diesel, with a range of at least 600mi (1,000 km) per tank.'],
  ['Solar', 'Roof array of at least 1,000 W'],
  ['Power', '20-24 Kwh lithium-ion battery bank, with a 5-7 kW inverter-charger'],
  ['Climate', 'Insulated for foour seasons, with a diesel heater and air conditioning that runs on battery or solar'],
  ['Where it travels', 'Built for heat, cold and snow, humid and dry climates. It can endure Latam\'s climate from south to north.'],
];

export const FAQ: { q: string; a: string }[] = [
  { q: 'Is this real?', a: '[Yes. Describe the motorhome, your route and how long the ads stay on.]' },
  { q: 'Why this motorhome?', a: '[Tell the story: why a Super C, where it goes, what you do with it.]' },
  { q: 'What do I actually get?', a: 'Your logo on the spot you choose, visible on the road and in the photos and videos [describe where you post], plus a place on this page with a link to your site. [Confirm the material and the campaign length, and what you can’t promise (impressions, ROI).]' },
  { q: 'How does payment work?', a: 'You can pay in full at a secure checkout (card, and other methods when available), or reserve a spot with a deposit. With a deposit your offer is registered and we contact you to arrange the balance by invoice or bank transfer. Your logo goes live on the motorhome when the payment is confirmed.' },
  { q: 'What if someone outbids me?', a: 'The highest paid bid on a spot is the one shown. A new bid must beat the current one by the minimum step. [Explain what happens to an outbid advertiser: refund, credit, or the campaign continues.]' },
  { q: 'Can any brand join?', a: 'Almost. [List your content rules, e.g. no adult, gambling or misleading ads.] We can refuse a logo; if that happens you are refunded.' },
  { q: 'Where does the money go?', a: '[Explain: fuel, maintenance, the next trip…]' },
  { q: 'Are there any restrictions on the ads?', a: 'We can refuse a logo; if that happens you are refunded. The chassis spot is reserved for truck makers (Iveco, Mercedes-Benz, Ford, Toyota…).' }
];

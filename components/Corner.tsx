'use client';
import { COPY } from '@/lib/site';
import { SPOTS } from '@/lib/spots';
import { cornerHolders, heldFor } from '@/lib/corner';
import { money } from '@/lib/format';
import type { BoardEntry, HistoryItem } from '@/lib/types';
import BrandLink from './BrandLink';

export default function Corner({ entry, items, onBid }: { entry?: BoardEntry; items: HistoryItem[]; onBid: () => void }) {
  const spot = SPOTS.find((s) => s.id === 'corner');
  if (!spot) return null;
  const holders = cornerHolders(items);
  return (
    <section className="wrap faq-sec" id="corner">
      <h2>The strip</h2>
      <p className="lead">{COPY.cornerLead}</p>
      <ul className="corner-list">
        {holders.length === 0 && <li className="muted">Nobody yet – be the first.</li>}
        {holders.map((h) => (
          <li key={h.item.id}>
            {h.item.logoUrl
              ? <BrandLink href={h.item.website}><img src={h.item.logoUrl} alt="" /></BrandLink>
              : <span className="av">{h.item.name.slice(0, 1).toUpperCase()}</span>}
            <BrandLink href={h.item.website}><b>{h.item.name}</b></BrandLink><span className="amt">{money(h.item.amount)}</span>
            {h.current ? <span className="chip sold">at the top now</span> : <span className="muted small">held {heldFor(h.heldMs)}</span>}
          </li>
        ))}
      </ul>
      <button className="btn pri" onClick={onBid}>Take the strip — {money(entry?.min ?? spot.price)}</button>
      <p className="muted small" style={{ marginTop: 10 }}>{COPY.cornerNote}</p>
    </section>
  );
}
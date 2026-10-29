/* eslint-disable @next/next/no-img-element */

'use client';
import { useEffect, useRef, useState } from 'react';
import { COPY } from '@/lib/site';
import { SPOTS } from '@/lib/spots';
import { cornerHolders, heldFor } from '@/lib/corner';
import { money } from '@/lib/format';
import type { BoardEntry, HistoryItem } from '@/lib/types';
import BrandLink from './BrandLink';
import Glass from './glass';

type Holder = ReturnType<typeof cornerHolders>[number];

function Row({ h }: { h: Holder }) {
  return (
    <li className="cr-row">
      {h.item.logoUrl
        ? <BrandLink href={h.item.website}>

          <img
            src={h.item.logoUrl}
            alt=""
          />
        </BrandLink>
        : <span className="av">{h.item.name.slice(0, 1).toUpperCase()}</span>}
      <BrandLink href={h.item.website}><b>{h.item.name}</b></BrandLink>
      <span className="amt">{money(h.item.amount)}</span>
      {h.current
        ? <span className="chip sold">at the top now</span>
        : <span className="muted small">held {heldFor(h.heldMs)}</span>}
    </li>
  );
}

export default function Corner({ entry, items, onBid }: { entry?: BoardEntry; items: HistoryItem[]; onBid: () => void }) {
  const spot = SPOTS.find((s) => s.id === 'corner');

  // The Glass shrink-wraps its content, so % widths don't work inside it.
  // Measure the stage (full width of the section's wrap) and give the card that width in px.
  const stage = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState<number>();
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setWidth(el.clientWidth));
    ro.observe(el);
    setWidth(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  if (!spot) return null;

  const holders = cornerHolders(items);
  // Assumes the current holder is flagged; falls back to the first entry.
  const winner = holders.find((h) => h.current) ?? holders[0];
  const past = holders.filter((h) => h !== winner);

  // liquid-glass-react measures its content once and draws its shape/border layers at that size.
  // Starting empty ("Nobody yet") and then growing left the old, small outline behind.
  // Changing the key remounts the Glass so it re-measures whenever the card's size changes.
  const glassKey = `${winner ? 1 : 0}-${Math.min(past.length, 3)}-${width ?? 0}`;

  return (
    <section className="wrap faq-sec" id="corner">
      <h2>The strip</h2>
      <p className="lead">{COPY.cornerLead}</p>

      <div className="cr-stage" ref={stage} style={width ? ({ ['--cr-width' as string]: `${width}px` }) : undefined}>
        <Glass
          key={glassKey}
          className="cr-glass"
          mode="polar"
          displacementScale={70}
          blurAmount={0.02}
          saturation={140}
          aberrationIntensity={2}
          elasticity={0}
          cornerRadius={14}
          padding="0"
          style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
        >
          <div className="cr-card">
            {!winner && (
              <p className="muted" style={{ margin: 0, padding: '0 20px', height: 'var(--cr-row)', display: 'flex', alignItems: 'center' }}>
                Nobody yet – be the first.
              </p>
            )}

            {winner && (
              <div className="cr-viewport" style={{ ['--cr-n' as string]: Math.min(past.length, 3) }}>
                {/* Winner floats over the list, like Finder's window controls */}
                <ul className="cr-winner"><Row h={winner} /></ul>

                {/* Static blur bands: always on, same strength wherever the list is scrolled */}
                <span className="cr-fade cr-fade-top" aria-hidden />
                <div className="cr-scroll" tabIndex={0} role="region" aria-label="Previous holders">
                  <ul>{past.map((h) => <Row key={h.item.id} h={h} />)}</ul>
                </div>
                <span className="cr-fade cr-fade-bottom" aria-hidden />
              </div>
            )}
          </div>
        </Glass>
      </div>

      <button className="btn pri" onClick={onBid}>Take the strip — {money(entry?.min ?? spot.price)}</button>
      <p className="muted small" style={{ marginTop: 10 }}>{COPY.cornerNote}</p>
    </section>
  );
}
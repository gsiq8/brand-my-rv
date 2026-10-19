'use client';
import { cornerHolders } from '@/lib/corner';
import { money } from '@/lib/format';
import type { BoardEntry, HistoryItem } from '@/lib/types';
import LiquidGlass from './glass';

const REPEAT = 8; // copies per group; raise it if the loop shows a gap on very wide screens

/** `top` = sticky offset in px: 54 under the site header, 0 on pages without a header. */
export default function TopStrip({ items, entry, onClaim, top = 53 }: { items: HistoryItem[]; entry?: BoardEntry; onClaim: () => void; top?: number }) {
  const now = cornerHolders(items).find((h) => h.current);
  if (!now) return null;
  const { name, logoUrl, amount, website } = now.item;

  const chip = (k: number, hidden: boolean) => {
    const body = (<>
      {logoUrl ? <img src={logoUrl} alt="" /> : <span className="av">{name.slice(0, 1).toUpperCase()}</span>}
      <b>{name}</b>
      <span className="muted small">paid {money(amount)}</span>
    </>);
    return website
      ? <a key={k} className="prev-i mq-i" href={website} target="_blank" rel="noopener noreferrer sponsored" tabIndex={hidden ? -1 : undefined}>{body}</a>
      : <span key={k} className="prev-i mq-i">{body}</span>;
  };

return (
  <LiquidGlass
    className="strip-lg"
    padding="0" cornerRadius={0} mode="polar"
    blurAmount={0.2} aberrationIntensity={4} saturation={160}
    elasticity={0} displacementScale={10}
    style={{ position: 'fixed', top: `${top + 25}px`, left: '50%' }}
  >
    <div className="strip-in">
      <div className="mq" aria-label={`${name} holds the corner, paid ${money(amount)}`}>
        <div className="mq-track">
          {[0, 1].map((g) => (
            <div key={g} className="mq-group" aria-hidden={g === 1}>
              {Array.from({ length: REPEAT }, (_, i) => chip(i, g === 1))}
            </div>
          ))}
        </div>
      </div>
      <button className="btn" onClick={onClaim}>Claim for {money(entry?.min ?? amount + 10)}</button>
    </div>
  </LiquidGlass>
);
}
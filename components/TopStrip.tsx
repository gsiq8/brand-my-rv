'use client';
import { cornerHolders } from '@/lib/corner';
import { money } from '@/lib/format';
import type { BoardEntry, HistoryItem } from '@/lib/types';

const REPEAT = 8; // copies per group; raise it if the loop shows a gap on very wide screens

export default function TopStrip({ items, entry, onClaim }: { items: HistoryItem[]; entry?: BoardEntry; onClaim: () => void }) {
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
    <div className="strip">
      <div className="wrap strip-in">
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
    </div>
  );
}
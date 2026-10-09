'use client';
import { cornerHolders, heldFor } from '@/lib/corner';
import { money } from '@/lib/format';
import type { BoardEntry, HistoryItem } from '@/lib/types';

/** "Previously here" strip + current corner holder, right under the header. */
export default function TopStrip({ items, entry, onClaim }: { items: HistoryItem[]; entry?: BoardEntry; onClaim: () => void }) {
  const holders = cornerHolders(items);
  const now = holders.find((h) => h.current);
  const before = holders.filter((h) => !h.current);
  if (!now) return null;
  const av = (n: string, src: string | null) => src ? <img src={src} alt="" /> : <span className="av">{n.slice(0, 1).toUpperCase()}</span>;
  return (
    <div className="strip">
      <div className="wrap strip-in">
        {before.length > 0 && (
          <div className="prev">
            <span className="muted small">Previously here</span>
            {before.slice(0, 3).map((h) => (
              <span key={h.item.id} className="prev-i">{av(h.item.name, h.item.logoUrl)}<b>{h.item.name}</b><span className="muted small">{heldFor(h.heldMs)} · {money(h.item.amount)}</span></span>
            ))}
            <a className="small" href="#corner">See all {holders.length} →</a>
          </div>
        )}
        <div className="now">
          <span className="prev-i">{av(now.item.name, now.item.logoUrl)}<b>{now.item.name}</b><span className="muted small">paid {money(now.item.amount)}</span></span>
          <button className="btn" onClick={onClaim}>Claim for {money(entry?.min ?? now.item.amount + 10)}</button>
        </div>
      </div>
    </div>
  );
}

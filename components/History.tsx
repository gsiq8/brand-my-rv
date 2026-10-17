'use client';
import { SPOTS, groupOf, isRv } from '@/lib/spots';
import { money } from '@/lib/format';
import type { BoardEntry, HistoryItem } from '@/lib/types';
import BrandLink from './BrandLink';

export default function History({ items, board }: { items: HistoryItem[]; board: Record<string, BoardEntry> }) {
  const spot = (id: string) => SPOTS.find((s) => s.id === id);
  const label = (id: string) => { const s = spot(id); return s ? `${s.name} · ${isRv(s) ? groupOf(s) : 'Website'}` : id; };
  const win = (x: HistoryItem) => { const l = board[x.spotId]?.leader; return !!l && l.amount === x.amount && l.name === x.name; };
  const sum = (l: HistoryItem[]) => l.reduce((n, x) => n + x.amount, 0);
  const days = new Map<string, HistoryItem[]>();
  for (const it of items) {
    const k = new Date(it.at).toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
    days.set(k, [...(days.get(k) ?? []), it]);
  }
  return (
    <section className="wrap card-sec" id="history">
      <h3>Day by day</h3>
      <p className="lead small">Number in <span className="g">green</span> = they hold their spot</p>
      {days.size === 0 ? <p className="muted">No bids yet.</p> : (
        <div className="days">
          {[...days.entries()].map(([day, list]) => {
            const won = sum(list.filter(win));
            return (
              <details key={day} className="day">
                <summary>
                  <span><b>{day}</b><span className="muted small block">{list.length} bid{list.length > 1 ? 's' : ''} · {money(sum(list))} bid</span></span>
                  <span className={'won' + (won ? '' : ' zero')}>{money(won)}</span><i className="chev-s" />
                </summary>
                <ul>{list.map((x) => (
                  <li key={x.id}>
                    {x.logoUrl ? <BrandLink href={x.website}> src={x.logoUrl} alt=""</BrandLink> : <span className="av">{x.name.slice(0, 1).toUpperCase()}</span>}
                    <BrandLink><span><b>{x.name}</b> · {label(x.spotId)}</span></BrandLink>
                    <span className={'amt' + (win(x) ? ' win' : '')}>{money(x.amount)}</span>
                  </li>
                ))}</ul>
              </details>
            );
          })}
        </div>
      )}
    </section>
  );
}
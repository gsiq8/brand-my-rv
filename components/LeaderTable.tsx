'use client';
import { SPOTS } from '@/lib/spots';
import { money } from '@/lib/format';
import BrandLink from './BrandLink';
import type { BoardEntry } from '@/lib/types';
import Medal from './Medal';

/** Ranked table of the paid leaders. Pass `limit` to show only the top N. */
export default function LeaderTable({ entries, limit }: { entries: BoardEntry[]; limit?: number }) {
  const rows = entries.filter((e) => e.leader).sort((a, b) => b.leader!.amount - a.leader!.amount).slice(0, limit);
  return (
    <div className="card tbl">
      <table>
        <thead><tr><th>Brand</th><th>Spot</th><th>Logo</th><th className="r">Current bid</th></tr></thead>
        <tbody>
          {rows.map((e, i) => {
            const L = e.leader!;
            return (
              <tr key={e.spotId} style={{ cursor: 'default' }}>
                <td><Medal rank={i + 1} className="mr-3.5" /><span className="medium"><BrandLink href={L.website}>{L.name}</BrandLink></span></td>
                <td><span className="muted small">{SPOTS.find((s) => s.id === e.spotId)?.name}</span></td>
                <td className="held">{L.logoUrl ? <BrandLink href={L.website}><img src={L.logoUrl} alt={L.name} /></BrandLink> : <span className="muted">–</span>}</td>
                <td className="r"><b>{money(L.amount)}</b><div className="muted small">{e.bids} bid{e.bids === 1 ? '' : 's'}</div></td>
              </tr>
            );
          })}
          {rows.length === 0 && <tr><td colSpan={4} className="muted">No paid bids yet.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
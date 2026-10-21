'use client';
import { money } from '@/lib/format';
import BrandLink from './BrandLink';
import Medal from './Medal';
import type { BoardEntry } from '@/lib/types';

/** Ranked list of the paid leaders. Pass `limit` to show only the top N. */
export default function LeaderTable({ entries, limit }: { entries: BoardEntry[]; limit?: number }) {
  const rows = entries
    .filter((e) => e.leader)
    .sort((a, b) => b.leader!.amount - a.leader!.amount)
    .slice(0, limit);

  if (rows.length === 0) return <p className="muted">No paid bids yet.</p>;

  return (
    <ol className="brands card">
      {rows.map((e, i) => {
        const L = e.leader!;
        return (
          <li key={e.spotId} className="brand-row">
            <Medal rank={i + 1} />
            <span className="brand-logo">
              {L.logoUrl
                ? <BrandLink href={L.website}><img src={L.logoUrl} alt={L.name} /></BrandLink>
                : <span className="muted">–</span>}
            </span>
            <span className="brand-name"><BrandLink href={L.website}>{L.name}</BrandLink></span>
            <span className="brand-bid">
              <b>{money(L.amount)}</b>
              <small className="muted">{e.bids} bid{e.bids === 1 ? '' : 's'}</small>
            </span>
          </li>
        );
      })}
    </ol>
  );
}
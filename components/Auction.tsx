'use client';
import { useState } from 'react';
import { COPY } from '@/lib/site';
import { CONFIG } from '@/lib/config';
import { RV_SPOTS, groupOf, sizeInfo } from '@/lib/spots';
import { money } from '@/lib/format';
import type { BoardEntry, BoardResponse } from '@/lib/types';

const GROUPS = ['All spots', 'Sides', 'Rear', 'Roof'];

export default function Auction({ data, onBid }: { data: BoardResponse | null; onBid: (id: string) => void }) {
  const [group, setGroup] = useState('All spots');
  const by: Record<string, BoardEntry> = Object.fromEntries((data?.board ?? []).map((e) => [e.spotId, e]));
  const all = RV_SPOTS.map((s, i) => ({ s, i: i + 1, e: by[s.id] }))
    .sort((a, b) => (b.e?.leader?.amount ?? 0) - (a.e?.leader?.amount ?? 0) || b.s.price - a.s.price);
  const list = all.filter((x) => group === 'All spots' || groupOf(x.s) === group);
  const top = all.filter((x) => x.e?.leader).slice(0, 3);
  const taken = all.filter((x) => x.e?.leader).length;
  const live = !CONFIG.auctionEnd || Date.now() < new Date(CONFIG.auctionEnd).getTime();
  const tiers = ['Small', 'Medium', 'Large'].map((l) => {
    const p = RV_SPOTS.filter((s) => sizeInfo(s).label === l).map((s) => s.price);
    return p.length ? `${l} from ${money(Math.min(...p))}` : null;
  }).filter(Boolean).join(' · ');

  return (
    <section className="wrap card-sec" id="spots">
      <div className="status">
        <span className={'live-dot' + (live ? ' on' : '')} aria-hidden="true" />
        <span>{live ? 'Auction live' : 'Auction ended'}</span>
        <span className="muted">· {taken} of {RV_SPOTS.length} spots taken</span>
      </div>
      <h2>{live ? 'The auction, live.' : 'The auction, closed.'}</h2>
      <p className="lead">{COPY.auctionSub} {tiers}, priced by size and visibility (per {CONFIG.periodLabel}).</p>

      {top.length > 0 && (<>
        <div className="row-h"><h3>Top brands on the motorhome</h3><a href="/leaderboard">Leaderboard →</a></div>
        <ol className="top3">
          {top.map(({ s, e }, k) => (
            <li key={s.id} className="top-card">
              <span className="rank">{k + 1}</span>
              {e!.leader!.logoUrl && <img src={e!.leader!.logoUrl} alt={e!.leader!.name} />}
              <div><b>{e!.leader!.name}</b><div className="muted small">{s.name}</div></div>
              <span className="amt">{money(e!.leader!.amount)}</span>
            </li>
          ))}
        </ol>
      </>)}

      <div className="row-h">
        <div className="tabs-f">{GROUPS.map((g) => <button key={g} className={g === group ? 'on' : ''} onClick={() => setGroup(g)}>{g}</button>)}</div>
        <span className="muted small">{data?.stats.bids ?? 0} bids in total</span>
      </div>
      <div className="card tbl"><table>
      <thead><tr><th>Spot</th><th>Size</th><th>Held by</th><th className="r">Current bid</th></tr></thead>
      <tbody>
        {list.map(({ s, i, e }) => (
          <tr key={s.id} onClick={() => onBid(s.id)} tabIndex={0} onKeyDown={(ev) => ev.key === 'Enter' && onBid(s.id)}>
            <td>
              <span className="badge">{i}</span>
              <span className="medium">{s.name}</span>
            </td>
            <td>
              <span className="sz">{sizeInfo(s).label[0]}</span>
              <span className="muted small">{sizeInfo(s).cm.replace('≈ ', '')}</span>
            </td>
            <td className="held">{e?.leader ? (e.leader.logoUrl ? 
              <img src={e.leader.logoUrl} alt={e.leader.name} /> : e.leader.name) : <span className="muted">Open</span>}
            </td>
            <td className="r"><b>{e?.leader ? money(e.leader.amount) : `from ${money(s.price)}`}</b>
            <div className="muted small">{e?.bids ?? 0} bid{e?.bids === 1 ? '' : 's'}</div></td>
          </tr>
        ))}
      </tbody>
    </table></div>
    </section>
  );
}

'use client';
import { useState } from 'react';
import { COPY } from '@/lib/site';
import { CONFIG } from '@/lib/config';
import { RV_SPOTS, groupOf, sizeInfo } from '@/lib/spots';
import { money } from '@/lib/format';
import type { BoardEntry, BoardResponse } from '@/lib/types';
import LeaderTable from './LeaderTable';
import Countdown from './Countdown';

const GROUPS = ['All spots', 'Sides', 'Rear', 'Roof'];

function closing(e?: BoardEntry) {
  switch (e?.state) {
    case 'settled': return <span className="chip sold">Sold</span>;
    case 'closed': return <span className="chip wait">Closed · awaiting wire</span>;
    case 'defaulted': return <span className="chip wait">Unsold · fee charged</span>;
    default:
      return e?.closesAt
        ? <Countdown until={e.closesAt} />
        : <span className="muted small">Starts with first hold</span>;
  }
}

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
    <div className="all">
      <section className="wrap card-sec" id="spots">
        <div className="status">
          <span className={'live-dot' + (live ? ' on' : '')} aria-hidden="true" />
          <span>{live ? 'Auction live' : 'Auction ended'}</span>
          <span className="muted">· {taken} of {RV_SPOTS.length} spots taken</span>
        </div>
        <h2>{live ? 'The auction, live.' : 'The auction, closed.'}</h2>
        <p className="lead">{COPY.auctionSub} {tiers}, priced by size and visibility (per {CONFIG.periodLabel}). A spot closes {CONFIG.closeDays} days after its first bid.</p>

        {top.length > 0 && (<>
          <div className="row-h"><h3>Top brands on the motorhome</h3><a href="/leaderboard">Leaderboard →</a></div>
          <LeaderTable entries={data?.board ?? []} limit={3} />
        </>)}

        <div className="row-h">
          <div className="seg" role='tablsit' aria-label='View'>
            {GROUPS.map((g) => <button key={g} className={g === group ? 'on' : ''} onClick={() => setGroup(g)}>{g}</button>)}</div>
          <span className="muted small">{data?.stats.bids ?? 0} bids in total</span>
        </div>
        <div className="card tbl"><table>
          <thead><tr><th>Spot</th><th>Size</th><th>Held by</th><th>Closes</th><th className="r">Current bid</th></tr></thead>
          <tbody>
            {list.map(({ s, i, e }) => {
              const open = !e?.state || e.state === 'open';
              return (
                <tr key={s.id}
                  onClick={() => open && onBid(s.id)}
                  tabIndex={open ? 0 : -1}
                  onKeyDown={(ev) => open && ev.key === 'Enter' && onBid(s.id)}
                  style={open ? undefined : { cursor: 'default', opacity: 0.7 }}>
                  <td>
                    <span className="badge">{i}</span>
                    <span className="medium">{s.name}</span>
                    {s.truckOnly && <span className="chip wait" style={{ marginLeft: 8 }}>Truck brands only</span>}
                    {s.builderOnly && <span className="chip wait" style={{ marginLeft: 8 }}>Builder brands only</span>}
                  </td>
                  <td>
                    <span className="sz">{sizeInfo(s).label[0]}</span>
                    <span className="muted small">{sizeInfo(s).cm.replace('≈ ', '')}</span>
                  </td>
                  <td className="held">{e?.leader ? (() => {
                    const L = e.leader;
                    const inner = L.logoUrl ? <img src={L.logoUrl} alt={L.name} /> : L.name;
                    return L.website
                      ? <a href={L.website} target="_blank" rel="noopener noreferrer sponsored"
                          onClick={(ev) => ev.stopPropagation()} onKeyDown={(ev) => ev.stopPropagation()}>{inner}</a>
                      : inner;
                  })() : <span className="muted">Open</span>}
                  </td>
                  <td className="small">{closing(e)}</td>
                  <td className="r"><b>{e?.leader ? money(e.leader.amount) : `from ${money(s.price)}`}</b>
                    <div className="muted small">{e?.bids ?? 0} bid{e?.bids === 1 ? '' : 's'}</div></td>
                </tr>
              );
            })}
          </tbody>
        </table></div>
      </section>
    </div>
  );
}
/* eslint-disable @next/next/no-img-element */

'use client';
import { useState, useEffect } from 'react';
import { COPY } from '@/lib/site';
import { CONFIG } from '@/lib/config';
import { RV_SPOTS, groupOf, sizeInfo } from '@/lib/spots';
import { money } from '@/lib/format';
import type { BoardEntry, BoardResponse } from '@/lib/types';
import LeaderTable from './LeaderTable';
import Countdown from './Countdown';

const GROUPS = ['All spots', 'Front', 'Rear', 'Roof'];

// Pass `now` into closing so it updates dynamically with your live timer
function closing(e?: BoardEntry, now: number = Date.now()) {
  const expired = !!e?.closesAt && new Date(e.closesAt).getTime() <= now;

  if (expired && (!e?.state || e.state === 'open')) {
    return <span className="text-[#EC2128] font-bold wait">Expired</span>;
  }

  switch (e?.state) {
    case 'settled': return <span className="chip sold">Sold</span>;
    case 'closed': return <span className="text-[#EC2128] font-bold wait">Closed</span>;
    case 'defaulted': return <span className="chip wait">Unsold · fee charged</span>;
    default:
      return e?.closesAt
        ? <Countdown until={e.closesAt} />
        : <span className="muted md:small text-[9px]">Starts with first hold</span>;
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
  
  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const live = !CONFIG.auctionEnd || now < new Date(CONFIG.auctionEnd).getTime();
  const tiers = ['Small', 'Medium', 'Large'].map((l) => {
    const p = RV_SPOTS.filter((s) => sizeInfo(s).label === l).map((s) => s.price);
    return p.length ? `${l} from ${money(Math.min(...p))}` : null;
  }).filter(Boolean).join(' · ');

  return (
    <div className="all">
      <section className="wrap card-sec auction" id="spots">
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
          <div className="seg" role="tablist" aria-label="Group">{
          GROUPS.map((g) => <button key={g} className={g === group ? 'on' : ''} onClick={() => setGroup(g)}>{g}</button>)}</div>
          <span className="muted small">{data?.stats.bids ?? 0} bids in total</span>
        </div>

        <div className="card tbl stack cards">
          <table>
            <thead>
              <tr>
                <th>Spot</th><th>Size</th><th>Held by</th><th>Closes</th><th className="r">Current bid</th>
              </tr>
            </thead>
            <tbody>
              {list.map(({ s, i, e }) => {
                const expired = !!e?.closesAt && new Date(e.closesAt).getTime() <= now;
                const isOpenState = !e?.state || e.state === 'open';
                const canBid = isOpenState && !expired;
                
                const info = sizeInfo(s);
                const cm = info.cm.replace('≈ ', '');
                return (
                  <tr key={s.id}
                    onClick={() => canBid && onBid(s.id)}
                    tabIndex={canBid ? 0 : -1}
                    onKeyDown={(ev) => canBid && ev.key === 'Enter' && onBid(s.id)}
                    style={canBid ? undefined : { cursor: 'default', opacity: 0.7 }}>

                    <td className="c-spot">
                      <span className="badge">{i}</span>
                      <span className="spot-name">
                        <span className="medium">{s.name}</span>
                        {s.truckOnly && <span className="chip wait" style={{ marginLeft: 8 }}>Truck brands only</span>}
                        {s.builderOnly && <span className="chip wait" style={{ marginLeft: 8 }}>Builder brands only</span>}
                      </span>
                    </td>

                    <td className="c-size">
                      <span className="sz">{info.label[0]}</span>
                      <span className="muted small">{cm}</span>
                      <span className="size-full">{info.label} · {cm}</span>
                    </td>

                    <td className="held c-held">{e?.leader ? (() => {
                      const L = e.leader;
                      const inner = L.logoUrl ? 
                      
                        <img 
                          src={L.logoUrl} 
                          alt={L.name}                   
                          style={{ objectFit: 'contain'}}
                         
                        /> : L.name;
                      return L.website
                        ? <a href={L.website} target="_blank" rel="noopener noreferrer sponsored"
                          onClick={(ev) => ev.stopPropagation()} onKeyDown={(ev) => ev.stopPropagation()}>{inner}</a>
                        : inner;
                    })() : <span className="muted">Open</span>}
                    </td>

                    <td className="small c-closes">{closing(e, now)}</td>

                    <td className="r c-bid">
                      <b>{e?.leader ? money(e.leader.amount) : `from ${money(s.price)}`}</b>
                      <div className="muted small c-qty">
                        <a href={`/leaderboard?spot=${s.id}`}
                          onClick={(ev) => ev.stopPropagation()}
                          onKeyDown={(ev) => ev.stopPropagation()}
                          style={{ color: 'inherit', textDecoration: 'underline' }}>
                          {e?.bids ?? 0} bid{e?.bids === 1 ? '' : 's'}
                        </a>
                      </div>
                      <div className="c-closes-m small">{closing(e, now)}</div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
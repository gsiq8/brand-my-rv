'use client';
import { useEffect, useMemo, useState } from 'react';
import { SPOTS, isRv } from '@/lib/spots';
import { COPY } from '@/lib/site';
import { money } from '@/lib/format';
import type { BoardResponse } from '@/lib/types';

/** Replays the auction: who held each spot at every moment a paid bid was placed. */
export default function Replay() {
  const [d, setD] = useState<BoardResponse | null>(null);
  const [i, setI] = useState(0);
  const [play, setPlay] = useState(false);
  useEffect(() => { fetch('/api/board', { cache: 'no-store' }).then((r) => r.json()).then((x: BoardResponse) => { setD(x); setI(Math.max(0, x.history.filter((h) => h.status === 'paid').length - 1)); }).catch(() => {}); }, []);
  const events = useMemo(() => (d?.history ?? [])
  .filter((h) => ['paid', 'won', 'settled', 'defaulted', 'outbid'].includes(h.status))
  .sort((a, b) => +new Date(a.at) - +new Date(b.at)), [d]);
    useEffect(() => {
    if (!play) return;
    const t = setInterval(() => setI((n) => { if (n >= events.length - 1) { setPlay(false); return n; } return n + 1; }), 700);
    return () => clearInterval(t);
  }, [play, events.length]);

  const upto = events.slice(0, i + 1);
  const held = SPOTS.filter(isRv).map((s) => ({ s, top: upto.filter((e) => e.spotId === s.id).sort((a, b) => b.amount - a.amount)[0] }));
  const cur = events[i];
  return (
    <main className="wrap sec">
      <a href="/">← {COPY.name}</a>
      <h2 style={{ marginTop: 16 }}>Replay</h2>
      <p className="lead">Watch the auction unfold, one paid bid at a time.</p>
      {events.length === 0 ? <p className="muted">No paid bids yet.</p> : (<>
        <div className="row" style={{ alignItems: 'center', marginBottom: 14 }}>
          <button className="btn" onClick={() => { if (i >= events.length - 1) setI(0); setPlay(!play); }}>{play ? 'Pause' : 'Play'}</button>
          <input type="range" min={0} max={events.length - 1} value={i} onChange={(e) => { setPlay(false); setI(+e.target.value); }} style={{ flex: 4 }} />
        </div>
        <p className="muted small">{cur && `${new Date(cur.at).toLocaleString('en-US')} – ${cur.name} bid ${money(cur.amount)}`}</p>
        <ol className="top3">
          {held.map(({ s, top }) => (
            <li key={s.id} className="top-card">
              {top?.logoUrl ? <img src={top.logoUrl} alt="" /> : <span className="av">–</span>}
              <div><b>{top ? top.name : 'Open'}</b><div className="muted small">{s.name}</div></div>
              <span className="amt">{top ? money(top.amount) : ''}</span>
            </li>
          ))}
        </ol>
      </>)}
    </main>
  );
}

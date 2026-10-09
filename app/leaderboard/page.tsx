'use client';
import { useEffect, useState } from 'react';
import { SPOTS } from '@/lib/spots';
import { COPY } from '@/lib/site';
import { money } from '@/lib/format';
import type { BoardResponse } from '@/lib/types';

export default function Leaderboard() {
  const [d, setD] = useState<BoardResponse | null>(null);
  useEffect(() => { fetch('/api/board', { cache: 'no-store' }).then((r) => r.json()).then(setD).catch(() => {}); }, []);
  const rows = (d?.board ?? []).filter((e) => e.leader).sort((a, b) => b.leader!.amount - a.leader!.amount);
  return (
    <main className="wrap sec">
      <a href="/">← {COPY.name}</a>
      <h2 style={{ marginTop: 16 }}>Leaderboard</h2>
      <p className="lead">Highest paid bid per spot.</p>
      <ol className="top3">
        {rows.map((e, i) => (
          <li key={e.spotId} className="top-card">
            <span className="rank">{i + 1}</span>
            {e.leader!.logoUrl && <img src={e.leader!.logoUrl} alt={e.leader!.name} />}
            <div><b>{e.leader!.name}</b><div className="muted small">{SPOTS.find((s) => s.id === e.spotId)?.name} · {e.bids} bid{e.bids === 1 ? '' : 's'}</div></div>
            <span className="amt">{money(e.leader!.amount)}</span>
          </li>
        ))}
        {d && rows.length === 0 && <li className="muted">No paid bids yet.</li>}
      </ol>
    </main>
  );
}

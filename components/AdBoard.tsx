'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { SPOTS } from '@/lib/spots';
import type { BoardEntry } from '@/lib/types';
import type { ViewName } from './Motorhome3D';
import BidWizard, { money } from './BidWizard';

const Motorhome3D = dynamic(() => import('./Motorhome3D'), { ssr: false, loading: () => <div className="load">Loading 3D model…</div> });
const VIEW_BUTTONS: ViewName[] = ['front', 'back', 'left', 'right', 'top', '3D'];

export default function AdBoard() {
  const [entries, setEntries] = useState<BoardEntry[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [draft, setDraft] = useState<{ spotId: string; dataUrl: string } | null>(null);
  const [view, setView] = useState<{ name: ViewName; n: number } | null>(null);
  const [tab, setTab] = useState<'bid' | 'board'>('bid');

  const load = useCallback(async () => {
    try { const r = await fetch('/api/board', { cache: 'no-store' }); if (r.ok) setEntries((await r.json()).board); } catch { /* keep old data */ }
  }, []);
  useEffect(() => { load(); const t = setInterval(load, 20000); return () => clearInterval(t); }, [load]);

  const board = useMemo(() => Object.fromEntries(entries.map((e) => [e.spotId, e])), [entries]);
  const logos = useMemo(() => Object.fromEntries(entries.map((e) => [e.spotId, e.leader?.logoUrl ?? null])), [entries]);
  const mins = useMemo(() => Object.fromEntries(entries.map((e) => [e.spotId, e.min])), [entries]);
  const max = Math.max(1, ...entries.map((e) => e.leader?.amount ?? 0));

  const select = (id: string, turn: boolean) => {
    setSelected(id); setTab('bid');
    const s = SPOTS.find((x) => x.id === id);
    if (turn && s) setView({ name: s.view, n: Date.now() });
  };

  return (
    <div id="app">
      <div id="stage">
        <Motorhome3D logos={logos} mins={mins} selected={selected} draft={draft} view={view} onSelect={(id) => select(id, false)} />
        <div id="hint">Drag to rotate · scroll/pinch to zoom · tap an ad spot</div>
        <div id="views">{VIEW_BUTTONS.map((n) => <button key={n} onClick={() => setView({ name: n, n: Date.now() })}>{n[0].toUpperCase() + n.slice(1)}</button>)}</div>
      </div>
      <aside id="panel">
        <div className="tabs">
          <button className={'tab' + (tab === 'bid' ? ' on' : '')} onClick={() => setTab('bid')}>Place a bid</button>
          <button className={'tab' + (tab === 'board' ? ' on' : '')} onClick={() => setTab('board')}>Bid board</button>
        </div>
        {tab === 'bid' ? (
          <BidWizard board={board} selected={selected} onSelect={(id) => select(id, true)} onDraft={(spotId, dataUrl) => setDraft(dataUrl ? { spotId, dataUrl } : null)} />
        ) : (
          <div>
            <p>Highest paid bid per spot – that logo is shown on the motorhome.</p>
            {SPOTS.map((s) => {
              const e = board[s.id];
              return (
                <div className="brow" key={s.id}>
                  <strong>{s.name}</strong>
                  <div className="bar"><i style={{ width: `${e?.leader ? (e.leader.amount / max) * 100 : 0}%` }} /></div>
                  <span className="tag">
                    {e?.leader ? `${e.leader.name} · ${money(e.leader.amount)}` : `No paid bid yet · from ${money(s.price)}`}
                    {e && e.pending > 0 ? ` · ${e.pending} pending offer${e.pending > 1 ? 's' : ''}` : ''}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </aside>
    </div>
  );
}

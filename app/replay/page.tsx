'use client';
import { useEffect, useMemo, useState } from 'react';
import { CONFIG } from '@/lib/config';
import { money } from '@/lib/format';
import { buildEvents, stateAt } from '@/lib/replay';
import type { BoardResponse } from '@/lib/types';
import ReplayScene from '@/components/Replay';
import Header from '@/components/Header';

const SPEEDS = [10, 20, 45, 90] as const;

export default function Replay() {
  const [d, setD] = useState<BoardResponse | null>(null);
  const [i, setI] = useState(0);
  const [play, setPlay] = useState(false);
  const [speed, setSpeed] = useState<(typeof SPEEDS)[number]>(45);
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      if (y < last - 4) setCompact(true);   // rolando para cima: esconde
      else if (y > last + 4) setCompact(false);
      last = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  

  useEffect(() => {
    fetch('/api/board', { cache: 'no-store' }).then((r) => r.json())
      .then((x: BoardResponse) => { setD(x); setI(0); }).catch(() => {});
  }, []);

  const events = useMemo(() => buildEvents(d?.history ?? []), [d]);
  const last = Math.max(0, events.length - 1);

  // The state at step i: who holds every spot, and the logos to show.
  const state = useMemo(() => stateAt(events, i), [events, i]);
  const logos = useMemo(
    () => Object.fromEntries(Object.entries(state).map(([k, e]) => [k, e.logoUrl])),
    [state],
  );
  const amounts = useMemo(
    () => Object.fromEntries(Object.entries(state).map(([k, e]) => [k, e.amount])),
    [state],
  );
  const raised = Object.values(amounts).reduce<number>((n, v) => n + (v ?? 0), 0);
  const goal = CONFIG.goal;
  const pct = goal > 0 ? Math.round((raised / goal) * 100) : 0;
  const current = events[i] ?? null;

  // Advance on a timer. The step is the time between events, not the full auction length.
  useEffect(() => {
    if (!play) return;
    const ms = Math.max(400, (speed * 1000) / Math.max(1, events.length));
    const t = setInterval(() => {
      setI((n) => {
        if (n >= last) { setPlay(false); return n; }
        return n + 1;
      });
    }, ms);
    return () => clearInterval(t);
  }, [play, speed, events.length, last]);

  return (
    <>
    <Header onGetSpot={() => { window.location.href = '/#spots'; }} />
    <div className="bg-[#f5f5f7] pt-6">
    <main className="wrap" style={{ maxWidth: 1100 }}>
    
      <p className="muted small text-center  mb-3 uppercase tracking-wide">
      {current ? new Date(current.at).toLocaleString('en-US', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'UTC', timeZoneName: 'short' }) : '—'}
      </p>
      <h2 className='mt-6 text-center'>The auction, replayed.</h2>
      
      
      {goal > 0 && (
        <div className="raised-r" style={{ marginTop: 16 }}>
          <div className="raised-top">
            <div className="target-wrap">
              <span className="raised-top-b">{money(raised)} </span>
              <span className="target">raised</span>
            </div>
            <div className="collected">
              <span>{pct >= 100 ? 'goal passed' : `goal ${money(goal)}`} · <span className="g">{pct}%</span></span>
            </div>
          </div>
          <div className="track-bar mb-3">
            <i style={{ width: `${Math.min(100, pct)}%` }} />
          </div>
        </div>
      )}

      {current && (
        <p className='text-center mb-10' >
          <span className="text-[var(--mu)] small">Bid {i + 1} • </span>
        
          <b className="muted small">{current.name} </b>
          <span className="muted small"> • {money(current.amount)}</span>
        </p>
      )}

      {events.length === 0 ? (
        <p className="muted">No bids to replay yet.</p>
      ) : (<>
    
          <div className="stage mb-10 shadow-box" style={{ height: 'clamp(360px, 60vh, 560px)' }}>
            <ReplayScene logos={logos} amounts={amounts} current={current} step={i} />
          </div>
        
      </>)}
    </main>
    {/* play container*/}
          <div className={`sticky bottom-0 z-20 w-full -mx-6 flex flex-col gap-3 border-top-1 border-[var(--mu)]/60 bg-[#f5f5f7]/95 px-10 py-3 backdrop-blur-[8px] justify-self-center transition-transform duration-300 ${compact ? 'translate-y-full' : ''}`}>
            <div className="row " style={{ marginTop: 12, gap: 12 }}>
              <input type="range" min={0} max={last} value={i}
                onChange={(e) => { setPlay(false); setI(+e.target.value); }}
                className="replay-range"
                style={{
                  flex: 1,
                  ['--p' as string]: `${last ? (i / last) * 100 : 0}%`,
                }} />
            </div>

            {/* play buttons */}
            <div className="grid auto-cols-max grid-flow-col gap-4 self-center">
              <button className="rounded-full bg-[#ff8b1a] hover:bg-orange-300 text-white w-20 h-7 mt-4 mb-4 text-[11px]" onClick={() => { if (i >= last) setI(0); setPlay(!play); }}>
                  {play ? 'Pause' : 'Play'}
              </button>

              <div className="seg-r h-8 " role="tablist" aria-label="Speed">
                {SPEEDS.map((s) => (
                  <button key={s} className={speed === s ? 'on' : ''} onClick={() => setSpeed(s)}>{s}s</button>
                ))}
              </div>    
            </div>
          </div>
   </div>
    </>
  );
}
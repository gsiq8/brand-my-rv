'use client';
import dynamic from 'next/dynamic';
import { CONFIG } from '@/lib/config';
import { COPY } from '@/lib/site';
import { money } from '@/lib/format';
import type { BoardResponse } from '@/lib/types';
import { useEffect, useRef, useState } from 'react';
import type { Props as RvProps, ViewName } from './Motorhome3D';
import Counters from './Counters';

const Motorhome3D = dynamic(() => import('./Motorhome3D'), { ssr: false, loading: () => <div className="load">Loading 3D model…</div> });
const VIEWS: [ViewName, string][] = [['3D', '3D'], ['left', 'Left'], ['right', 'Right'], ['back', 'Rear'], ['front', 'Front'], ['top', 'Top']];

type Props = RvProps & {
  data: BoardResponse | null;
  visitors: number | null;
  onView: (n: ViewName) => void;
  onMode: (m: 'auction' | 'final') => void;
  onGetSpot: () => void;
};

export default function Hero({ data, visitors, onView, onMode, onGetSpot, ...rv }: Props) {
  const raised = data?.stats.raised ?? 0, goal = CONFIG.goal;
  const pct = goal > 0 ? Math.round((raised / goal) * 100) : 0;
  const stageRef = useRef<HTMLDivElement>(null);
  const [mount, setMount] = useState(false);
  useEffect(() => {
    const el = stageRef.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      window.requestIdleCallback(() => setMount(true));
    }, { rootMargin: '300px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);

return (
    
    <section className="hero wrap sec" id="hero">
      <Counters data={data} visitors={visitors} />
      <h1 className="hero-title text-balance text-[58px]">{COPY.headline}</h1>
      <h3 className="hero-sub text-balance text-[15px]">{COPY.sub}</h3>

      {goal > 0 && (
      <div className="raised">
        <div className="raised-top">
          <div className="target-wrap">
          <span className="raised-top-b">{money(raised)} </span>
          <span className="target">  raised</span>
        </div>
        <div className="collected">
          <span>{pct >= 100 ? 'goal passed' : `goal ${money(goal)}`} · 
            <span className="g"> {pct}%</span>
          </span>
        </div>
      </div>
        <div className="track-bar mb-4">
          <i style={{ width: `${Math.min(100, pct)}%` }} /></div>
      </div>  
      )}
      <div className="seg" role="tablist" aria-label="View">
        {VIEWS.map(([n, label]) => <button key={n} className={rv.view?.name === n ? 'on' : ''} onClick={() => onView(n)}>{label}</button>)}
      </div>
      <div className="stage" ref={stageRef}>
        {mount ? <Motorhome3D {...rv} /> : <div className="load">Loading 3D model…</div>}
      </div>
      <div className="seg" role="tablist" aria-label="Mode">
        <button className={rv.mode === 'auction' ? 'on' : ''} onClick={() => onMode('auction')}>The auction</button>
        <button className={rv.mode === 'final' ? 'on' : ''} onClick={() => onMode('final')}>Final look</button>
      </div>
      <p className="stage-cap">{COPY.tapHint}</p>

      <div className="pitch">
        <p className="pitch-lead">{COPY.pitchLead}</p>
        <p>{COPY.pitchSub}</p>
        <div className="ctas">
          <button className="btn pri" onClick={onGetSpot}>Get a spot</button>
          <a className="btn" href="#how">How it works ›</a>
        </div>
      </div>
    </section>
    
  );
}

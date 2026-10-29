'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { SPOTS, isRv } from '@/lib/spots';
import type { BoardEntry, BoardResponse } from '@/lib/types';
import type { ViewName } from './Motorhome3D';
import Header from './Header';
import TopStrip from './TopStrip';
import Hero from './Hero';
import Auction from './Auction';
import History from './History';
import Corner from './Corner';
import BidDrawer from './BidDrawer';
import { Footer, HowItWorks, Specs } from './StaticSections';
import Host from './Host';
import Faq from './Faq'
import IntroSection from './IntroSection';
import { cornerHolders } from '@/lib/corner';
import dynamic from 'next/dynamic';

const Background = dynamic(() => import('./Background'), { ssr: false });

export default function Site() {
  const [data, setData] = useState<BoardResponse | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<{ spotId: string; dataUrl: string } | null>(null);
  const [view, setView] = useState<{ name: ViewName; n: number } | null>(null);
  const [visitors, setVisitors] = useState<number | null>(null);
  const [mode, setMode] = useState<'auction' | 'final'>('auction');

  const load = useCallback(async () => {
    try { const r = await fetch('/api/board', { cache: 'no-store' }); if (r.ok) setData(await r.json()); } catch { /* keep old data */ }
  }, []);

    useEffect(() => {
      queueMicrotask(() => load());
      const t = setInterval(load, 20000);
      return () => clearInterval(t);
    }, [load]);

    useEffect(() => {                       // count this visit once per browser session
      let counted = false;
      try { counted = !!sessionStorage.getItem('visited'); } catch { /* storage blocked */ }
      fetch('/api/visit', { method: counted ? 'GET' : 'POST' }).then((r) => r.json()).then((d) => {
        if (typeof d.visitors === 'number') setVisitors(d.visitors);
        try { sessionStorage.setItem('visited', '1'); } catch { /* ignore */ }
      }).catch(() => {});
    }, []);

  const board = useMemo<Record<string, BoardEntry>>(() => Object.fromEntries((data?.board ?? []).map((e) => [e.spotId, e])), [data]);
  const logos = useMemo(() => Object.fromEntries(Object.values(board).map((e) => [e.spotId, e.leader?.logoFullUrl ?? null])), [board]);
  const amounts = useMemo(() => Object.fromEntries(Object.values(board).map((e) => [e.spotId, e.leader?.amount ?? null])), [board]);
  const mins = useMemo(() => Object.fromEntries(Object.values(board).map((e) => [e.spotId, e.min])), [board]);
  const hasCorner = cornerHolders(data?.history ?? []).some((h) => h.current);
  
  const goView = (name: ViewName) => setView({ name, n: Date.now() });
  const choose = (id: string, scroll: boolean) => {
    setSelected(id); setOpen(true);
    const s = SPOTS.find((x) => x.id === id);
    if (s && isRv(s)) { goView(s.view); if (scroll) document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' }); }
  };
  const close = () => { setOpen(false); setDraft(null); };

  return (
    <div className="top" id="top">
      <Header onGetSpot={() => setOpen(true)} />
        {hasCorner && <div className="strip-spacer" aria-hidden="true" />} 
      
      <main>
        <Hero data={data} visitors={visitors} logos={logos} mins={mins} amounts={amounts} mode={mode} selected={selected} draft={draft} view={view}
          onView={goView} onMode={setMode} onSelect={(id) => choose(id, false)} onGetSpot={() => setOpen(true)} />
        
        <div className="dark-grey">
          <IntroSection />
        </div>

      <div className="grey">
        <Auction data={data} onBid={(id) => choose(id, true)} />
        <History items={data?.history ?? []} board={board} />       
      </div>

      <div className="white">
        <HowItWorks />        
      </div>

      <div className="grey">
        <Specs />
      </div>

      <div className="journey">
        <Background />
        <Faq />
        <Corner entry={board['corner']} items={data?.history ?? []} onBid={() => choose('corner', false)} />
        <Host />
      </div>
      
      </main>
      <TopStrip items={data?.history ?? []} entry={board['corner']} onClaim={() => choose('corner', false)} />

      <Footer />
      {open && <BidDrawer board={board} selected={selected} onSelect={(id) => choose(id, false)} onDraft={(spotId, dataUrl) => setDraft(dataUrl ? { spotId, dataUrl } : null)} onClose={close} />}
    </div>
  );
}

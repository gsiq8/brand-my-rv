'use client';
import { useState } from 'react';
import { COPY } from '@/lib/site';

export default function Header({ onGetSpot }: { onGetSpot?: () => void }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <header className="hdr sticky top-0 z-20 bg-white border-b-1 border-b-neutral-200">
      <div className="hdr-in ">
        <button
          type="button"
          className="menu-btn"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span /><span /><span />
        </button>
        
        <a className="brand" href="/#top">🚐 {COPY.name}</a>
        
        <nav className={`nav ${open ? 'nav-open' : ''}`}>
          <a href="/#spots"onClick={close}>The auction</a>
          <a href="/leaderboard"onClick={close}>Leaderboard</a>
           <a href="/replay"onClick={close}>Replay</a> 
          <a href="/#corner"onClick={close}>The strip</a>
        </nav>
        {onGetSpot && <button className="btn dark" onClick={onGetSpot}>Get a spot</button>}
        
      </div>
    </header>
  );
}

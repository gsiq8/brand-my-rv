'use client';
import { useState } from 'react';
import Link from 'next/link';
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
        
        <Link className="brand" href="/#top">🚐 {COPY.name}</Link>
        
        <nav className={`nav ${open ? 'nav-open' : ''}`}>
          <Link href="/#spots" onClick={close}>The auction</Link>
          <Link href="/leaderboard" onClick={close}>Leaderboard</Link>
           <Link href="/replay" onClick={close}>Replay</Link>
          <Link href="/#corner" onClick={close}>The strip</Link>
        </nav>
        {onGetSpot && <button className="btn dark" onClick={onGetSpot}>Get a spot</button>}
        
      </div>
    </header>
  );
}
'use client';
import { COPY } from '@/lib/site';

export default function Header({ onGetSpot }: { onGetSpot: () => void }) {
  return (
    <header className="hdr sticky top-0 z-20 bg-white border-b-1 border-b-neutral-200">
      <div className="hdr-in ">
        <a className="brand" href="#top">🚐 {COPY.name}</a>
        <nav className="nav">
          <a href="#spots">The auction</a>
          <a href="/leaderboard">Leaderboard</a>
          {/* <a href="/replay">Replay</a> */}
          <a href="#corner">The strip</a>
        </nav>
        <button className="btn dark" onClick={onGetSpot}>Get a spot</button>
      </div>
    </header>
  );
}

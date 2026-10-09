'use client';
import { COPY } from '@/lib/site';

export default function Header({ onGetSpot }: { onGetSpot: () => void }) {
  return (
    <header className="hdr">
      <div className="hdr-in">
        <a className="brand" href="#top">🚐 {COPY.name}</a>
        <nav className="nav">
          <a href="#spots">The auction</a>
          <a href="/leaderboard">Leaderboard</a>
          <a href="/replay">Replay</a>
          <a href="#corner">The corner</a>
        </nav>
        <button className="btn dark" onClick={onGetSpot}>Get a spot</button>
      </div>
    </header>
  );
}

'use client';
import { useEffect, useState } from 'react';

const pad = (n: number) => String(n).padStart(2, '0');

export default function Countdown({ until }: { until: string }) {
  const [now, setNow] = useState<number | null>(null);   // null until mounted, avoids a server/client mismatch
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  if (now === null) return <span className="muted small">—</span>;
  const ms = Math.max(0, new Date(until).getTime() - now);
  if (ms === 0) return <span className="muted small">Closing…</span>;
  const d = Math.floor(ms / 864e5), h = Math.floor(ms / 36e5) % 24, m = Math.floor(ms / 6e4) % 60, s = Math.floor(ms / 1e3) % 60;
  return <span className="tabular-nums">{d}d {pad(h)}:{pad(m)}:{pad(s)}</span>;
}
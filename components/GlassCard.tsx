'use client';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import LiquidGlass from '@/components/glass';

export default function GlassCard({ children, className = '', radius = 24, initial = 200 }: { children: ReactNode; className?: string; radius?: number; initial?: number }) {
  const inner = useRef<HTMLDivElement>(null);
  const [h, setH] = useState(initial);
  useEffect(() => {
    const el = inner.current;
    if (!el) return;
    const sync = () => { setH(el.offsetHeight); window.dispatchEvent(new Event('resize')); };   // the lib re-measures its edge
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <div className={`glass-slot ${className}`} style={{ height: h }}>
      <LiquidGlass padding="0" cornerRadius={radius} blurAmount={0.02} aberrationIntensity={1} elasticity={0}
        displacementScale={10} style={{ position: 'absolute', top: '50%', left: '50%' }}>
        <div ref={inner} className="glass-fill">{children}</div>
      </LiquidGlass>
    </div>
  );
}
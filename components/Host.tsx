'use client'
import { useEffect, useRef, useState } from 'react';
import LiquidGlass from '@/components/glass';
import { COPY } from '@/lib/site';

export default function Host() {
  const h = COPY.host;
  const inner = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(160);


  // a altura do slot acompanha a do conteúdo (o vidro é absolute e não gera altura)
  useEffect(() => {
    const el = inner.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setHeight(el.offsetHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <section className="wrap faq-sec">
      <div className="glass-slot" style={{ height }}>
        <LiquidGlass
         padding="0"
         cornerRadius={14}
         blurAmount={0.02}
         aberrationIntensity={1}
         elasticity={0}
         displacementScale={10}
         style={{ position: 'absolute', top: '50%', left: '50%' }}
        >
          <div ref={inner} className="host host-glass">
            <span className="av big">{h.name.replace('[', '').slice(0, 1).toUpperCase()}</span>
            <div>
              <h3>Hey, I’m {h.name} 👋</h3>
              <div className="faq p">
                <div className='p'>
                    <p>{h.bio}</p>
                    <p>{h.links.map((l) => <a key={l.label} href={l.href} 
                    className="lnk">{l.label}</a>)}</p>
              </div>
              </div>
            </div>
          </div>
        </LiquidGlass>
      </div>
    </section>
  );
}
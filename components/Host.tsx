'use client'
import { useEffect, useRef, useState } from 'react';
import LiquidGlass from '@/components/glass';
import Image from 'next/image'
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
      <div className="glass-slot mb-8" style={{ height }}>
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
            <div className="av big relative overflow-hidden"> 
              <Image 
                src="/image.png"
                fill
                sizes="84px"
                quality={75}               
                loading="lazy"
                alt="profile"
                className="object-cover"
              />
            </div>
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
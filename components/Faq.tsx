'use client'
import { useLayoutEffect, useRef } from 'react';
import LiquidGlass from '@/components/glass';
import { Plus } from 'lucide-react';
import { FAQ } from '@/lib/site';

export default function Faq() {
  const slot = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = inner.current, box = slot.current;
    if (!el || !box) return;

    const sync = () => {
      const h = el.offsetHeight;
      if (box.style.height !== `${h}px`) {
        box.style.height = `${h}px`;               // mesmo frame da mudança de conteúdo
        window.dispatchEvent(new Event('resize')); // a lib relê o glassSize
      }
    };

    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <section className="wrap faq-sec" id="faq">
      <h2>Questions &amp; answers</h2>
      <div className="faq">
        <div className="glass-slot" ref={slot} style={{ height: 420 }}>
          <LiquidGlass
            padding="0"
            mode="prominent"
            cornerRadius={24}
            blurAmount={0.02}
            aberrationIntensity={2}
            saturation={100}
            elasticity={0}
            displacementScale={10}
            style={{ position: 'absolute', top: '50%', left: '50%' }}
          >
            <div ref={inner} className="faq-glass">
              {FAQ.map((f) => (
                <details key={f.q}>
                  <summary>
                    <span>{f.q}</span>
                    <Plus className="faq-icon" size={20} />
                  </summary>
                  <div className="p pr-8">
                    {Object.entries(f)
                      .filter(([key]) => key !== 'q' && f[key])
                      .reduce<{ type: 'bullet' | 'text'; items?: React.ReactNode[]; content?: React.ReactNode }[]>(
                        (acc, [key, value], index) => {
                          const last = acc[acc.length - 1];
                          if (key.startsWith('u')) {
                            const li = <li key={index}>{value}</li>;
                            if (last?.type === 'bullet') last.items!.push(li);
                            else acc.push({ type: 'bullet', items: [li] });
                          } else {
                            acc.push({ type: 'text', content: <p key={index}>{value}</p> });
                          }
                          return acc;
                        },
                        [],
                      )
                      .map((g, i) => (g.type === 'bullet' ? <ul key={i}>{g.items}</ul> : g.content))}
                  </div>
                </details>
              ))}
            </div>
          </LiquidGlass>
        </div>
      </div>
    </section>
  );
}
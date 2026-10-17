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
    let raf1 = 0, raf2 = 0;

    const sync = () => {
      box.style.height = `${el.offsetHeight}px`;   // síncrono: o vidro nunca fica "descentrado"
      window.dispatchEvent(new Event('resize'));   // a lib remede a borda agora
    };

    const settle = () => {
      // reforço depois que o layout/animação assentou
      cancelAnimationFrame(raf1); cancelAnimationFrame(raf2);
      raf1 = requestAnimationFrame(() => { raf2 = requestAnimationFrame(sync); });
    };

    sync();
    const ro = new ResizeObserver(() => { sync(); settle(); });
    ro.observe(el);
    el.addEventListener('transitionend', settle);
    el.addEventListener('toggle', settle, true); // 'toggle' não borbulha, por isso capture

    return () => {
      ro.disconnect();
      el.removeEventListener('transitionend', settle);
      el.removeEventListener('toggle', settle, true);
      cancelAnimationFrame(raf1); cancelAnimationFrame(raf2);
    };
  }, []);

  return (
    <section className="wrap faq-sec" id="faq">
      <h2>Questions &amp; answers</h2>
      <div className="faq">
        <div className="glass-slot" ref={slot} style={{ height: 420 }}>
          <LiquidGlass
            padding="0"
            mode='prominent'
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
                    .reduce<{ type: 'bullet' | 'text'; items?:  React.ReactNode[]; content?: React.ReactNode }[]>(
                      (acc, [key, value], index) => {
                        const isBullet = key.startsWith('u');
                        const lastItem = acc[acc.length - 1];
                        const isPreviousBullet = lastItem && lastItem.type === 'bullet';

                        if (isBullet) {
                          if (isPreviousBullet) {
                            lastItem.items?.push(<li key={index}>{value}</li>);
                          } else {
                            acc.push({
                              type: 'bullet',
                              items: [<li key={index}>{value}</li>]
                            });
                          }
                        } else {
                          acc.push({
                            type: 'text',
                            content: <p key={index}>{value}</p>
                          });
                        }
                        return acc;
                      }, 
                      []
                    )
                    .map((group, idx) => (
                      group.type === 'bullet' ? (
                        <ul key={idx} >
                          {group.items}
                        </ul>
                      ) : (
                        group.content
                      )
                    ))}

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
'use client'
import { useEffect, useRef } from 'react';
import LiquidGlass from 'liquid-glass-react';
import { Plus } from 'lucide-react';
import { FAQ } from '@/lib/site';

export default function Faq() {
  const slot = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  if (typeof window !== 'undefined') {
    // Safe to use navigator here
    console.log(navigator.language);
  }

  // The glass is absolute, so it adds no height. Copy the content's height onto the slot.
  // Written straight to the DOM (no state), so opening an item doesn't re-render every frame.
  useEffect(() => {
    const el = inner.current, box = slot.current;
    if (!el || !box) return;
    let raf = 0;
    const ro = new ResizeObserver(() => {
        box.style.height = `${el.offsetHeight}px`;
        // the lib only re-measures the glass on window resize, so nudge it
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => window.dispatchEvent(new Event('resize')));
    });
    ro.observe(el);
    return () => { ro.disconnect(); cancelAnimationFrame(raf); };
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
                  <div className="p">
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
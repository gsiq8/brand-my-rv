import { test, expect } from '@playwright/test';

type Sample = {
  spans: number;
  topDrift: number;
  borderTop: number;
  borderBot: number;
  rest: { bb: number };
};

const SAMPLE = `
(async (idx) => {
  const slot = document.querySelector('.faq .glass-slot');
  const content = document.querySelector('.faq-glass');
  const head = document.querySelector('#faq h2');
  const spans = [...slot.children].filter((c) => c.tagName === 'SPAN');
  const summary = document.querySelectorAll('.faq-glass summary')[idx];
  const frame = () => new Promise((r) => requestAnimationFrame(r));
  const snap = () => {
    const c = content.getBoundingClientRect(), h = head.getBoundingClientRect();
    return {
      top: c.top - h.top,
      bt: Math.max(...spans.map((s) => Math.abs(s.getBoundingClientRect().top - c.top))),
      bb: Math.max(...spans.map((s) => Math.abs(s.getBoundingClientRect().bottom - c.bottom))),
    };
  };
  const base = snap();
  const out = { topDrift: 0, borderTop: 0, borderBot: 0, rest: null, frames: 0, spans: spans.length };
  summary.click();
  const t0 = performance.now();
  while (performance.now() - t0 < 700) {
    await frame();
    const s = snap();
    out.topDrift = Math.max(out.topDrift, Math.abs(s.top - base.top));
    out.borderTop = Math.max(out.borderTop, s.bt);
    out.borderBot = Math.max(out.borderBot, s.bb);
    out.frames++;
  }
  out.rest = snap();
  return out;
})
`;

test('glass top stays fixed and border tracks content on every frame', async ({ page }) => {
  await page.goto('/#faq');
  await page.waitForSelector('.faq-glass summary');
  await page.waitForTimeout(500);
  const n = await page.locator('.faq-glass summary').count();

  for (let i = 0; i < n; i++) {
    for (const phase of ['open', 'close']) {
      const r = await page.evaluate<Sample>(`${SAMPLE}(${i})`);
      console.log(`item ${i} ${phase}`, JSON.stringify(r));
      expect(r.spans, 'border layers found (selector sanity)').toBeGreaterThan(0);
      expect(r.topDrift, `item ${i} ${phase}: glass top moved`).toBeLessThanOrEqual(0.5);
      expect(r.borderTop, `item ${i} ${phase}: border top lags content`).toBeLessThanOrEqual(1);
      expect(r.borderBot, `item ${i} ${phase}: border bottom lags content`).toBeLessThanOrEqual(1);
      expect(r.rest.bb, 'at rest, border bottom == content bottom').toBeLessThanOrEqual(1);
    }
  }
});
# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests/faq-glass.spec.ts >> glass top stays fixed and border tracks content on every frame
- Location: tests/faq-glass.spec.ts:36:5

# Error details

```
Error: page.goto: Protocol error (Page.navigate): Cannot navigate to invalid URL
Call log:
  - navigating to "/#faq", waiting until "load"

```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | const SAMPLE = `
  4  | (async (idx) => {
  5  |   const slot = document.querySelector('.faq .glass-slot');
  6  |   const content = document.querySelector('.faq-glass');
  7  |   const head = document.querySelector('#faq h2');
  8  |   const spans = [...slot.children].filter((c) => c.tagName === 'SPAN');
  9  |   const summary = document.querySelectorAll('.faq-glass summary')[idx];
  10 |   const frame = () => new Promise((r) => requestAnimationFrame(r));
  11 |   const snap = () => {
  12 |     const c = content.getBoundingClientRect(), h = head.getBoundingClientRect();
  13 |     return {
  14 |       top: c.top - h.top,
  15 |       bt: Math.max(...spans.map((s) => Math.abs(s.getBoundingClientRect().top - c.top))),
  16 |       bb: Math.max(...spans.map((s) => Math.abs(s.getBoundingClientRect().bottom - c.bottom))),
  17 |     };
  18 |   };
  19 |   const base = snap();
  20 |   const out = { topDrift: 0, borderTop: 0, borderBot: 0, rest: null, frames: 0, spans: spans.length };
  21 |   summary.click();
  22 |   const t0 = performance.now();
  23 |   while (performance.now() - t0 < 700) {
  24 |     await frame();
  25 |     const s = snap();
  26 |     out.topDrift = Math.max(out.topDrift, Math.abs(s.top - base.top));
  27 |     out.borderTop = Math.max(out.borderTop, s.bt);
  28 |     out.borderBot = Math.max(out.borderBot, s.bb);
  29 |     out.frames++;
  30 |   }
  31 |   out.rest = snap();
  32 |   return out;
  33 | })
  34 | `;
  35 | 
  36 | test('glass top stays fixed and border tracks content on every frame', async ({ page }) => {
> 37 |   await page.goto('/#faq');
     |              ^ Error: page.goto: Protocol error (Page.navigate): Cannot navigate to invalid URL
  38 |   await page.waitForSelector('.faq-glass summary');
  39 |   await page.waitForTimeout(500);
  40 |   const n = await page.locator('.faq-glass summary').count();
  41 | 
  42 |   for (let i = 0; i < n; i++) {
  43 |     for (const phase of ['open', 'close']) {
  44 |       const r: any = await page.evaluate(`${SAMPLE}(${i})`);
  45 |       console.log(`item ${i} ${phase}`, JSON.stringify(r));
  46 |       expect(r.spans, 'border layers found (selector sanity)').toBeGreaterThan(0);
  47 |       expect(r.topDrift, `item ${i} ${phase}: glass top moved`).toBeLessThanOrEqual(0.5);
  48 |       expect(r.borderTop, `item ${i} ${phase}: border top lags content`).toBeLessThanOrEqual(1);
  49 |       expect(r.borderBot, `item ${i} ${phase}: border bottom lags content`).toBeLessThanOrEqual(1);
  50 |       expect(r.rest.bb, 'at rest, border bottom == content bottom').toBeLessThanOrEqual(1);
  51 |     }
  52 |   }
  53 | });
```
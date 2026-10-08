/** Painted Patagonia sky. The sun position follows the visitor's clock. Client-side only (uses <canvas>). */
export type RGB = number[];
type V3 = [number, number, number];
type Key = { el: number; top: RGB; mid: RGB; hor: RGB; tint: RGB; snow: RGB; mat: RGB; sun: RGB; sunI: number; hemi: RGB; hemiG: RGB; hemiI: number; exp: number };
export type Sky = {
  canvas: HTMLCanvasElement; lightDir: V3; sun: RGB; sunI: number; hemi: RGB; hemiG: RGB; hemiI: number;
  exp: number; hor: RGB; mat: RGB; df: number;
};

const PW = 3072, PH = 1536, HZ = PH / 2, TAU = Math.PI * 2;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
function rng(a: number) {
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

const KEYS: Key[] = [
  { el: -18, top: [3, 7, 23], mid: [13, 28, 61], hor: [43, 74, 115], tint: [.16, .22, .4], snow: [190, 208, 238], mat: [.3, .37, .5], sun: [155, 184, 255], sunI: .5, hemi: [90, 120, 176], hemiG: [26, 34, 51], hemiI: .3, exp: 1.25 },
  { el: -6, top: [18, 34, 88], mid: [66, 70, 128], hor: [214, 140, 120], tint: [.42, .42, .62], snow: [220, 170, 190], mat: [.5, .5, .65], sun: [200, 170, 200], sunI: .3, hemi: [130, 130, 180], hemiG: [50, 45, 60], hemiI: .3, exp: 1.15 },
  { el: 0, top: [40, 80, 150], mid: [150, 130, 160], hor: [255, 170, 110], tint: [1, .72, .62], snow: [255, 190, 160], mat: [1, .82, .72], sun: [255, 190, 130], sunI: .8, hemi: [200, 190, 200], hemiG: [150, 120, 90], hemiI: .33, exp: 1.05 },
  { el: 8, top: [45, 100, 175], mid: [120, 160, 210], hor: [248, 215, 175], tint: [1, .9, .8], snow: [255, 235, 215], mat: [1, .93, .85], sun: [255, 225, 185], sunI: .9, hemi: [215, 225, 240], hemiG: [154, 143, 100], hemiI: .35, exp: 1.05 },
  { el: 25, top: [42, 100, 174], mid: [110, 165, 220], hor: [207, 220, 232], tint: [1, 1, 1], snow: [245, 248, 252], mat: [1, 1, 1], sun: [255, 243, 220], sunI: .95, hemi: [223, 234, 247], hemiG: [154, 143, 100], hemiI: .35, exp: 1.05 },
];
function look(el: number): Key {
  if (el <= KEYS[0].el) return KEYS[0];
  if (el >= KEYS[4].el) return KEYS[4];
  let i = 0;
  while (el > KEYS[i + 1].el) i++;
  const a = KEYS[i], b = KEYS[i + 1], f = (el - a.el) / (b.el - a.el);
  const o: Record<string, number | number[]> = {};
  (Object.keys(a) as (keyof Key)[]).forEach((k) => {
    const x = a[k], y = b[k];
    o[k] = Array.isArray(x) ? x.map((v, j) => v + ((y as number[])[j] - v) * f) : (x as number) + ((y as number) - (x as number)) * f;
  });
  return o as unknown as Key;
}
const rgb = (a: RGB) => `rgb(${a.map((v) => v | 0).join(',')})`;
const rgba = (a: RGB, al: number) => `rgba(${a.map((v) => v | 0).join(',')},${al})`;

function sunPos(h: number, doy: number, latDeg: number) {
  const d = (-23.44 * Math.cos((2 * Math.PI * (doy + 10)) / 365) * Math.PI) / 180, lat = (latDeg * Math.PI) / 180, H = ((h - 12) * 15 * Math.PI) / 180;
  const el = Math.asin(Math.sin(lat) * Math.sin(d) + Math.cos(lat) * Math.cos(d) * Math.cos(H));
  const az = Math.atan2(-Math.cos(d) * Math.sin(H), Math.sin(d) * Math.cos(lat) - Math.cos(d) * Math.sin(lat) * Math.cos(H));
  return { el, az };
}
// Scene "north" and "east" (the motorhome faces +Z; the default camera sits at the front-left).
const NV = [0.7071, 0.7071], EV = [-0.7071, 0.7071]; // [x, z]
const dirOf = (az: number, el: number): V3 => [
  EV[0] * Math.sin(az) * Math.cos(el) + NV[0] * Math.cos(az) * Math.cos(el), Math.sin(el),
  EV[1] * Math.sin(az) * Math.cos(el) + NV[1] * Math.cos(az) * Math.cos(el),
];

type Layer = { l: { h: number; col: RGB; snow: number; pk: number[][] }; h: Float32Array; sd: Float32Array };
let MT: Layer[] | null = null;
function mountains(): Layer[] {
  if (MT) return MT;
  const r = rng(21), ph = Array.from({ length: 8 }, () => [0, 0, 0, 0, 0, 0].map(() => r() * TAU));
  const K = [2, 4, 7, 13, 26, 52], A = [1, .7, .5, .32, .2, .12];
  const rid = (x: number, L: number) => { let s = 0, n = 0; K.forEach((k, i) => { s += A[i] * (1 - Math.abs(Math.sin((TAU * k * x) / PW + ph[L][i]))); n += A[i]; }); return s / n; };
  const Ls = [
    { h: 70, col: [150, 170, 192], snow: .8, pk: [[.62, 200, 60]] },
    { h: 95, col: [120, 142, 168], snow: .62, pk: [[.13, 70, 150], [.17, 45, 125], [.095, 50, 118], [.74, 150, 95]] },
    { h: 70, col: [88, 110, 132], snow: .7, pk: [[.13, 140, 95], [.45, 160, 80], [.88, 130, 85]] },
    { h: 38, col: [78, 92, 70], snow: 2, pk: [] as number[][] },
  ];
  return (MT = Ls.map((l, i) => {
    const h = new Float32Array(PW), sd = new Float32Array(PW);
    for (let x = 0; x < PW; x++) {
      let v = l.h * (.3 + .7 * rid(x, i));
      l.pk.forEach((p) => { const dx = ((((x - p[0] * PW + PW / 2) % PW) + PW) % PW) - PW / 2, q = p[2] * Math.pow(Math.max(0, 1 - Math.abs(dx) / p[1]), 1.5) * (.85 + .15 * rid(x * 2, i + 4)); if (q > v) v = q; });
      h[x] = v; sd[x] = Math.max(0, v - l.h * l.snow) * (.5 + .6 * rid(x * 3, (i + 5) % 8));
    }
    return { l, h, sd };
  }));
}

function panorama(L: Key, sunD: V3, moonD: V3, elDeg: number, starA: number) {
  const c = document.createElement('canvas'); c.width = PW; c.height = PH;
  const g = c.getContext('2d')!, r = rng(11);
  const pos = (d: V3): [number, number] => [(Math.atan2(d[2], d[0]) / TAU + .5) * PW, HZ - (Math.asin(clamp(d[1], -1, 1)) / (Math.PI / 2)) * HZ];
  let gr = g.createLinearGradient(0, 0, 0, HZ); gr.addColorStop(0, rgb(L.top)); gr.addColorStop(.55, rgb(L.mid)); gr.addColorStop(1, rgb(L.hor)); g.fillStyle = gr; g.fillRect(0, 0, PW, HZ);
  gr = g.createLinearGradient(0, HZ, 0, PH); gr.addColorStop(0, rgb(L.hor));
  gr.addColorStop(.25, rgb([185, 173, 130].map((v, i) => v * L.tint[i]))); gr.addColorStop(1, rgb([111, 101, 66].map((v, i) => v * L.tint[i])));
  g.fillStyle = gr; g.fillRect(0, HZ, PW, HZ);
  const glow = (d: V3, R: number, col: RGB, a: number) => {
    const [x, y] = pos(d);
    for (const dx of [-PW, 0, PW]) { const q = g.createRadialGradient(x + dx, y, 0, x + dx, y, R); q.addColorStop(0, rgba(col, a)); q.addColorStop(.14, rgba(col, a * .4)); q.addColorStop(1, rgba(col, 0)); g.fillStyle = q; g.fillRect(x + dx - R, y - R, 2 * R, 2 * R); }
  };
  const disc = (d: V3, R: number, col: RGB, a: number) => { const [x, y] = pos(d); g.fillStyle = rgba(col, a); for (const dx of [-PW, 0, PW]) { g.beginPath(); g.arc(x + dx, y, R, 0, TAU); g.fill(); } };
  if (elDeg > -8) { const a = clamp((elDeg + 8) / 8, 0, 1); glow(sunD, 260 + clamp(10 - elDeg, 0, 18) * 16, L.sun, .95 * a); if (elDeg > -1) disc(sunD, 17, [255, 252, 240], a); }
  const ca = .25 + .75 * clamp((elDeg + 6) / 14, 0, 1);
  for (let i = 0; i < 46; i++) {
    const x = r() * PW, y = HZ * (.12 + r() * .6), rx = 120 + r() * 380, ry = 14 + r() * 40, a = (.1 + r() * .28) * ca;
    for (const dx of [-PW, 0, PW]) { g.save(); g.translate(x + dx, y); g.scale(rx, ry); const q = g.createRadialGradient(0, 0, 0, 0, 0, 1); q.addColorStop(0, rgba(L.snow, a)); q.addColorStop(1, rgba(L.snow, 0)); g.fillStyle = q; g.beginPath(); g.arc(0, 0, 1, 0, TAU); g.fill(); g.restore(); }
  }
  if (starA > .02) {
    const sr = rng(3);
    g.save(); g.translate(PW * .3, HZ * .5); g.rotate(-.5);
    const mg = g.createLinearGradient(0, -130, 0, 130); mg.addColorStop(0, 'rgba(170,190,240,0)'); mg.addColorStop(.5, `rgba(190,205,245,${.22 * starA})`); mg.addColorStop(1, 'rgba(170,190,240,0)');
    g.fillStyle = mg; g.fillRect(-PW * .6, -130, PW * 1.2, 260); g.restore();
    for (let i = 0; i < 2600; i++) { const x = sr() * PW, y = Math.pow(sr(), .8) * HZ * .98, a = (.35 + sr() * .65) * starA, s = sr() < .04 ? 2.4 : sr() < .2 ? 1.5 : 1; g.fillStyle = `rgba(235,242,255,${a})`; g.fillRect(x, y, s, s); }
    glow(moonD, 200, [200, 220, 255], .5 * starA); disc(moonD, 20, [244, 246, 255], starA);
  }
  mountains().forEach(({ l, h, sd }, i) => {
    g.fillStyle = rgb(l.col.map((v, j) => v * L.tint[j])); for (let x = 0; x < PW; x++) g.fillRect(x, HZ - h[x], 1, h[x] + 3);
    g.fillStyle = rgba(L.snow, .9); for (let x = 0; x < PW; x++) if (sd[x] > 1) g.fillRect(x, HZ - h[x], 1, sd[x]);
    g.fillStyle = rgba(L.sun, .16); for (let x = 0; x < PW; x++) { const s = h[x] - h[(x + PW - 1) % PW]; if (s > 1.2) g.fillRect(x, HZ - h[x], 1, Math.min(h[x], 90)); }
    g.fillStyle = 'rgba(10,20,50,.22)'; for (let x = 0; x < PW; x++) { const s = h[x] - h[(x + PW - 1) % PW]; if (s < -1.2) g.fillRect(x, HZ - h[x], 1, Math.min(h[x], 90)); }
    if (i < 3) { const q = g.createLinearGradient(0, HZ - 230, 0, HZ); q.addColorStop(0, rgba(L.hor, 0)); q.addColorStop(1, rgba(L.hor, .34 - .08 * i)); g.fillStyle = q; g.fillRect(0, HZ - 230, PW, 230); }
  });
  return c;
}

/** Sky + lighting for a given moment. Uses the visitor's local clock as local solar time. */
export function skyFor(d: Date, latitude: number): Sky {
  const h = d.getHours() + d.getMinutes() / 60 + d.getSeconds() / 3600;
  const doy = Math.floor((d.getTime() - new Date(d.getFullYear(), 0, 0).getTime()) / 864e5);
  const sp = sunPos(h, doy, latitude), el = (sp.el * 180) / Math.PI, L = look(el);
  const sD = dirOf(sp.az, sp.el), mD = dirOf(sp.az + Math.PI, .61);
  const starA = clamp((-el - 4) / 10, 0, 1), df = clamp((el + 6) / 14, 0, 1);
  const ld: V3 = [...(el > -4 ? sD : mD)] as V3;               // below the horizon the moon lights the scene
  if (ld[1] < .08) { ld[1] = .08; const n = Math.hypot(...ld); ld[0] /= n; ld[1] /= n; ld[2] /= n; }
  return { canvas: panorama(L, sD, mD, el, starA), lightDir: ld, sun: L.sun, sunI: L.sunI, hemi: L.hemi, hemiG: L.hemiG, hemiI: L.hemiI, exp: L.exp, hor: L.hor, mat: L.mat, df };
}

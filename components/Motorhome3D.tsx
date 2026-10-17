'use client';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { sizeInfo, RV_SPOTS as SPOTS, type RvSpot as SpotDef } from '@/lib/spots';
import { CONFIG } from '@/lib/config';
import { skyFor } from '@/lib/sky';

export type ViewName = 'front' | 'back' | 'left' | 'right' | 'top' | '3D';
export type Props = {
  logos: Record<string, string | null>;          // public logo URL of the leading paid bid, per spot
  mins: Record<string, number>;                  // minimum bid per spot (for the placeholder text)
  selected: string | null;
  draft: { spotId: string; dataUrl: string } | null; // unsent logo preview
  view: { name: ViewName; n: number } | null;    // change `n` to re-trigger a camera move
  mode: 'auction' | 'final';                    // 'final' hides amounts, outlines and empty spots
  amounts: Record<string, number | null>;       // current top bid per spot
  onSelect: (id: string) => void;
};
type Api = { update: (p: Props) => void };

const H = Math.PI / 2, GY = -0.4053, LEG = Math.PI; // LEG: keeps the light levels of older three.js versions
const VIEWS: Record<ViewName, [number, number, number]> = {      // [azimuth, polar, distance]; the vehicle's front is +Z
  front: [H, 1.45, 3.2], back: [-H, 1.45, 3.2], left: [0, 1.45, 3.3], right: [Math.PI, 1.45, 3.3], top: [-H, 0.04, 3.6], '3D': [0.8, 1.25, 3.4],
};
const TARGET = new THREE.Vector3(0, -0.02, 0);
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

function speckTexture(base: string, cols: string[], n: number, sz: number, rep: [number, number]) {
  const c = document.createElement('canvas'); c.width = c.height = 256;
  const g = c.getContext('2d')!; g.fillStyle = base; g.fillRect(0, 0, 256, 256);
  let a = 5; const r = () => { a = (a * 16807) % 2147483647; return a / 2147483647; };
  for (let i = 0; i < n; i++) { g.fillStyle = cols[i % cols.length]; g.fillRect(r() * 256, r() * 256, sz, sz); }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; t.repeat.set(rep[0], rep[1]);
  return t;
}

export default function Motorhome3D(props: Props) {
  const box = useRef<HTMLDivElement>(null);
  const api = useRef<Api | null>(null);
  const latest = useRef(props);
  latest.current = props;

  useEffect(() => {
    const el = box.current!;
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    const dom = renderer.domElement;
    dom.style.cssText = 'display:block;width:100%;height:100%;touch-action:none;cursor:grab';
    el.appendChild(dom);

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0xcfdce8, 12, 75);
    const cam = new THREE.PerspectiveCamera(38, 1, 0.05, 120);
    const controls = new OrbitControls(cam, dom);
    controls.target.copy(TARGET); controls.enableDamping = true; controls.enablePan = false;
    controls.minDistance = 1.2; controls.maxDistance = 7; controls.minPolarAngle = 0.04; controls.maxPolarAngle = 1.52;
    const place0 = VIEWS['3D'];
    cam.position.set(place0[2] * Math.sin(place0[1]) * Math.cos(place0[0]), TARGET.y + place0[2] * Math.cos(place0[1]), place0[2] * Math.sin(place0[1]) * Math.sin(place0[0]));
    controls.update();

    // ---- lights, ground, gravel pad, lake, soft shadow ----
    const sun = new THREE.DirectionalLight(0xffffff, 1); scene.add(sun);
    const hemi = new THREE.HemisphereLight(0xffffff, 0x999999, 1); scene.add(hemi);
    const pmrem = new THREE.PMREMGenerator(renderer);
    const ground = new THREE.Mesh(new THREE.CircleGeometry(90, 64).rotateX(-H), new THREE.MeshStandardMaterial({ map: speckTexture('#b3a46a', ['#9c8f55', '#c4b57a', '#8a8a52', '#a99a60', '#7d8050'], 3500, 3, [45, 45]), roughness: 1 }));
    ground.position.y = GY - 0.008; scene.add(ground);
    const pad = new THREE.Mesh(new THREE.CircleGeometry(1, 48).rotateX(-H), new THREE.MeshStandardMaterial({ map: speckTexture('#8c8579', ['#767064', '#a29b8d', '#6a655b', '#b5ae9f'], 2500, 2, [3, 5]), roughness: 1 }));
    pad.scale.set(1.15, 1, 1.9); pad.position.y = GY - 0.004; scene.add(pad);
    const lake = new THREE.Mesh(new THREE.CircleGeometry(14, 48).rotateX(-H), new THREE.MeshStandardMaterial({ color: 0x4aa3b8, roughness: 0.06, metalness: 0.25 }));
    lake.scale.set(1.7, 1, 0.9); lake.position.set(-27, GY - 0.006, -24); scene.add(lake);
    {
      const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d')!;
      const r = g.createRadialGradient(128, 128, 10, 128, 128, 128); r.addColorStop(0, 'rgba(0,0,0,.55)'); r.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = r; g.fillRect(0, 0, 256, 256);
      const m = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 3.1).rotateX(-H), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false }));
      m.position.y = GY + 0.001; scene.add(m);
    }

    // ---- sky: visitor's clock, or your own panorama photo ----
    let bgTex: THREE.Texture | null = null, envRT: THREE.WebGLRenderTarget | null = null;
    const setBackground = (t: THREE.Texture) => {
      bgTex?.dispose(); envRT?.dispose();
      bgTex = t; scene.background = t; envRT = pmrem.fromEquirectangular(t); scene.environment = envRT.texture;
    };
    const adMats: THREE.MeshBasicMaterial[] = [];
    const applySky = () => {
      const k = skyFor(new Date(), CONFIG.latitude);
      const t = new THREE.CanvasTexture(k.canvas); t.mapping = THREE.EquirectangularReflectionMapping; t.colorSpace = THREE.SRGBColorSpace;
      setBackground(t);
      const c = (a: number[]) => new THREE.Color().setRGB(a[0] / 255, a[1] / 255, a[2] / 255, THREE.SRGBColorSpace);
      scene.fog = scene.fog ?? new THREE.Fog(0xffffff, 12, 75);
      (scene.fog as THREE.Fog).color.copy(c(k.hor)); (scene.fog as THREE.Fog).near = 8 + 4 * k.df;
      sun.position.set(...k.lightDir).multiplyScalar(10); sun.color.copy(c(k.sun)); sun.intensity = k.sunI * LEG;
      hemi.color.copy(c(k.hemi)); hemi.groundColor.copy(c(k.hemiG)); hemi.intensity = k.hemiI * LEG;
      renderer.toneMappingExposure = k.exp;
      (ground.material as THREE.MeshStandardMaterial).color.setRGB(k.mat[0], k.mat[1], k.mat[2]);
      (pad.material as THREE.MeshStandardMaterial).color.setRGB(k.mat[0], k.mat[1], k.mat[2]);
      (lake.material as THREE.MeshStandardMaterial).color.setRGB((22 + 52 * k.df) / 255 * k.mat[0], (48 + 115 * k.df) / 255 * k.mat[1], (74 + 110 * k.df) / 255 * k.mat[2]);
      adMats.forEach((m) => m.color.setScalar(0.79 + 0.21 * k.df));
    };
    let skyTimer: ReturnType<typeof setInterval> | undefined;
    if (CONFIG.panorama) {
      new THREE.TextureLoader().load(CONFIG.panorama, (t) => {
        t.mapping = THREE.EquirectangularReflectionMapping; t.colorSpace = THREE.SRGBColorSpace; setBackground(t);
        scene.fog = null; ground.visible = pad.visible = lake.visible = false;
        const a = (CONFIG.panoramaSun.u - 0.5) * 2 * Math.PI, e = (CONFIG.panoramaSun.el * Math.PI) / 180;
        sun.position.set(Math.cos(e) * Math.cos(a), Math.sin(e), Math.cos(e) * Math.sin(a)).multiplyScalar(10);
        sun.intensity = 0.95 * LEG; hemi.intensity = 0.35 * LEG; renderer.toneMappingExposure = 1; adMats.forEach((m) => m.color.setScalar(1));
      }, undefined, () => { applySky(); skyTimer = setInterval(applySky, 300000); });
    } else { applySky(); skyTimer = setInterval(applySky, 300000); }

    // ---- ad spots: planes laid on the real surface of the model ----
    type St = { cv: HTMLCanvasElement; tex: THREE.CanvasTexture; mesh: THREE.Mesh; logo: string | null; min: number; placed: boolean; amount: number | null };
    const st: Record<string, St> = {};
    const images = new Map<string, HTMLImageElement>();
    let draftImg: HTMLImageElement | null = null, draftKey = '', selected: string | null = null, draft: Props['draft'] = null, lastView = -1, mode: Props['mode'] = 'auction';
    const meshes: THREE.Mesh[] = [];
    SPOTS.forEach((s) => {
      const cv = document.createElement('canvas'); cv.width = Math.round(s.w * 1800); cv.height = Math.round(s.h * 1800);
      const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
      const mat = new THREE.MeshBasicMaterial({ map: tex, toneMapped: false, transparent: true, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });      adMats.push(mat);
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(s.w, s.h), mat); mesh.userData.id = s.id; mesh.visible = false;
      scene.add(mesh); meshes.push(mesh); st[s.id] = { cv, tex, mesh, logo: null, min: s.price, placed: false, amount: null };
    });
    const shortFmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: CONFIG.currency.toUpperCase(), notation: 'compact', maximumFractionDigits: 1 });
    const draw = (s: SpotDef) => {
      const o = st[s.id], g = o.cv.getContext('2d')!, w = o.cv.width, h = o.cv.height, sel = selected === s.id;
      const ok = (i?: HTMLImageElement | null) => (i && i.complete && i.naturalWidth > 0 ? i : null);
      const im = (draft && draft.spotId === s.id ? ok(draftImg) : null) ?? (o.logo ? ok(images.get(o.logo)) : null);
      g.clearRect(0, 0, w, h);

      if (im) {
        const iw = im.naturalWidth, ih = im.naturalHeight;
        const near = Math.abs(iw / ih / (w / h) - 1) < 0.05;          // within 5% of the spot's shape: fill edge to edge
        const k = near ? Math.max(w / iw, h / ih) : Math.min(w / iw, h / ih);
        g.drawImage(im, (w - iw * k) / 2, (h - ih * k) / 2, iw * k, ih * k);
      
     } else {
        g.fillStyle = 'rgba(255,255,255,0.55)'; g.fillRect(0, 0, w, h);      // vago: branco transparente
        const l1 = s.truckOnly ? 'TRUCK BRANDS' : s.builderOnly ? 'BUILDER BRANDS' : sizeInfo(s).label.toUpperCase();
        const l2 = `from ${shortFmt.format(o.min)} / ${CONFIG.periodLabel}`;
        const F = 56;                                                          // tamanho base fixo, em px do canvas
        g.textAlign = 'center'; g.textBaseline = 'middle';
        g.font = `700 ${F}px system-ui,sans-serif`; const w1 = g.measureText(l1).width;
        g.font = `500 ${F * 0.7}px system-ui,sans-serif`; const w2 = g.measureText(l2).width;
        const k = Math.min(1, (w * 0.84) / Math.max(w1, w2), (h * 0.8) / (F * 2.2));   // só encolhe se não couber
        const f = F * k;
        g.fillStyle = '#3a4a5c'; g.font = `700 ${f}px system-ui,sans-serif`; g.fillText(l1, w / 2, h / 2 - f * 0.6);
        g.fillStyle = '#6b7a90'; g.font = `500 ${f * 0.7}px system-ui,sans-serif`; g.fillText(l2, w / 2, h / 2 + f * 0.6);
      }

      if (mode === 'auction') {
        const LW = sel ? 12 : 6;                                               // espessura fixa
        g.lineWidth = LW; g.strokeStyle = sel ? '#e8890c' : '#7b8a9c';
        g.setLineDash(!sel && !im ? [28, 18] : []);                            // tracejado fixo
        g.strokeRect(LW / 2, LW / 2, w - LW, h - LW);
      }
      o.tex.needsUpdate = true;
    };
    const loadImg = (url: string, then: () => void) => {
      let i = images.get(url);
      if (!i) { i = new Image(); i.crossOrigin = 'anonymous'; i.src = url; images.set(url, i); }
      if (i.complete) then(); else i.addEventListener('load', then, { once: true });
    };
    SPOTS.forEach(draw);
    const applyVis = () => SPOTS.forEach((s) => { const o = st[s.id]; o.mesh.visible = o.placed && (mode === 'auction' || !!o.logo); });

    const DEBUG = location.search.includes('debug');   // open the site with ?debug to log placement info
const V = (a: number[]) => new THREE.Vector3(a[0], a[1], a[2]);

  const placeSpot = (s: SpotDef, car: THREE.Object3D) => {
    const rc = new THREE.Raycaster(), nm = new THREE.Matrix3();
    const cast = (from: THREE.Vector3, dir: THREE.Vector3) => {
      rc.set(from, dir);
      const h = rc.intersectObject(car, true)[0];
      if (!h || !h.face) return null;
      const n = h.face.normal.clone().applyMatrix3(nm.getNormalMatrix(h.object.matrixWorld)).normalize();
      if (n.dot(dir) > 0) n.negate();               // always face the camera side
      return { p: h.point, n, d: h.distance };
    };
    const m: Record<string, number[][]> = {         // [ray origin, ray direction, "up" hint]
      'x+': [[2, s.b, s.a], [-1, 0, 0], [0, 1, 0]], 'x-': [[-2, s.b, s.a], [1, 0, 0], [0, 1, 0]],
      'z-': [[s.a, s.b, -2], [0, 0, 1], [0, 1, 0]], 'z+': [[s.a, s.b, 2], [0, 0, -1], [0, 1, 0]], // was [0,-1,0] = upside down
      'y+': [[s.a, 2, s.b], [0, -1, 0], [0, 0, 1]],
    };
    const [o, d, upH] = m[s.side].map(V);
    const n0 = d.clone().negate();
    const x0 = new THREE.Vector3().crossVectors(upH, n0).normalize(), y0 = new THREE.Vector3().crossVectors(n0, x0);

    // 1) probe a 3x3 grid of rays over the footprint; the average normal is the best-fit orientation
    const nSum = new THREE.Vector3();
    let top: THREE.Vector3 | null = null;
    for (const i of [-1, 0, 1]) for (const j of [-1, 0, 1]) {
      const h = cast(o.clone().addScaledVector(x0, (i * s.w) / 2).addScaledVector(y0, (j * s.h) / 2), d);
      if (h) { nSum.add(h.n); if (!top || h.p.y > top.y) top = h.p; }
    }
    const mid = cast(o, d);
    if (!mid || nSum.lengthSq() === 0) { console.warn('ad spot not placed (ray missed the model):', s.id); return; }
    const roof = s.side === 'y+';
    if (roof && top) mid.p = top.clone();            // centro na parte mais alta do spot
    const n = roof ? n0.clone() : nSum.normalize();  // teto: plano sempre horizontal
    const x = new THREE.Vector3().crossVectors(upH, n);
    if (x.lengthSq() < 1e-6) x.copy(x0);
    x.normalize();
    const y = new THREE.Vector3().crossVectors(n, x);

    // 2) conform: a subdivided grid whose vertices are projected onto the real surface
    const sx = Math.min(32, Math.max(2, Math.round(s.w * 48))), sy = Math.min(32, Math.max(2, Math.round(s.h * 48)));
    const geo = new THREE.PlaneGeometry(s.w, s.h, sx, sy), pos = geo.attributes.position;
    const lift = roof ? 0.012 : 0.006, reach = roof ? 2 : 0.5, tol = roof ? 0.4 : 0.1, dn = n.clone().negate(), p = new THREE.Vector3();    let fit = 0;
    for (let i = 0; i < pos.count; i++) {
      p.copy(mid.p).addScaledVector(x, pos.getX(i)).addScaledVector(y, pos.getY(i));   // flat position
      const h = cast(p.clone().addScaledVector(n, reach), dn);
      if (h && Math.abs(h.d - reach) < tol) { p.copy(h.p).addScaledVector(h.n, lift); fit++; }
      else p.addScaledVector(n, lift);                                                   // no surface nearby: stay flat
      pos.setXYZ(i, p.x, p.y, p.z);
    }
    geo.computeBoundingSphere(); geo.computeBoundingBox();
    const o2 = st[s.id];
    o2.mesh.geometry.dispose(); o2.mesh.geometry = geo;           // vertices are already in world space
    o2.mesh.position.set(0, 0, 0); o2.mesh.quaternion.identity(); o2.mesh.updateMatrixWorld(true);
    o2.placed = true; applyVis();
    if (DEBUG) console.log(`${s.id}: ${fit}/${pos.count} vertices on the surface, normal`, n.toArray().map((v) => +v.toFixed(2)));
  };

    // ---- the motorhome ----
    new GLTFLoader().load('/models/motorhome.glb', (g) => {
      const car = g.scene;
      car.traverse((o) => { const m = (o as THREE.Mesh).material as THREE.MeshStandardMaterial | undefined; if (m) { m.envMapIntensity = 0.9; m.side = THREE.DoubleSide; } });
      scene.add(car); car.updateMatrixWorld(true);
      if (DEBUG) { const b = new THREE.Box3().setFromObject(car); console.log('motorhome bbox', b.min.toArray(), b.max.toArray()); }
      SPOTS.forEach((s) => placeSpot(s, car));
    });

    // ---- camera moves ----
    let anim: { t: number; from: number[]; to: number[] } | null = null;
    const cur = () => { const d = cam.position.clone().sub(TARGET), r = d.length(); return [Math.atan2(d.z, d.x), Math.acos(clamp(d.y / r, -1, 1)), r]; };
    const go = (n: ViewName) => {
      const f = cur(), t = [...VIEWS[n]], d = t[0] - f[0];
      t[0] = f[0] + Math.atan2(Math.sin(d), Math.cos(d)); anim = { t: 0, from: f, to: t };
    };
    controls.addEventListener('start', () => { anim = null; });

    // ---- picking ----
    const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
    const hit = (e: PointerEvent) => {
      const r = dom.getBoundingClientRect(); ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(ndc, cam); const h = ray.intersectObjects(meshes)[0]; return h ? (h.object.userData.id as string) : null;
    };
    let down: [number, number] | null = null;
    dom.addEventListener('pointerdown', (e) => { down = [e.clientX, e.clientY]; });
    dom.addEventListener('pointerup', (e) => {
      if (!down) return; const moved = Math.hypot(e.clientX - down[0], e.clientY - down[1]); down = null;
      if (moved > 5) return; const id = hit(e); if (id) latest.current.onSelect(id);
    });
    dom.addEventListener('pointermove', (e) => { if (!down) dom.style.cursor = hit(e) ? 'pointer' : 'grab'; });

    // ---- sync React props -> scene ----
    api.current = {
      update: (p) => {
        selected = p.selected; draft = p.draft; mode = p.mode;
        if (p.draft && p.draft.dataUrl !== draftKey) { draftKey = p.draft.dataUrl; draftImg = new Image(); draftImg.onload = () => SPOTS.forEach(draw); draftImg.src = draftKey; }
        if (!p.draft) { draftKey = ''; draftImg = null; }
        SPOTS.forEach((s) => {
          const o = st[s.id]; o.min = p.mins[s.id] ?? s.price; o.logo = p.logos[s.id] ?? null; o.amount = p.amounts[s.id] ?? null;
          if (o.logo) loadImg(o.logo, () => draw(s));
          draw(s);
        });
        applyVis();
        if (p.view && p.view.n !== lastView) { lastView = p.view.n; go(p.view.name); }
      },
    };
    api.current.update(latest.current);

    // ---- loop & resize ----
    const resize = () => { const w = el.clientWidth || 1, h = el.clientHeight || 1; renderer.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); };
    const ro = new ResizeObserver(resize); ro.observe(el); resize();
    const clock = new THREE.Clock();
    renderer.setAnimationLoop(() => {
      const dt = clock.getDelta();
      if (anim) {
        anim.t = Math.min(1, anim.t + dt * 2.2);
        const k = 1 - Math.pow(1 - anim.t, 3), [a, b] = [anim.from, anim.to];
        const th = a[0] + (b[0] - a[0]) * k, ph = a[1] + (b[1] - a[1]) * k, r = a[2] + (b[2] - a[2]) * k;
        cam.position.set(TARGET.x + r * Math.sin(ph) * Math.cos(th), TARGET.y + r * Math.cos(ph), TARGET.z + r * Math.sin(ph) * Math.sin(th));
        if (anim.t >= 1) anim = null;
      }
      controls.update(); renderer.render(scene, cam);
    });

    return () => {
      renderer.setAnimationLoop(null); ro.disconnect(); if (skyTimer) clearInterval(skyTimer);
      controls.dispose(); bgTex?.dispose(); envRT?.dispose(); pmrem.dispose(); renderer.dispose(); dom.remove(); api.current = null;
    };
  }, []);

  useEffect(() => { api.current?.update(props); });
  return <div ref={box} style={{ position: 'absolute', inset: 0 }} />;
}

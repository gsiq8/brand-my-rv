"use client";

import { useEffect, useMemo, useRef, useState, type MouseEvent } from "react";

type Pt = [number, number];

// Imagem /public/map-americas.jpeg: 1200×2400, JÁ na orientação final
// (sul no topo, San Francisco embaixo). Sem rotação/flip em código ou CSS.
const IMG_W = 1200, IMG_H = 2400;

// Waypoints em pixels da imagem, sul → norte.
const WAYPOINTS: Pt[] = [
  [460, 398],  // Ushuaia / Tierra del Fuego
  [491, 425],  // Punta Arenas
  [515, 463],  // Torres del Paine
  [515, 492],  // El Chaltén
  [496, 633],  // Bariloche
  [487, 765],  // Santiago
  [494, 825],  // La Serena
  [485, 933],  // Antofagasta
  [484, 1020],  // Arica
  [564, 1131],  // Lima
  [588, 1198],  // Trujillo
  [599, 1299],  // Guayaquil
  [582, 1334],  // Quito
  [529, 1418],  // Bogotá
  [546, 1515],  // Cartagena
  [594, 1491],  // Panama
  [649, 1507],  // San José
  [676, 1545],  // Managua
  [726, 1587],  // Guatemala
  [800, 1630],  // Oaxaca
  [829, 1670],  // Mexico City
  [880, 1692],  // Guadalajara
  [917, 1735],  // Mazatlán
  [972, 1836],  // Hermosillo
  [971, 1874],  // US border
  [1058, 1921],  // Los Angeles
  [1109, 1985],  // San Francisco
];

// Curva suave pelos pontos (Catmull-Rom → Bézier).
function smooth(p: Pt[]) {
  let d = `M ${p[0][0]} ${p[0][1]}`;
  for (let i = 0; i < p.length - 1; i++) {
    const p0 = p[i - 1] ?? p[i], p1 = p[i], p2 = p[i + 1], p3 = p[i + 2] ?? p2;
    d += ` C ${p1[0] + (p2[0] - p0[0]) / 6} ${p1[1] + (p2[1] - p0[1]) / 6}, ${p2[0] - (p3[0] - p1[0]) / 6} ${p2[1] - (p3[1] - p1[1]) / 6}, ${p2[0]} ${p2[1]}`;
  }
  return d;
}

export default function Background() {
  const mapRef = useRef<HTMLDivElement>(null);
  const routeRef = useRef<SVGPathElement>(null);
  const doneRef = useRef<SVGPathElement>(null);
  const rvRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [tracing] = useState(() => 
    typeof window !== 'undefined' ? location.search.includes("trace") : false
  );

  // O mapa ocupa o container pai (.journey) inteiro: acompanha o tamanho das seções.
  useEffect(() => {
    const el = mapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setSize({ w: el.clientWidth, h: el.clientHeight }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Waypoints em PIXELS da tela (imagem esticada para o tamanho do container).
  const pts = useMemo(
    () => WAYPOINTS.map(([x, y]) => [(x / IMG_W) * size.w, (y / IMG_H) * size.h] as Pt),
    [size]
  );
  const d = useMemo(() => (size.w && size.h ? smooth(pts) : ""), [pts, size]);

  // RV: fica no centro da tela; sua posição no mapa é o ponto do trajeto
  // cuja altura coincide com o centro da viewport.
  useEffect(() => {
    const map = mapRef.current, route = routeRef.current, done = doneRef.current, rv = rvRef.current;
    if (!map || !route || !done || !rv || !d) return;

    const total = route.getTotalLength(), N = 3000;
    const ys = new Float32Array(N + 1);
    let maxY = -Infinity;
    for (let i = 0; i <= N; i++) {
      maxY = Math.max(maxY, route.getPointAtLength((total * i) / N).y); // máximo acumulado → monotônico
      ys[i] = maxY;
    }
    done.style.strokeDasharray = `${total}`;

    const update = () => {
      const rect = map.getBoundingClientRect();
      const target = Math.min(size.h, Math.max(0, window.innerHeight / 2 - rect.top));
      let lo = 0, hi = N;
      while (lo < hi) { const m = (lo + hi) >> 1; if (ys[m] < target) lo = m + 1; else hi = m; }
      const q = route.getPointAtLength((total * lo) / N);
      rv.style.transform = `translate(${q.x}px, ${q.y}px) translate(-50%, -50%)`;
      done.style.strokeDashoffset = `${total * (1 - lo / N)}`;
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => { window.removeEventListener("scroll", update); window.removeEventListener("resize", update); };
  }, [d, size.h]);

  // ?trace → clique no mapa para logar coordenadas em pixels da imagem
  const onMapClick = (e: MouseEvent<HTMLDivElement>) => {
    if (!tracing || !mapRef.current) return;
    const r = mapRef.current.getBoundingClientRect();
    console.log(`[${Math.round(((e.clientX - r.left) / r.width) * IMG_W)}, ${Math.round(((e.clientY - r.top) / r.height) * IMG_H)}],`);
  };

  const start = pts[0], end = pts[pts.length - 1];

  return (
    <div ref={mapRef} className={"map" + (tracing ? " tracing" : "")} aria-hidden="true" onClick={onMapClick}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: "url(/map-americas.jpeg)", backgroundSize: "100% 100%" }} />

      {d && (
        <>
          <svg width={size.w} height={size.h} style={{ position: "absolute", left: 0, top: 0, width: size.w, height: size.h, overflow: "visible", pointerEvents: "none" }}>
            <path ref={routeRef} d={d} fill="none" style={{ stroke: "#f07836", strokeOpacity: 0.35, strokeWidth: 2, strokeDasharray: "1 8", strokeLinecap: "round" }} />
            <path ref={doneRef} d={d} fill="none" style={{ stroke: "#f07836", strokeWidth: 3, strokeLinecap: "round", strokeLinejoin: "round" }} />
          </svg>
          <Pin x={start[0]} y={start[1]} label="Tierra del Fuego" />
          <Pin x={end[0]} y={end[1]} label="San Francisco" />
          <div ref={rvRef} className="rv" style={{ position: "absolute", left: 0, top: 0, fontSize: 38, lineHeight: 1, willChange: "transform" }}>🚐</div>
          {tracing && pts.map(([x, y], i) => (
            <i key={i} style={{ position: "absolute", left: x - 4, top: y - 4, width: 8, height: 8, borderRadius: "50%", background: "red" }} />
          ))}
        </>
      )}
    </div>
  );
}

function Pin({ x, y, label }: { x: number; y: number; label: string }) {
  return (
    <svg className="pin" viewBox="-13 -19 26 34" aria-label={label}
      style={{ position: "absolute", left: x, top: y, width: 20, height: 26, transform: "translate(-50%, -100%)", overflow: "visible", pointerEvents: "none" }}>
      <path d="M 0 14 C -4 7 -12 0 -12 -7 A 12 12 0 1 1 12 -7 C 12 0 4 7 0 14Z" />
      <circle cy="-7" r="4" />
    </svg>
  );
}
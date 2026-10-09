"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";

type Pt = [number, number];

// Waypoints on the UNFLIPPED map (viewBox 1000×1500), south → north.
const WAYPOINTS: Pt[] = [
  [656, 1443], // 0  Tierra del Fuego
  [640, 1392], [656, 1318],
  [676, 1230], // 3  Patagonia
  [713, 1143], [693, 1035], [674, 986], [669, 879], [640, 830],
  [581, 771],  // 9  Lima
  [537, 708], [542, 664], [561, 610],
  [596, 518],  // 13 Cartagena (the Darién crossing starts here)
  [549, 540],  // 14 Panama
  [524, 515], [495, 490], [465, 476],
  [436, 458],  // 18 Guatemala
  [405, 444], [342, 415], [305, 382], [272, 343], [244, 296],
  [190, 244],  // 24 US border
  [156, 200],
  [107, 137],  // 26 San Francisco
];
// Which waypoint each section below stops at:
const STOPS = [0, 3, 9, 13, 18, 24, 26];

// const sections: [string, string][] = [
//   ["Tierra del Fuego", "The journey begins at the end of the world."],
//   ["Patagonia", "North through the mountains and open country."],
//   ["South America", "Following the long road north."],
//   ["The Darién Gap", "A sea crossing between the road sections."],
//   ["Central America", "Back on the road, heading north."],
//   ["Mexico and the American West", "The final stretch."],
//   ["San Francisco", "The destination."],
// ];

// Smooth curve through the waypoints (Catmull-Rom → Bézier).
function smooth(p: Pt[]) {
  let d = `M ${p[0][0]} ${p[0][1]}`;
  for (let i = 0; i < p.length - 1; i++) {
    const p0 = p[i - 1] ?? p[i], p1 = p[i], p2 = p[i + 1], p3 = p[i + 2] ?? p2;
    d += ` C ${p1[0] + (p2[0] - p0[0]) / 6} ${p1[1] + (p2[1] - p0[1]) / 6}, ${p2[0] - (p3[0] - p1[0]) / 6} ${p2[1] - (p3[1] - p1[1]) / 6}, ${p2[0]} ${p2[1]}`;
  }
  return d;
}
const ROUTE_D = smooth(WAYPOINTS);

// Distance along the path of the point nearest to a waypoint.
function lengthNear(path: SVGPathElement, [x, y]: Pt) {
  const total = path.getTotalLength();
  let best = 0, bestD = Infinity;
  for (let l = 0; l <= total; l += total / 2000) {
    const q = path.getPointAtLength(l);
    const d = (q.x - x) ** 2 + (q.y - y) ** 2;
    if (d < bestD) { bestD = d; best = l; }
  }
  return best;
}

export default function JourneyPage() {
  const storyRef = useRef<HTMLElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const flipRef = useRef<SVGGElement>(null);
  const routeRef = useRef<SVGPathElement>(null);
  const doneRef = useRef<SVGPathElement>(null);
  const rvRef = useRef<SVGGElement>(null);
  const [tracing, setTracing] = useState(false);

  useEffect(() => setTracing(location.search.includes("trace")), []);

  useEffect(() => {
    // const story = document.getElementById("journey");
    const story = storyRef.current, route = routeRef.current, done = doneRef.current, rv = rvRef.current;
    if (!story || !route || !done || !rv) return;
    const total = route.getTotalLength();
    const stops = STOPS.map((i) => lengthNear(route, WAYPOINTS[i]));
    done.style.strokeDasharray = `${total}`;

    const update = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const p = scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0;
      const s = p * (stops.length - 1), i = Math.min(stops.length - 2, Math.floor(s));
      const len = stops[i] + (stops[i + 1] - stops[i]) * (s - i);   // section i → i+1
      const pt = route.getPointAtLength(len);
      rv.setAttribute("transform", `translate(${pt.x} ${pt.y}) rotate(180)`); // counter-flip: emoji stays upright
      done.style.strokeDashoffset = `${total - len}`;               // orange trace grows behind the RV
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => { window.removeEventListener("scroll", update); window.removeEventListener("resize", update); };
  }, []);

  // ?trace → click the map to log coordinates for the WAYPOINTS list
  const onMapClick = (e: MouseEvent<SVGSVGElement>) => {
    const svg = svgRef.current, g = flipRef.current, m = g?.getScreenCTM();
    if (!tracing || !svg || !m) return;
    const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
    const p = pt.matrixTransform(m.inverse());
    console.log(`[${Math.round(p.x)}, ${Math.round(p.y)}],`);
  };

  return (
    <>
      <div className={"map" + (tracing ? " tracing" : "")} aria-hidden="true">
        <svg ref={svgRef} viewBox="0 0 1000 1500" preserveAspectRatio="xMidYMid meet" onClick={onMapClick}>         
            <g ref={flipRef} transform="rotate(180 500 750)">
            <image href="/map-americas.jpeg" x="0" y="0" width="1000" height="1500" preserveAspectRatio="none" />
            <path ref={routeRef} className="route-base" d={ROUTE_D} />
            <path ref={doneRef} className="route" d={ROUTE_D} />
            <Pin x={WAYPOINTS[0][0]} y={WAYPOINTS[0][1]} label="Tierra del Fuego" />
            <Pin x={WAYPOINTS[26][0]} y={WAYPOINTS[26][1]} label="San Francisco" />
            <g ref={rvRef} className="rv">
              <text textAnchor="middle" dominantBaseline="central" fontSize="38">🚐</text>
            </g>
            {tracing && WAYPOINTS.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="4" fill="red" />)}
          </g>
        </svg>
      </div>

      {/* <main ref={storyRef} className="story">
        {sections.map(([title, description]) => (
          <section key={title}>
            <div className="story-card"><h1>{title}</h1><p>{description}</p></div>
          </section>
        ))}
      </main> */}
    </>
  );
}

function Pin({ x, y, label }: { x: number; y: number; label: string }) {
  return (
    // the tip of the pin sits exactly on (x, y); rotate(180) cancels the map flip
    <g transform={`translate(${x} ${y}) rotate(180) scale(1.6) translate(0 -14)`} aria-label={label} className="pin">
      <path d="M 0 14 C -4 7 -12 0 -12 -7 A 12 12 0 1 1 12 -7 C 12 0 4 7 0 14Z" />
      <circle cy="-7" r="4" />
    </g>
  );
}
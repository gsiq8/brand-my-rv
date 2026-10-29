import { COPY, SPECS, STEPS } from '@/lib/site';

export function HowItWorks() {
  return (
    <section className="wrap card-sec" id="how">
      <h2>How it works</h2>
      <ul className="steps">
        {STEPS.map((s, i) => (
          <li key={s.t}>
            <span className="num-b">{i + 1}</span>
            <div>
              <h3>{s.t}</h3>
              <p>{s.d}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function Specs() {
  return (
  <section className="wrap card-sec" id="specs">
    <h2>{COPY.specsTitle}</h2>
    <p className="lead mb-5">{COPY.specsSub}</p>
    <div className="card">
      <div className="card-head">
        <h3 className="hidden md:block tw">{COPY.specsName}</h3>
        <h3 className="sm:hidden tw">{COPY.specsNameMobile}</h3>
        <h3 className="tw">{COPY.specsPrice}</h3>
      </div>
      {SPECS.map(([k, v]) => <div className="card-row" key={k}>
        <span className="k">{k}</span>
        <span className="v">{v}</span>
        </div>)}
    </div>
    <p className="muted small note">{COPY.specsNote} 
      <a href={COPY.specsLink.href}>{COPY.specsLink.label}
        </a>.
        </p>
  </section>
  );
}

export function Footer() {
  return (
    <footer className="ftr dark-grey">
      <div className="wrap grid auto-cols-max grid-flow-col justify-between">
        <nav>
          <span className="text-white">Copyright © 2026 Brand My RV.</span>
        </nav>
        <nav className="footer-links">
          <a href="/privacy">Privacy</a>
          <a href="/terms">Terms</a>
        </nav>
      </div>
    </footer>
  );
}

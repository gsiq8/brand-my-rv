import { COPY, FAQ, SPECS, STEPS } from '@/lib/site';
import { Plus } from 'lucide-react';

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
        <h3 className="tw">{COPY.specsName}</h3>
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
    <footer className="ftr">
      <div className="wrap">
        <nav>
          <a href="#spots">The auction</a><a href="/leaderboard">Leaderboard</a><a href="/replay">Replay</a><a href="#how">How it works</a>
          <a href="#corner">The strip</a><a href="#specs">The motorhome</a><a href="#faq">FAQ</a>
        </nav>
        <nav><a href="/privacy">Privacy</a><a href="/terms">Terms</a></nav>
        {/* <p className="muted small">{COPY.disclaimer}</p> */}
      </div>
    </footer>
  );
}

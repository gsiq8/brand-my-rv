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
    <p className="lead">{COPY.specsSub}</p>
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

export function Faq() {
  return (
    <section className="wrap card-sec" id="faq">
      <h2>Questions &amp; answers</h2>          
          <div className="faq">
            <div className="card">
              {FAQ.map((f) => 
                <details key={f.q}>
                <div className="row-h">
                  <summary>{f.q}</summary>
                  <Plus/>
                </div>
                <div className="p">
                  <p>{f.a}</p>
                </div>
                </details>)}
            </div>
          </div>
    </section>
  );
}

export function Host() {
  const h = COPY.host;
  return (
    <section className="wrap sec">
      <div className="host">
        <span className="av big">{h.name.replace('[', '').slice(0, 1).toUpperCase()}</span>
        <div>
          <h3>Hey, I’m {h.name} 👋</h3>
          <p>{h.bio}</p>
          <p>{h.links.map((l) => <a key={l.label} href={l.href} className="lnk">{l.label}</a>)}</p>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="ftr">
      <div className="wrap">
        <nav>
          <a href="#spots">The auction</a><a href="/leaderboard">Leaderboard</a><a href="/replay">Replay</a><a href="#how">How it works</a>
          <a href="#corner">The corner</a><a href="#specs">The motorhome</a><a href="#faq">FAQ</a>
        </nav>
        <nav><a href="/privacy">Privacy</a><a href="/terms">Terms</a></nav>
        <p className="muted small">{COPY.disclaimer}</p>
      </div>
    </footer>
  );
}

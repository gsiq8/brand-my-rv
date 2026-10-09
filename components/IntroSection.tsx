"use client"
import { COPY } from '@/lib/site';

export default function IntroSection() {
  return (
    <section className="intros wrap">
      <h2>{COPY.introTitle}<br /><span className="dim">{COPY.introTitle2}</span></h2>
      <a href="#spots" aria-label="Scroll to the auction" className="chev">
        <svg width="30" height="16" viewBox="0 0 30 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 2l13 12L28 2" /></svg>
      </a>
    </section>
  );
}
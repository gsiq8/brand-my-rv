'use client';
import { useEffect, useState } from 'react';
import { SPOTS } from '@/lib/spots';
import { CONFIG } from '@/lib/config';
import { depositFor } from '@/lib/pricing';
import type { BoardEntry } from '@/lib/types';

export const money = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: CONFIG.currency.toUpperCase(), maximumFractionDigits: 0 }).format(n);

/** Converts any image (PNG/JPG/WebP/SVG) to a PNG of max 800px. Also makes SVG uploads safe. */
function shrinkToPng(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onerror = () => reject(new Error('read'));
    fr.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('image'));
      img.onload = () => {
        const w0 = img.naturalWidth || 800, h0 = img.naturalHeight || 400, k = Math.min(1, 800 / Math.max(w0, h0));
        const c = document.createElement('canvas'); c.width = Math.max(1, Math.round(w0 * k)); c.height = Math.max(1, Math.round(h0 * k));
        c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height);
        resolve(c.toDataURL('image/png'));
      };
      img.src = String(fr.result);
    };
    fr.readAsDataURL(file);
  });
}

const FIELDS = [
  ['name', 'Name or company', 'text', 'shown on the public board'],
  ['phone', 'Phone', 'tel', ''],
  ['email', 'Email', 'email', ''],
  ['address', 'Address', 'text', ''],
  ['taxId', 'ID / tax number (CPF, SSN, passport…)', 'text', ''],
] as const;
type Contact = Record<(typeof FIELDS)[number][0], string>;

type Props = {
  board: Record<string, BoardEntry>;
  selected: string | null;
  onSelect: (id: string) => void;
  onDraft: (spotId: string, dataUrl: string | null) => void;
};

export default function BidWizard({ board, selected, onSelect, onDraft }: Props) {
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState('');
  const [logo, setLogo] = useState<string | null>(null);
  const [c, setC] = useState<Contact>({ name: '', phone: '', email: '', address: '', taxId: '' });
  const [mode, setMode] = useState<'full' | 'deposit'>('full');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const spot = SPOTS.find((s) => s.id === selected) ?? null;
  const min = spot ? board[spot.id]?.min ?? spot.price : 0;
  const amt = Number(amount);

  // keep the logo preview on whichever spot is selected
  useEffect(() => { if (spot && logo) onDraft(spot.id, logo); }, [spot?.id, logo]); // eslint-disable-line react-hooks/exhaustive-deps

  async function onFile(f: File | undefined) {
    if (!f || !spot) return;
    if (f.size > 8_000_000) return setErr('That file is too large (max 8 MB).');
    try { const d = await shrinkToPng(f); setLogo(d); setErr(''); } catch { setErr('Could not read that image.'); }
  }

  function next() {
    setErr('');
    if (step === 1) {
      if (!spot) return setErr('Choose a spot.');
      if (!logo) return setErr('Attach your logo.');
      if (!Number.isInteger(amt) || amt < min) return setErr(`Your bid must be a whole number of at least ${money(min)}.`);
      setStep(2);
    } else if (step === 2) {
      if (FIELDS.some(([k]) => !c[k].trim())) return setErr('Please fill in all fields.');
      if (!/^\S+@\S+\.\S+$/.test(c.email)) return setErr('Enter a valid email.');
      if ((c.phone.match(/\d/g) ?? []).length < 8) return setErr('Enter a valid phone number.');
      setStep(3);
    }
  }

  async function pay() {
    if (!spot || !logo) return;
    setBusy(true); setErr('');
    try {
      const r = await fetch('/api/bids', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ spotId: spot.id, amount: amt, mode, logo, ...c }),
      });
      const j = await r.json();
      if (!r.ok || !j.url) { setErr(j.error ?? 'Something went wrong.'); if (r.status === 400) setStep(1); setBusy(false); return; }
      window.location.href = j.url; // Stripe Checkout
    } catch { setErr('Network error. Please try again.'); setBusy(false); }
  }

  const dep = spot ? depositFor(amt || 0) : 0;
  return (
    <div>
      <div className="dots">
        {['Spot & logo', 'Your details', 'Payment'].map((t, i) => (
          <span key={t} className={step === i + 1 ? 'on' : step > i + 1 ? 'ok' : ''}>{i + 1} {t}</span>
        ))}
      </div>

      {step === 1 && (<>
        <p>Tap a spot on the motorhome or pick one here.</p>
        {SPOTS.map((s) => {
          const e = board[s.id];
          return (
            <button key={s.id} className={'spot' + (s.id === selected ? ' sel' : '')} onClick={() => onSelect(s.id)}>
              <span>{s.name}</span>
              <span className="tag">{e?.leader ? `Now ${money(e.leader.amount)}` : 'Open'} · min {money(e?.min ?? s.price)}</span>
            </button>
          );
        })}
        {spot && (<>
          <label>Your logo (PNG / JPG / SVG)</label>
          <input type="file" accept="image/*" onChange={(e) => onFile(e.target.files?.[0])} />
          {logo && <div className="tag on">Logo attached – preview is on the motorhome</div>}
          <label>Your bid ({CONFIG.currency.toUpperCase()} / {CONFIG.periodLabel})</label>
          <input type="number" min={min} step={1} placeholder={`Min ${min}`} value={amount} onChange={(e) => setAmount(e.target.value)} />
          <div className="tag">Minimum: {money(min)}{board[spot.id]?.leader ? ` (current ${money(board[spot.id]!.leader!.amount)} + ${money(CONFIG.bidStep)})` : ' (starting price)'}</div>
        </>)}
      </>)}

      {step === 2 && (<>
        <p>Your details are private. Only the name or company is shown on the board.</p>
        {FIELDS.map(([k, label, type, note]) => (
          <div key={k}>
            <label>{label} {note && <span className="tag">({note})</span>}</label>
            <input type={type} value={c[k]} onChange={(e) => setC({ ...c, [k]: e.target.value })} />
          </div>
        ))}
      </>)}

      {step === 3 && spot && (<>
        <div className="sum"><b>{spot.name}</b><br />Bid {money(amt)} / {CONFIG.periodLabel} · {c.name}</div>
        <label className="opt">
          <input type="radio" name="m" checked={mode === 'full'} onChange={() => setMode('full')} />
          <span>Pay in full now<small>Secure checkout by Stripe. You will see the payment methods available to you.</small></span>
        </label>
        <label className="opt dep">
          <input type="radio" name="m" checked={mode === 'deposit'} onChange={() => setMode('deposit')} />
          <span>Reserve with a {money(dep)} deposit
            <small>Your offer of {money(amt)} is registered. We contact you to collect the balance (invoice, bank transfer…).
              {amt >= CONFIG.invoiceHintFrom ? ' Recommended for larger amounts.' : ''}</small></span>
        </label>
      </>)}

      {err && <div id="msg">{err}</div>}
      <div className="row">
        {step > 1 && <button onClick={() => { setErr(''); setStep(step - 1); }} disabled={busy}>← Back</button>}
        {step < 3
          ? <button className="pri" onClick={next} disabled={step === 1 && !spot}>Next →</button>
          : <button className="pri" onClick={pay} disabled={busy}>{busy ? 'Redirecting…' : mode === 'deposit' ? `Pay ${money(dep)} deposit` : `Pay ${money(amt)}`}</button>}
      </div>
    </div>
  );
}

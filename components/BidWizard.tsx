'use client';
import { useEffect, useState } from 'react';
import { SPOTS, brandAllowed, TRUCK_ONLY_MSG, BUILDER_ONLY_MSG } from '@/lib/spots';
import { CONFIG } from '@/lib/config';
import { depositFor } from '@/lib/pricing';
import { money } from '@/lib/format';
import type { BoardEntry } from '@/lib/types';

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
  ['name', 'Name or company', 'text', 'shown publicly'],
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
  const entry = spot ? board[spot.id] : undefined;
  const min = spot ? entry?.min ?? spot.price : 0;
  const amt = Number(amount);
  const period = spot?.period ?? CONFIG.periodLabel;
  const canDeposit = !!spot && !spot.noDeposit;
  const effMode = canDeposit ? mode : 'full';

  // keep the logo preview on the selected spot
  useEffect(() => { if (spot && logo) onDraft(spot.id, logo); }, [spot?.id, logo]); // eslint-disable-line react-hooks/exhaustive-deps

  async function onFile(f: File | undefined) {
    if (!f || !spot) return;
    if (f.size > 8_000_000) return setErr('That file is too large (max 8 MB).');
    try { setLogo(await shrinkToPng(f)); setErr(''); } catch { setErr('Could not read that image.'); }
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
      const isBrandAllowed = !!spot && (brandAllowed as (s: typeof spot, name: string) => boolean)(spot, c.name);
      if (spot && !brandAllowed(spot, c.name)) return setErr(spot.builderOnly ? BUILDER_ONLY_MSG : TRUCK_ONLY_MSG);      setStep(3);
    }
  }

  async function pay() {
    if (!spot || !logo) return;
    setBusy(true); setErr('');
    try {
      const r = await fetch('/api/bids', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ spotId: spot.id, amount: amt, mode: effMode, logo, ...c }),
      });
      const j = await r.json();
      if (!r.ok || !j.url) { setErr(j.error ?? 'Something went wrong.'); if (r.status === 400) setStep(1); setBusy(false); return; }
      window.location.href = j.url; // Stripe Checkout
    } catch { setErr('Network error. Please try again.'); setBusy(false); }
  }

  const dep = depositFor(amt || 0);
  return (
    <div className="wiz">
      <div className="dots">
        {['Spot & logo', 'Your details', 'Payment'].map((t, i) => (
          <span key={t} className={step === i + 1 ? 'on' : step > i + 1 ? 'ok' : ''}>{i + 1} {t}</span>
        ))}
      </div>

      {step === 1 && (<>
        <label>Spot</label>
        <select value={selected ?? ''} onChange={(e) => e.target.value && onSelect(e.target.value)}>
          {spot?.truckOnly && <div className="hint">Reserved for truck brands (Iveco, Mercedes-Benz, Ford, Toyota…). Enter your brand name in the next step.</div>}
          <option value="">Choose a spot…</option>
          {SPOTS.map((s) => <option key={s.id} value={s.id}>{s.name} — min {money(board[s.id]?.min ?? s.price)}</option>)}
        </select>
        {spot && (<>
          <label>Your logo (PNG / JPG / SVG)</label>
          <input type="file" accept="image/*" onChange={(e) => onFile(e.target.files?.[0])} />
          {logo && <div className="thumb"><img src={logo} alt="Your logo" /><span>Logo attached{spot.kind !== 'web' ? ' – preview is on the motorhome' : ''}</span></div>}
          <label>Your bid ({CONFIG.currency.toUpperCase()} / {period})</label>
          <input type="number" min={min} step={1} placeholder={`Min ${min}`} value={amount} onChange={(e) => setAmount(e.target.value)} />
          <div className="hint">Minimum: {money(min)}{entry?.leader ? ` (current ${money(entry.leader.amount)} + ${money(CONFIG.bidStep)})` : ' (starting price)'}</div>
        </>)}
      </>)}

      {step === 2 && (<>
        <p className="hint">Your details are private. Only the name or company is shown publicly.</p>
        {FIELDS.map(([k, label, type, note]) => (
          <div key={k}>
            <label>{label} {note && <span className="hint">({note})</span>}</label>
            <input type={type} value={c[k]} onChange={(e) => setC({ ...c, [k]: e.target.value })} />
          </div>
        ))}
      </>)}

      {step === 3 && spot && (<>
        <div className="sum"><b>{spot.name}</b><br />Bid {money(amt)} / {period} · {c.name}</div>
        <label className="opt">
          <input type="radio" name="m" checked={effMode === 'full'} onChange={() => setMode('full')} />
          <span>Pay in full now<small>Secure checkout by Stripe – you will see the payment methods available to you.</small></span>
        </label>
        {canDeposit && (
          <label className="opt dep">
            <input type="radio" name="m" checked={effMode === 'deposit'} onChange={() => setMode('deposit')} />
            <span>Reserve with a {money(dep)} deposit
              <small>Your offer of {money(amt)} is registered and we contact you to collect the balance (invoice, bank transfer…).
                {amt >= CONFIG.invoiceHintFrom ? ' Recommended for larger amounts.' : ''}</small></span>
          </label>
        )}
      </>)}

      {err && <div className="err">{err}</div>}
      <div className="row">
        {step > 1 && <button className="btn" onClick={() => { setErr(''); setStep(step - 1); }} disabled={busy}>← Back</button>}
        {step < 3
          ? <button className="btn pri" onClick={next} disabled={!spot}>Next →</button>
          : <button className="btn pri" onClick={pay} disabled={busy}>{busy ? 'Redirecting…' : effMode === 'deposit' ? `Pay ${money(dep)} deposit` : `Pay ${money(amt)}`}</button>}
      </div>
    </div>
  );
}

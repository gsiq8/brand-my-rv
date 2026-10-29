'use client';
import { useEffect, useState } from 'react';
import { SPOTS, brandAllowed, recommendedSize, isRv, TRUCK_ONLY_MSG, BUILDER_ONLY_MSG } from '@/lib/spots';
import { CONFIG } from '@/lib/config';
import { money } from '@/lib/format';
import { normalizeUrl } from '@/lib/url';
import type { BoardEntry } from '@/lib/types';
import NextImage from 'next/image';


/** Converts any image to a PNG of max 800px. */
function shrinkToPng(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onerror = () => reject(new Error('read'));
    fr.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('image'));
      img.onload = () => {
        const w0 = img.naturalWidth || 800, h0 = img.naturalHeight || 400, k = Math.min(1, 800 / Math.max(w0, h0));
        const c = document.createElement('canvas');
        c.width = Math.max(1, Math.round(w0 * k)); c.height = Math.max(1, Math.round(h0 * k));
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
  const [website, setWebsite] = useState('');
  const [listConsent, setListConsent] = useState(false);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const spot = SPOTS.find((s) => s.id === selected) ?? null;
  const timed = !!spot && isRv(spot);
  const entry = spot ? board[spot.id] : undefined;
  const closed = !!entry && entry.state !== 'open';
  const min = spot ? entry?.min ?? spot.price : 0;
  const amt = Number(amount);
  const period = spot?.period ?? CONFIG.periodLabel;

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
      if (closed) return setErr('This spot has closed. Choose another one.');
      if (!logo) return setErr('Attach your logo.');
      if (!Number.isInteger(amt) || amt < min) return setErr(`Your bid must be a whole number of at least ${money(min)}.`);
      return setStep(2);
    }
    if (step === 2) {
      if (FIELDS.some(([k]) => !c[k].trim())) return setErr('Please fill in all fields.');
      if (!/^\S+@\S+\.\S+$/.test(c.email)) return setErr('Enter a valid email.');
      if ((c.phone.match(/\d/g) ?? []).length < 8) return setErr('Enter a valid phone number.');
      if (spot && !brandAllowed(spot, c.name)) return setErr(spot.builderOnly ? BUILDER_ONLY_MSG : TRUCK_ONLY_MSG);
      if (!normalizeUrl(website)) return setErr('Enter a valid website, e.g. yourbrand.com');
      setStep(3);
    }
  }

  async function pay() {
    if (!spot || !logo) return;
    setBusy(true); setErr('');
    try {
      const r = await fetch('/api/bids', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ spotId: spot.id, amount: amt, logo, website, listConsent, ...c }),
      });
      const j = await r.json();
      if (!r.ok || !j.url) {
        setErr(j.error ?? 'Something went wrong.');
        if (r.status === 400 || r.status === 409) setStep(1);
        setBusy(false);
        return;
      }
      window.location.href = j.url; // Stripe Checkout (card only)
    } catch { setErr('Network error. Please try again.'); setBusy(false); }
  }

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
          <option value="">Choose a spot…</option>
          {SPOTS.map((s) => <option key={s.id} value={s.id}>{s.name} — min {money(board[s.id]?.min ?? s.price)}</option>)}
        </select>
        {spot?.truckOnly && <div className="hint">Reserved for truck brands (Iveco, Mercedes-Benz, Ford, Toyota…). Enter your brand name in the next step.</div>}
        {spot?.builderOnly && <div className="hint">Reserved for builder brands (Newmar, Entegra, Santo Inácio…). Enter your brand name in the next step.</div>}
        {closed && <div className="err">This spot has closed.</div>}
        {spot && (<>
          <label>Your logo (PNG / JPG / SVG)</label>
          <input className="bg-neutral-200 w-20 p-1 rounded-md" type="file" accept="image/*" onChange={(e) => onFile(e.target.files?.[0])} />
          {(() => {
            const r = recommendedSize(spot);
            return <div className="hint">Recommended: {r.w}×{r.h} px ({r.ratio}:1){r.cm ? ` · prints at ≈ ${r.cm}` : ''}.</div>;
          })()}
          {logo && 
          <div className="thumb">
            <NextImage
              width={100}
              height={100} 
              src={logo} 
              alt="Your logo" 
              unoptimized
            />
            <span>Logo attached{timed ? ' – preview is on the motorhome' : ''}</span>
          </div>
          }
          <label>Your bid ({CONFIG.currency.toUpperCase()} / {period})</label>
          <input type="number" min={min} step={CONFIG.bidStep} placeholder={`Min ${min}`} value={amount} onChange={(e) => setAmount(e.target.value)} />
          <div className="hint">
            Minimum: {money(min)}{entry?.leader ? ` (current ${money(entry.leader.amount)} + ${money(CONFIG.bidStep)})` : ' (starting price)'}.
            {timed && ` Your bid goes live once the logo is approved.`}
          </div>
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
        <div>
          <label>Website <span className="hint">(your logo will link here)</span></label>
          <input type="text" inputMode="url" autoCapitalize="off" placeholder="yourbrand.com" value={website} onChange={(e) => setWebsite(e.target.value)} />
        </div>
        <label className="opt">
          <input type="checkbox" checked={listConsent} onChange={(e) => setListConsent(e.target.checked)} />
          <span>Keep me on the bidders list for updates about my bid
            <small>Optional. Bid notifications (outbid, won) are sent either way.</small></span>
        </label>
      </>)}

      {step === 3 && spot && (<>
        <div className="sum"><b>{spot.name}</b><br />Bid {money(amt)} / {period} · {c.name}</div>
        {timed ? (
          <p className="hint">
            We place a card hold for {money(amt)}. Nothing is charged now. The hold is released if you are outbid.
            The spot closes {CONFIG.closeDays} days after the first hold. If you win, you receive the contract and invoice and pay by wire within {CONFIG.wireHours} hours.
          </p>
        ) : (
          <p className="hint">One-time payment of {money(amt)}, charged now. Non-refundable. Refunded only if we refuse the logo.</p>
        )}
      </>)}

      {err && <div className="err">{err}</div>}
      <div className="row">
        {step > 1 && <button className="btn" onClick={() => { setErr(''); setStep(step - 1); }} disabled={busy}>← Back</button>}
        {step < 3
          ? <button className="btn pri" onClick={next} disabled={!spot || closed}>Next →</button>
          : <button className="btn pri" onClick={pay} disabled={busy}>
              {busy ? 'Redirecting…' : timed ? 'Place card hold' : `Pay ${money(amt)}`}
            </button>}
      </div>
    </div>
  );
}
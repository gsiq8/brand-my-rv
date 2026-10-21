'use client';
import { useState } from 'react';

type Row = {
  id: string; spot_id: string; display_name: string; amount: number; currency: string; status: string;
  logo_approved: boolean; logoUrl: string | null; website: string | null;
  bidders: { name: string; phone: string; email: string; address: string; tax_id: string } | null;
};
type Act = 'logo-check' | 'cancel' | 'settle';

const DONE: Record<Act, string> = {
  'logo-check': 'Logo approved.',
  cancel: 'Refused. Hold released or payment refunded.',
  settle: 'Settled. Hold released, spot sold.',
};

export default function Admin() {
  const [secret, setSecret] = useState('');
  const [rows, setRows] = useState<Row[] | null>(null);
  const [msg, setMsg] = useState('');
  const h = { 'x-admin-secret': secret };

  async function load() {
    const r = await fetch('/api/admin/bids', { headers: h });
    if (!r.ok) { setMsg('Wrong secret or server error.'); return; }
    setRows((await r.json()).bids); setMsg('');
  }

  async function act(id: string, what: Act) {
    const who = rows?.find((r) => r.id === id)?.display_name ?? 'this bid';
    if (what === 'cancel' && !confirm(`Refuse ${who}? Its hold is released. This cannot be undone.`)) return;
    if (what === 'settle' && !confirm(`Mark ${who} as paid by wire? This releases the card hold and sells the spot.`)) return;
    const r = await fetch(`/api/admin/bids/${id}/${what}`, { method: 'POST', headers: h });
    const j = await r.json().catch(() => ({}));
    setMsg(r.ok ? DONE[what] : 'Failed: ' + (j.error ?? r.status));
    load();
  }

  return (
    <main style={{ maxWidth: 820, margin: '40px auto', padding: 16, fontFamily: 'system-ui' }}>
      <h1>Bids admin</h1>
      <input type="password" placeholder="Admin secret" value={secret} onChange={(e) => setSecret(e.target.value)} style={{ padding: 8, marginRight: 8 }} />
      <button onClick={load}>Load bids</button> <span>{msg}</span>

      {rows?.map((b) => {
        const canRefuse = ['awaiting_payment', 'review', 'paid'].includes(b.status);
        const canApprove = (b.status === 'review' || b.status === 'paid') && !b.logo_approved;
        return (
          <div key={b.id} style={{ border: '1px solid #ccc', borderRadius: 8, padding: 12, marginTop: 12 }}>
            <b>{b.spot_id}</b> · {b.display_name} · bid {b.amount} {b.currency.toUpperCase()} · <i>{b.status}</i>
            {b.status !== 'awaiting_payment' && (
              <b style={{ marginLeft: 8, color: b.logo_approved ? 'green' : '#c60' }}>
                {b.logo_approved ? 'logo approved' : 'LOGO NEEDS APPROVAL'}
              </b>
            )}
            {b.bidders && (
              <div style={{ fontSize: 13, margin: '6px 0' }}>
                {b.bidders.name} · <a href={`tel:${b.bidders.phone}`}>{b.bidders.phone}</a> · <a href={`mailto:${b.bidders.email}`}>{b.bidders.email}</a>
                <br />{b.bidders.address} · ID {b.bidders.tax_id}
                {b.website && <><br /><a href={b.website} target="_blank" rel="noopener noreferrer">{b.website}</a></>}
              </div>
            )}
            {b.logoUrl && <img src={b.logoUrl} alt="uploaded logo" style={{ maxHeight: 120, maxWidth: 280, background: '#eee', margin: '6px 0', display: 'block' }} />}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {canApprove && <button className="bg-blue-200 rounded-md px-3 py-1" onClick={() => act(b.id, 'logo-check')}>Approve logo</button>}
              {b.status === 'won' && <button className="bg-green-100 rounded-md px-3 py-1" onClick={() => act(b.id, 'settle')}>Wire received</button>}
              {canRefuse && <button className="bg-red-100 rounded-md px-3 py-1" onClick={() => act(b.id, 'cancel')}>Refuse / release hold</button>}
            </div>
          </div>
        );
      })}
      {rows?.length === 0 && <p>No open bids.</p>}
    </main>
  );
}
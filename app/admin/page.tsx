'use client';
import { useState } from 'react';

type Row = {
  id: string; spot_id: string; display_name: string; amount: number; deposit: number; currency: string; status: string;
  logo_approved: boolean; logoUrl: string | null; website: string | null;
  bidders: { name: string; phone: string; email: string; address: string; tax_id: string } | null;
};
type Act = 'mark-paid' | 'invoice' | 'cancel' | 'logo-check';

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
    if (what === 'mark-paid' && !confirm(`Mark ${who} as paid? (the logo goes live only if it is approved)`)) return;
    if (what === 'cancel' && !confirm(`Cancel the bid from ${who} and refund it now? This cannot be undone.`)) return;

    const r = await fetch(`/api/admin/bids/${id}/${what}`, { method: 'POST', headers: h });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) setMsg('Failed: ' + (j.error ?? r.status));
    else if (what === 'cancel') setMsg(`Cancelled. Refunded ${j.refunded} via Stripe.` + (j.manualRefundDue ? ` YOU STILL OWE ${j.manualRefundDue} outside Stripe.` : ''));
    else setMsg({ 'mark-paid': 'Marked as paid.', invoice: 'Invoice sent.', 'logo-check': 'Logo approved.' }[what]);
    load();
  }

  return (
    <main style={{ maxWidth: 820, margin: '40px auto', padding: 16, fontFamily: 'system-ui' }}>
      <h1>Bids admin</h1>
      <input type="password" placeholder="Admin secret" value={secret} onChange={(e) => setSecret(e.target.value)} style={{ padding: 8, marginRight: 8 }} />
      <button onClick={load}>Load bids</button> <span>{msg}</span>
      {rows?.map((b) => {
        const paid = b.status !== 'awaiting_payment';
        return (
          <div key={b.id} style={{ border: '1px solid #ccc', borderRadius: 8, padding: 12, marginTop: 12 }}>
            <b>{b.spot_id}</b> · {b.display_name} · bid {b.amount} {b.currency.toUpperCase()} (deposit {b.deposit}) · <i>{b.status}</i>
            {paid && <b style={{ marginLeft: 8, color: b.logo_approved ? 'green' : '#c60' }}>{b.logo_approved ? 'logo approved' : 'LOGO NEEDS APPROVAL'}</b>}
            {b.bidders && (
              <div style={{ fontSize: 13, margin: '6px 0' }}>
                {b.bidders.name} · <a href={`tel:${b.bidders.phone}`}>{b.bidders.phone}</a> · <a href={`mailto:${b.bidders.email}`}>{b.bidders.email}</a>
                <br />{b.bidders.address} · ID {b.bidders.tax_id}
                {b.website && <><br /><a href={b.website} target="_blank" rel="noopener noreferrer">{b.website}</a></>}
              </div>
            )}
            {b.logoUrl && <img src={b.logoUrl} alt="uploaded logo" style={{ maxHeight: 120, maxWidth: 280, background: '#eee', margin: '6px 0', display: 'block' }} />}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {paid && !b.logo_approved && <button className="bg-blue-200 rounded-md px-3 py-1" onClick={() => act(b.id, 'logo-check')}>Approve logo</button>}
              {b.status === 'pending_offer' && <button className="bg-yellow-200 rounded-md px-3 py-1" onClick={() => act(b.id, 'invoice')} disabled={b.amount <= b.deposit}>Send balance invoice</button>}
              {(b.status === 'pending_offer' || b.status === 'invoiced') && <button className="bg-green-100 rounded-md px-3 py-1" onClick={() => act(b.id, 'mark-paid')}>Mark paid (collected)</button>}
              <button className="bg-red-100 rounded-md px-3 py-1" onClick={() => act(b.id, 'cancel')}>{paid ? 'Refuse / cancel + refund' : 'Cancel bid'}</button>
            </div>
          </div>
        );
      })}
      {rows?.length === 0 && <p>No open bids.</p>}
    </main>
  );
}
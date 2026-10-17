'use client';
import { useState } from 'react';

type Row = {
  id: string; spot_id: string; display_name: string; amount: number; deposit: number; currency: string; status: string;
  bidders: { name: string; phone: string; email: string; address: string; tax_id: string } | null;
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
  async function act(id: string, what: 'mark-paid' | 'invoice' | 'cancel') {
  const messages = {
    'mark-paid': 'Marked as paid – logo is live.',
    invoice: 'Invoice sent.',
    cancel: 'Bid cancelled.',
  };
  const who = rows?.find((r) => r.id === id)?.display_name ?? 'this bid';
  if (what === 'mark-paid' && !confirm(`Mark ${who} as paid and publish the logo?`)) return;
  if (what === 'cancel' && !confirm(`Cancel the bid from ${who}? This cannot be undone.`)) return;

  const r = await fetch(`/api/admin/bids/${id}/${what}`, { method: 'POST', headers: h });
  setMsg(r.ok ? messages[what] : 'Failed: ' + (await r.text()));
  load();
}

  return (
    <main style={{ maxWidth: 820, margin: '40px auto', padding: 16, fontFamily: 'system-ui' }}>
      <h1>Bids admin</h1>
      <input type="password" placeholder="Admin secret" value={secret} onChange={(e) => setSecret(e.target.value)} style={{ padding: 8, marginRight: 8 }} />
      <button onClick={load}>Load bids</button> <span>{msg}</span>
      {rows?.map((b) => (
        <div key={b.id} style={{ border: '1px solid #ccc', borderRadius: 8, padding: 12, marginTop: 12 }}>
          <b>{b.spot_id}</b> · {b.display_name} · bid {b.amount} {b.currency.toUpperCase()} (deposit {b.deposit}) · <i>{b.status}</i>
          {b.bidders && (
            <div style={{ fontSize: 13, margin: '6px 0' }}>
              {b.bidders.name} · <a href={`tel:${b.bidders.phone}`}>{b.bidders.phone}</a> · <a href={`mailto:${b.bidders.email}`}>{b.bidders.email}</a>
              <br />{b.bidders.address} · ID {b.bidders.tax_id}
            </div>
          )}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {b.status !== 'awaiting_payment' && <>
              <button className="bg-yellow-200 rounded-md px-3 py-1" onClick={() => act(b.id, 'invoice')} disabled={b.status === 'invoiced' || b.amount <= b.deposit}>Send balance invoice</button>
              <button className="bg-green-100 rounded-md px-3 py-1" onClick={() => act(b.id, 'mark-paid')}>Mark paid (collected)</button>
            </>}
            <button className="bg-red-100 rounded-md px-3 py-1" onClick={() => act(b.id, 'cancel')}>Cancel bid</button>
          </div>
        </div>
      ))}
      {rows?.length === 0 && <p>No open bids.</p>}
    </main>
  );
}

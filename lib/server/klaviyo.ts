const API = 'https://a.klaviyo.com/api';
const headers = (key: string) => ({ Authorization: `Klaviyo-API-Key ${key}`, revision: '2026-10-15', 'Content-Type': 'application/json', Accept: 'application/json' });
const post = (key: string, path: string, body: unknown) =>
  fetch(`${API}${path}`, { method: 'POST', headers: headers(key), body: JSON.stringify(body), signal: AbortSignal.timeout(8000) });

/** Sends an event to Klaviyo; a Flow triggered by that metric sends the email. Never throws. */
export async function klaviyoTrack(
  email: string | undefined, metric: 'Bid Placed' | 'Bid Outbid', properties: Record<string, unknown>, uniqueId: string,
) {
  const key = process.env.KLAVIYO_PRIVATE_KEY;
  if (!key || !email) return;
  try {
    const r = await post(key, '/events', { data: { type: 'event', attributes: {
      properties, unique_id: uniqueId,   // unique_id: Stripe webhook retries don't send twice
      metric: { data: { type: 'metric', attributes: { name: metric } } },
      profile: { data: { type: 'profile', attributes: { email } } },
    } } });
    if (!r.ok) console.error('klaviyo event failed', r.status, await r.text());
  } catch (e) { console.error('klaviyo event failed', e); }
}

/** Creates/updates the profile and adds it to the bidders list. Does NOT subscribe them to marketing. Never throws. */
export async function klaviyoAddToList(email: string | undefined, brand: string) {
  const key = process.env.KLAVIYO_PRIVATE_KEY;
  if (!key || !email) return;
  try {
    const p = await post(key, '/profile-import/', { data: { type: 'profile', attributes: { email, organization: brand } } });
    if (!p.ok) { console.error('klaviyo profile failed', p.status, await p.text()); return; }
    const id = (await p.json()).data.id;
    const l = await post(key, `/lists/${process.env.KLAVIYO_LIST_ID ?? 'SwA7fj'}/relationships/profiles/`, { data: [{ type: 'profile', id }] });
    if (!l.ok) console.error('klaviyo list failed', l.status, await l.text());
  } catch (e) { console.error('klaviyo list failed', e); }
}
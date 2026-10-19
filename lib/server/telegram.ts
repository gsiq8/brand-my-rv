import { db } from './supabase';

/** t.me deep link. Bidder taps Start -> /api/telegram saves their chat id. Empty if the bot isn't configured. */
export const tgLink = (bidId: string) =>
  process.env.TELEGRAM_BOT_USERNAME ? `https://t.me/${process.env.TELEGRAM_BOT_USERNAME}?start=${bidId}` : '';

export async function tgSend(chatId: string | number, text: string) {
  const r = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text }), signal: AbortSignal.timeout(8000),
  });
  if (!r.ok) console.error('telegram failed', r.status, await r.text());
}

/** Message a bidder, only if they pressed Start on the bot (matched by email). Never throws. */
export async function notifyBidder(email: string | undefined, text: string) {
  if (!email || !process.env.TELEGRAM_BOT_TOKEN) return;
  try {
    const { data } = await db().from('bidders').select('telegram_chat_id').eq('email', email).not('telegram_chat_id', 'is', null).limit(1);
    const id = data?.[0]?.telegram_chat_id;
    if (id) await tgSend(id, text);
  } catch (e) { console.error('telegram bidder failed', e); }
}
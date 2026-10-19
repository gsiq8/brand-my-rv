import { NextResponse } from 'next/server';
import { db } from '@/lib/server/supabase';
import { tgSend } from '@/lib/server/telegram';

export const runtime = 'nodejs';

// Telegram webhook. A bot can only message people who started it, so the success page links to
// t.me/<bot>?start=<bid id>; this saves the chat id on that bid's bidder.
export async function POST(req: Request) {
  if (req.headers.get('x-telegram-bot-api-secret-token') !== process.env.TELEGRAM_WEBHOOK_SECRET)
    return new NextResponse('Unauthorized', { status: 401 });
  const m = (await req.json().catch(() => ({})))?.message;
  const bidId = /^\/start\s+([0-9a-f-]{36})$/i.exec(m?.text ?? '')?.[1];
  if (bidId && m?.chat?.id) {
    const { data: bid } = await db().from('bids').select('bidder_id').eq('id', bidId).single();
    if (bid) {
      await db().from('bidders').update({ telegram_chat_id: String(m.chat.id) }).eq('id', bid.bidder_id);
      await tgSend(m.chat.id, 'Connected. I will message you here about your bid.');
    }
  }
  return NextResponse.json({ ok: true });   // always 200 so Telegram doesn't retry
}
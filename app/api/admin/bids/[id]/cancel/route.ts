import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/server/admin';
import { cancelBid } from '@/lib/server/auction';

// Refuses a bid: cancels the hold (or refunds the Strip payment). Live bids that were outbid stay outbid.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdmin(req)) return new NextResponse('Unauthorized', { status: 401 });
  const { id } = await params;
  try {
    await cancelBid(id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('cancel failed', e);
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 400 });
  }
}
import { NextResponse } from 'next/server';
import { SPOTS } from '@/lib/spots';
import { minBidFor } from '@/lib/pricing';
import { logoUrl, pendingCounts, topBids } from '@/lib/server/bids';
import type { BoardEntry } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [top, pend] = await Promise.all([topBids(), pendingCounts()]);
    const board: BoardEntry[] = SPOTS.map((s) => {
      const t = top[s.id];
      return {
        spotId: s.id,
        min: minBidFor(s, t ? t.amount : null),
        pending: pend[s.id] ?? 0,
        leader: t ? { name: t.name, amount: t.amount, logoUrl: t.logoPath ? logoUrl(t.logoPath) : null } : null,
      };
    });
    return NextResponse.json({ board });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Could not load the board' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { SPOTS, isRv } from '@/lib/spots';
import { minBidFor } from '@/lib/pricing';
import { db } from '@/lib/server/supabase';
import { logoUrl } from '@/lib/server/bids';
import type { BoardEntry, BoardResponse, HistoryItem } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  const { data, error } = await db().from('bids')
    .select('id, spot_id, display_name, amount, status, created_at, logo_path')
    .in('status', ['paid', 'pending_offer', 'invoiced'])
    .order('created_at', { ascending: false }).limit(1000);
  if (error) { console.error(error); return NextResponse.json({ error: 'Could not load the board' }, { status: 500 }); }
  const rows = data ?? [];

  const board: BoardEntry[] = SPOTS.map((s) => {
    const mine = rows.filter((r) => r.spot_id === s.id);
    const top = mine.filter((r) => r.status === 'paid').sort((a, b) => b.amount - a.amount)[0];
    return {
      spotId: s.id,
      min: minBidFor(s, top ? top.amount : null),
      bids: mine.length,
      pending: mine.filter((r) => r.status !== 'paid').length,
      leader: top ? { name: top.display_name, amount: top.amount, logoUrl: top.logo_path ? logoUrl(top.logo_path) : null } : null,
    };
  });
  const rvIds = new Set(SPOTS.filter(isRv).map((s) => s.id));
  const rvBoard = board.filter((e) => rvIds.has(e.spotId));
  const history: HistoryItem[] = rows.slice(0, 300).map((r) => ({
    id: r.id, spotId: r.spot_id, name: r.display_name, amount: r.amount, status: r.status, at: r.created_at,
    logoUrl: r.status === 'paid' && r.logo_path ? logoUrl(r.logo_path) : null,
  }));
  const res: BoardResponse = {
    board, history,
    stats: { raised: rvBoard.reduce((n, e) => n + (e.leader?.amount ?? 0), 0), bids: rows.length, taken: rvBoard.filter((e) => e.leader).length, total: rvBoard.length },
  };
  return NextResponse.json(res);
}

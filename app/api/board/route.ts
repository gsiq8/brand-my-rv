import { NextResponse } from 'next/server';
import { SPOTS, isRv } from '@/lib/spots';
import { minBidFor } from '@/lib/pricing';
import { db } from '@/lib/server/supabase';
import { logoUrl } from '@/lib/server/auction';
import type { BoardEntry, BoardResponse, HistoryItem, SpotState } from '@/lib/types';
import { closeDueAuctions } from '@/lib/server/auction';
import { CONFIG } from '@/lib/config';




export const dynamic = 'force-dynamic';

const LIVE = ['paid'];                                    // live bids set the price
const HOLDERS = ['paid', 'won', 'settled'];               // who is shown on the spot
const HISTORY = ['paid', 'outbid', 'won', 'settled', 'defaulted', 'review'];
const SHOWN = ['paid', 'outbid', 'won', 'settled', 'defaulted'];

export async function GET() {
  try { await closeDueAuctions(); } catch (e) { console.error('lazy close', e); }
  const [bidsRes, auctionsRes] = await Promise.all([
    db().from('bids')
      .select('id, spot_id, display_name, amount, status, created_at, logo_path, website')
      .in('status', HISTORY).order('created_at', { ascending: false }).limit(1000),
    db().from('spot_auctions').select('spot_id, status, closes_at'),
  ]);
  if (bidsRes.error || auctionsRes.error) {
    console.error(bidsRes.error ?? auctionsRes.error);
    return NextResponse.json({ error: 'Could not load the board' }, { status: 500 });
  }
  const rows = bidsRes.data ?? [];
  const auctions = new Map((auctionsRes.data ?? []).map((a) => [a.spot_id, a]));
  const byAmount = (a: (typeof rows)[number], b: (typeof rows)[number]) =>
    b.amount - a.amount || +new Date(a.created_at) - +new Date(b.created_at);

  const board: BoardEntry[] = SPOTS.map((s) => {
    const mine = rows.filter((r) => r.spot_id === s.id);
    const live = mine.filter((r) => LIVE.includes(r.status)).sort(byAmount);
    const holders = mine.filter((r) => HOLDERS.includes(r.status)).sort(byAmount);
    const top = holders[0];
    const a = auctions.get(s.id);
    return {
      spotId: s.id,
      min: minBidFor(s, live[0]?.amount ?? null),
      bids: mine.length,
      pending: mine.filter((r) => r.status === 'review').length,
      state: ((a?.status as SpotState) ?? 'open'),
      closesAt: a?.closes_at ?? null,
      leader: top
        ? { name: top.display_name, amount: top.amount, logoUrl: top.logo_path ? logoUrl(top.logo_path) : null, website: top.website ?? null }
        : null,
    };
  });

  const rvIds = new Set(SPOTS.filter(isRv).map((s) => s.id));
  const rvBoard = board.filter((e) => rvIds.has(e.spotId));
  const history: HistoryItem[] = rows.slice(0, 300).map((r) => {
  const shown = SHOWN.includes(r.status);
  const charged =
    r.status === 'settled' ? r.amount
    : r.status === 'defaulted' ? Math.round((r.amount * CONFIG.defaultPercent) / 100)
    : null;
  return {
    id: r.id, spotId: r.spot_id, name: r.display_name, amount: r.amount, status: r.status, at: r.created_at,
    logoUrl: shown && r.logo_path ? logoUrl(r.logo_path) : null,
    website: shown ? r.website ?? null : null,
    charged,
  };
});

  const res: BoardResponse = {
    board, history,
    stats: {
      raised: rvBoard.reduce((n, e) => n + (e.leader?.amount ?? 0), 0),
      bids: rows.length,
      taken: rvBoard.filter((e) => e.leader).length,
      total: rvBoard.length,
    },
  };
  return NextResponse.json(res);
}
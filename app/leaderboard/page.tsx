'use client';
import { useEffect, useMemo, useState } from 'react';
import { SPOTS } from '@/lib/spots';
import { COPY } from '@/lib/site';
import { money } from '@/lib/format';
import { cornerHolders } from '@/lib/corner';
import BrandLink from '@/components/BrandLink';
import GlassCard from '@/components/GlassCard';
import Medal from '@/components/Medal';
import TopStrip from '@/components/TopStrip';
import BidDrawer from '@/components/BidDrawer';
import type { BoardEntry, BoardResponse, HistoryItem } from '@/lib/types';

type Tab = 'biggest' | 'most' | 'outbid' | 'newest';
type Row = { key: string; name: string; logoUrl: string | null; website: string | null; big: string; sub: string; live: boolean };
const TABS: [Tab, string, string][] = [
  ['biggest', 'Biggest bids', 'Every paid bid, highest first.'],
  ['most', 'Most bids', 'Brands ranked by how many paid bids they placed.'],
  ['outbid', 'Most outbid', 'Brands that lost the most spots to a higher bid.'],
  ['newest', 'Newest first', 'Every paid bid, latest first.'],
];
const LIVE_LIKE = ['paid', 'outbid', 'won', 'settled', 'defaulted']; // bids that were placed and approved


export default function Leaderboard() {

  const [d, setD] = useState<BoardResponse | null>(null);
  const [tab, setTab] = useState<Tab>('biggest');
  const [selected, setSelected] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  useEffect(() => { fetch('/api/board', { cache: 'no-store' }).then((r) => r.json()).then(setD).catch(() => {}); }, []);

  const board = useMemo<Record<string, BoardEntry>>(() => Object.fromEntries((d?.board ?? []).map((e) => [e.spotId, e])), [d]);
  const hasCorner = cornerHolders(d?.history ?? []).some((h) => h.current);


  const { rows, bids, brands } = useMemo(() => {
    const paid = (d?.history ?? []).filter((h) => LIVE_LIKE.includes(h.status));    const leaders = new Map((d?.board ?? []).map((e) => [e.spotId, e.leader]));
    const live = (h: HistoryItem) => { const l = leaders.get(h.spotId); return !!l && l.amount === h.amount && l.name === h.name; };
    const spot = (id: string) => SPOTS.find((s) => s.id === id)?.name ?? id;
    const day = (iso: string) => new Date(iso).toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
    const bidRow = (h: HistoryItem): Row => ({
      key: h.id, name: h.name, logoUrl: h.logoUrl, website: h.website,
      big: money(h.amount), sub: `${spot(h.spotId)} · ${day(h.at)}`, live: live(h),
    });

    // Per brand (history is newest first, so the first bid seen carries the latest logo).
    const byBrand = new Map<string, { name: string; logoUrl: string | null; website: string | null; bids: number; outbid: number; best: number }>();
    for (const h of paid) {
      const k = h.name.trim().toLowerCase();
      const b = byBrand.get(k) ?? { name: h.name, logoUrl: h.logoUrl, website: h.website, bids: 0, outbid: 0, best: 0 };
      b.bids++; if (!live(h)) b.outbid++; b.best = Math.max(b.best, h.amount);
      byBrand.set(k, b);
    }

    let rows: Row[];
    if (tab === 'biggest') rows = [...paid].sort((a, b) => b.amount - a.amount).map(bidRow);
    else if (tab === 'newest') rows = [...paid].sort((a, b) => +new Date(b.at) - +new Date(a.at)).map(bidRow);
    else {
      const most = tab === 'most', n = (v: number) => `${v} bid${v === 1 ? '' : 's'}`;
      rows = [...byBrand.entries()]
        .filter(([, b]) => most || b.outbid > 0)
        .sort(([, a], [, b]) => (most ? b.bids - a.bids : b.outbid - a.outbid) || b.best - a.best)
        .map(([k, b]) => ({
          key: k, name: b.name, logoUrl: b.logoUrl, website: b.website, live: false,
          big: most ? n(b.bids) : `${b.outbid}× outbid`, sub: most ? `best ${money(b.best)}` : `of ${n(b.bids)}`,
        }));
    }
    return { rows, bids: paid.length, brands: byBrand.size };
  }, [d, tab]);

  const ranked = tab !== 'newest';                 // medals and a podium only make sense for rankings
  const podium = ranked ? rows.slice(0, 3) : [];
  const rest = ranked ? rows.slice(3) : rows;

  return (
    <div className="lb-bg">
      {hasCorner && <div className="strip-spacer" aria-hidden="true" />}
      <main className="wrap card-sec">
        <a href="/">← {COPY.name}</a>
        <div className="muted small" style={{ marginTop: 28 }}>Every paid bid, ever</div>
        <h1 style={{ marginTop: 8 }}>Leaderboard</h1>
        <p className="lead">{bids} paid bid{bids === 1 ? '' : 's'} from {brands} brand{brands === 1 ? '' : 's'}. Even if you get outbid, you stay visible here.</p>

        <div className="seg max-w-full overflow-x-auto" role="tablist" aria-label="Ranking" style={{ marginTop: 24 }}>
          {TABS.map(([k, label]) => <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{label}</button>)}
        </div>
        <p className="muted small" style={{ margin: 0 }}>{TABS.find(([k]) => k === tab)![2]}</p>

        {!d && <p className="muted" style={{ marginTop: 40 }}>Loading…</p>}
        {d && rows.length === 0 && <p className="muted" style={{ marginTop: 40 }}>No paid bids yet.</p>}

        {podium.length > 0 && (
          <div className="podium">
            {podium.map((r, i) => (
              <GlassCard key={r.key} className={`p${i + 1}`}>
                <Medal rank={i + 1} size={i === 0 ? 40 : 34} className="absolute right-4 top-4" />
                <div className="flex h-12 items-center">
                  {r.logoUrl
                    ? <BrandLink href={r.website}><img src={r.logoUrl} alt={r.name} className="max-h-12 max-w-[140px] object-contain" /></BrandLink>
                    : <span className="av">{r.name.slice(0, 1).toUpperCase()}</span>}
                </div>
                <div className="mt-4 text-[17px] font-medium"><BrandLink href={r.website}>{r.name}</BrandLink></div>
                <div className={`font-bold tracking-tight ${i === 0 ? 'text-4xl' : 'text-3xl'}`}>{r.big}</div>
                {r.live && <div className="text-[13px] font-medium text-[var(--ok)]">Still live</div>}
                <div className="text-[13px] text-[var(--dg)]">{r.sub}</div>
              </GlassCard>
            ))}
          </div>
        )}

        {podium.length > 0 && <p className="muted small" style={{ textAlign: 'center', margin: '24px 0 0' }}>Want to be on this board? <a href="/#spots" style={{ color: '#2563eb' }}>Take a spot →</a></p>}

        {rest.length > 0 && (<>
          {ranked && <div className="muted small" style={{ margin: '40px 0 12px', letterSpacing: '.06em', textTransform: 'uppercase', fontWeight: 600 }}>The rest of the field</div>}
          <div className="card" style={{ marginTop: ranked ? 0 : 24 }}>
            {rest.map((r, i) => (
              <div key={r.key} className="grid grid-cols-[28px_64px_1fr_auto] items-center gap-4 border-b border-[var(--bd)] px-6 py-3 last:border-0 max-[760px]:grid-cols-[24px_48px_1fr_auto] max-[760px]:px-4">
                <span className="text-center text-[14px] text-[var(--mu)]">{ranked ? i + 4 : ''}</span>
                <div className="flex h-9 w-full items-center justify-center">
                  {r.logoUrl
                    ? <BrandLink href={r.website}><img src={r.logoUrl} alt={r.name} className="max-h-9 max-w-full object-contain" /></BrandLink>
                    : <span className="av">{r.name.slice(0, 1).toUpperCase()}</span>}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-[15px] font-medium"><BrandLink href={r.website}>{r.name}</BrandLink></div>
                  <div className="muted small truncate">{r.sub}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold">{r.big}</div>
                  {r.live && <div className="text-[12px] text-[var(--ok)]">live</div>}
                </div>
              </div>
            ))}
          </div>
        </>)}
      </main>
      <TopStrip top={0} items={d?.history ?? []} entry={board['corner']} onClaim={() => { setSelected('corner'); setOpen(true); }} />
      {open && <BidDrawer board={board} selected={selected} onSelect={setSelected} onDraft={() => {}} onClose={() => setOpen(false)} />}
    </div>
  );
}
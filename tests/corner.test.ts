import { describe, expect, it } from 'vitest';
import { cornerHolders } from '@/lib/corner';
import type { HistoryItem } from '@/lib/types';

const item = (id: string, status: string, at: string): HistoryItem =>
  ({ id, spotId: 'corner', name: id, amount: 100, status, at, logoUrl: null, website: null });

describe('cornerHolders', () => {
  const items = [
    item('a', 'paid', '2026-10-20T10:00:00Z'),
    item('b', 'outbid', '2026-10-20T11:00:00Z'),
    item('c', 'paid', '2026-10-20T12:00:00Z'),
    item('x', 'review', '2026-10-20T12:30:00Z'),   // not yet live: not listed
  ];
  const holders = cornerHolders(items, Date.parse('2026-10-20T13:00:00Z'));

  it('lists the newest holder first and skips bids under review', () => {
    expect(holders.map((h) => h.item.id)).toEqual(['c', 'b', 'a']);
  });
  it('marks only the newest paid holder as current', () => {
    expect(holders.map((h) => h.current)).toEqual([true, false, false]);
  });
  it('measures how long each person held the strip', () => {
    expect(holders[0].heldMs).toBe(60 * 60 * 1000);
    expect(holders[2].heldMs).toBe(60 * 60 * 1000);
  });
});
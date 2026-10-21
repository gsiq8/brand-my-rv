import type { HistoryItem } from './types';

// Strip purchases are charged at checkout, so every paid one counts as a holder, even after being outbid.
const HELD = ['paid', 'outbid'];

/** People who held the strip, newest first, with how long each held it. */
export function cornerHolders(items: HistoryItem[], now = Date.now()) {
  const held = items
    .filter((x) => x.spotId === 'corner' && HELD.includes(x.status))
    .sort((a, b) => +new Date(a.at) - +new Date(b.at));
  return held
    .map((item, i) => ({
      item,
      heldMs: (i + 1 < held.length ? +new Date(held[i + 1].at) : now) - +new Date(item.at),
      current: i === held.length - 1 && item.status === 'paid',
    }))
    .reverse();
}

export const heldFor = (ms: number) => {
  const m = Math.round(ms / 60000);
  if (m < 60) return `${Math.max(m, 1)}m`;
  const h = Math.round(m / 60);
  return h < 48 ? `${h}h` : `${Math.round(h / 24)}d`;
};
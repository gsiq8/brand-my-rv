import type { HistoryItem } from './types';

/** People who held "the corner", newest first, with how long each held it. */
export function cornerHolders(items: HistoryItem[], now = Date.now()) {
  const paid = items.filter((x) => x.spotId === 'corner' && x.status === 'paid').sort((a, b) => +new Date(a.at) - +new Date(b.at));
  return paid
    .map((item, i) => ({ item, heldMs: (i + 1 < paid.length ? +new Date(paid[i + 1].at) : now) - +new Date(item.at), current: i === paid.length - 1 }))
    .reverse();
}
export const heldFor = (ms: number) => {
  const m = Math.round(ms / 60000);
  if (m < 60) return `${Math.max(m, 1)}m`;
  const h = Math.round(m / 60);
  return h < 48 ? `${h}h` : `${Math.round(h / 24)}d`;
};

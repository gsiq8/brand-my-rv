import type { HistoryItem } from './types';
import { SPOTS, isRv, type RvSpot } from './spots';

export type ReplayEvent = {
  index: number;
  spotId: string;
  name: string;
  logoUrl: string | null;
  amount: number;
  at: string;
};

/** Bids that reached a real outcome, oldest first. `won` is excluded: the winner hasn't wired yet. */
export const REPLAY_STATUSES = ['paid', 'outbid', 'settled', 'defaulted'];

export function buildEvents(history: HistoryItem[]): ReplayEvent[] {
  return history
    .filter((h) => REPLAY_STATUSES.includes(h.status) && SPOTS.some((s) => s.id === h.spotId && isRv(s)))
    .sort((a, b) => +new Date(a.at) - +new Date(b.at))
    .map((h, index) => ({
      index, spotId: h.spotId, name: h.name, logoUrl: h.logoUrl, amount: h.amount, at: h.at,
    }));
}

/** Who holds each spot after event `i` (inclusive). A later higher bid replaces an earlier one. */
export function stateAt(events: ReplayEvent[], i: number): Record<string, ReplayEvent> {
  const out: Record<string, ReplayEvent> = {};
  for (let k = 0; k <= i && k < events.length; k++) {
    const e = events[k];
    const cur = out[e.spotId];
    if (!cur || e.amount >= cur.amount) out[e.spotId] = e;
  }
  return out;
}

export const rvSpot = (id: string) => SPOTS.find((s) => s.id === id && isRv(s)) as RvSpot | undefined;
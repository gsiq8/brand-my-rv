import { CONFIG } from './config';
import type { SpotDef } from './spots';

/** Minimum acceptable bid: starting price, or top paid bid + step. */
export const minBidFor = (spot: SpotDef, topAmount: number | null) =>
  topAmount == null ? spot.price : topAmount + CONFIG.bidStep;

/** Deposit charged when the bidder reserves with an offer. Never more than the bid itself. */
export const depositFor = (amount: number) =>
  Math.min(amount, Math.max(CONFIG.depositFixed, Math.round((amount * CONFIG.depositPercent) / 100)));

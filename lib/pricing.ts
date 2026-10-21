import { CONFIG } from './config';
import type { SpotDef } from './spots';

/** Minimum acceptable bid: starting price, or live top bid + step. */
export const minBidFor = (spot: SpotDef, topAmount: number | null) =>
  topAmount == null ? spot.price : topAmount + CONFIG.bidStep;

/** Media fee in cents, taken from a won bid whose wire was not received in time. */
export const defaultCaptureCents = (amount: number, percent = CONFIG.defaultPercent) =>
  Math.round(amount * percent); // amount is in whole units: 10% of 1100 = 110 = 11000 cents

/** When a spot closes, counted from the first confirmed hold. */
export const closeAt = (from: Date, days = CONFIG.closeDays) =>
  new Date(from.getTime() + days * 864e5);
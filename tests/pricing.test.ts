import { describe, expect, it } from 'vitest';
import { minBidFor, defaultCaptureCents, closeAt } from '@/lib/pricing';
import type { SpotDef } from '@/lib/spots';

const spot = { id: 'R1', price: 1000 } as SpotDef;

describe('minBidFor', () => {
  it('starts at the starting price when nobody is live', () => {
    expect(minBidFor(spot, null)).toBe(1000);
  });
  it('needs a full step above the live bid', () => {
    expect(minBidFor(spot, 1000)).toBe(1100);
  });
});

describe('defaultCaptureCents', () => {
  it('takes 10% of the bid, in cents', () => {
    expect(defaultCaptureCents(1100, 10)).toBe(11000);
  });
});

describe('closeAt', () => {
  it('closes five days after the first hold', () => {
    expect(closeAt(new Date('2026-10-20T00:00:00Z'), 5).toISOString()).toBe('2026-10-25T00:00:00.000Z');
  });
});
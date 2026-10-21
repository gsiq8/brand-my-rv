import { describe, expect, it } from 'vitest';
import { SPOTS, brandAllowed } from '@/lib/spots';

const spot = (id: string) => SPOTS.find((s) => s.id === id)!;

describe('brandAllowed', () => {
  it('lets truck brands onto the chassis spot', () => {
    expect(brandAllowed(spot('F1'), 'Iveco Brasil')).toBe(true);
  });
  it('blocks other brands from the chassis spot', () => {
    expect(brandAllowed(spot('F1'), 'Acme Foods')).toBe(false);
  });
  it('lets builder brands onto the builder spot', () => {
    expect(brandAllowed(spot('F2'), 'Newmar Corp')).toBe(true);
  });
  it('leaves ordinary spots open to anyone', () => {
    expect(brandAllowed(spot('B1'), 'Anyone')).toBe(true);
  });
});
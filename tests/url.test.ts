import { describe, expect, it } from 'vitest';
import { normalizeUrl } from '@/lib/url';

describe('normalizeUrl', () => {
  it('adds https to a bare domain', () => {
    expect(normalizeUrl('brand.com')).toBe('https://brand.com/');
  });
  it('rejects hosts without a dot', () => {
    expect(normalizeUrl('localhost')).toBeNull();
  });
  it('rejects non-web schemes', () => {
    expect(normalizeUrl('javascript:alert(1)')).toBeNull();
  });
});
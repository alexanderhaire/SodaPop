import { describe, it, expect } from 'vitest';
import { formatAddress } from './formatAddress';

describe('formatAddress', () => {
  it('formats short address', () => {
    expect(formatAddress('0x1234567890')).toBe('0x1234…7890');
  });

  it('returns empty string for empty input', () => {
    expect(formatAddress('')).toBe('');
  });
});

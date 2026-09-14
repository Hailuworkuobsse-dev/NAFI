import { describe, expect, it } from 'vitest';

import { formatNumber, formatPercent, formatWeight } from '../number';

describe('formatNumber', () => {
  it('formats integers with thousands separators', () => {
    expect(formatNumber(1234567)).toBe('1,234,567');
  });

  it('handles invalid input', () => {
    expect(formatNumber('x')).toBe('—');
  });
});

describe('formatPercent', () => {
  it('formats as percentage', () => {
    expect(formatPercent(0.075, 1)).toBe('7.5%');
  });
});

describe('formatWeight', () => {
  it('converts to MT above 1000 kg', () => {
    expect(formatWeight(2500)).toBe('2.50 MT');
  });

  it('keeps kg below 1000', () => {
    expect(formatWeight(500)).toBe('500.00 kg');
  });
});

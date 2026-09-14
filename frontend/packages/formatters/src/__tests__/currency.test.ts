import { describe, expect, it } from 'vitest';

import { formatCompactMoney, formatMoney } from '../currency';

describe('formatMoney', () => {
  it('formats ETB with symbol', () => {
    expect(formatMoney(1234.5, 'ETB')).toContain('1,234.50');
  });

  it('accepts decimal strings from Prisma', () => {
    expect(formatMoney('1234.567', 'ETB', 'en-US')).toBe('ETB 1,234.57');
  });

  it('returns em-dash for invalid input', () => {
    expect(formatMoney('not-a-number', 'ETB')).toBe('—');
    expect(formatMoney(NaN, 'USD')).toBe('—');
  });

  it('formats USD with $', () => {
    expect(formatMoney(1000, 'USD', 'en-US')).toBe('$1,000.00');
  });
});

describe('formatCompactMoney', () => {
  it('compacts large numbers', () => {
    const result = formatCompactMoney(12_450_000, 'USD', 'en-US');
    expect(result).toMatch(/\$12\.45?M/);
  });
});

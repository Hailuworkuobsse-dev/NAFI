export type SupportedCurrency = 'ETB' | 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD' | 'AED';

export const CURRENCY_SYMBOLS: Record<SupportedCurrency, string> = {
  ETB: 'Br',
  USD: '$',
  EUR: '€',
  GBP: '£',
  CAD: 'C$',
  AUD: 'A$',
  AED: 'د.إ',
};

export function formatMoney(
  amount: number | string,
  currency: SupportedCurrency,
  locale = 'en-ET',
): string {
  const value = typeof amount === 'string' ? Number(amount) : amount;
  if (!Number.isFinite(value)) return '—';

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatCompactMoney(
  amount: number | string,
  currency: SupportedCurrency,
  locale = 'en-ET',
): string {
  const value = typeof amount === 'string' ? Number(amount) : amount;
  if (!Number.isFinite(value)) return '—';

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}

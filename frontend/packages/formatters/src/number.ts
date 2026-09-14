export function formatNumber(value: number | string, locale = 'en-ET'): string {
  const n = typeof value === 'string' ? Number(value) : value;
  if (!Number.isFinite(n)) return '—';
  return new Intl.NumberFormat(locale).format(n);
}

export function formatDecimal(
  value: number | string,
  digits = 2,
  locale = 'en-ET',
): string {
  const n = typeof value === 'string' ? Number(value) : value;
  if (!Number.isFinite(n)) return '—';
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(n);
}

export function formatPercent(
  value: number | string,
  digits = 1,
  locale = 'en-ET',
): string {
  const n = typeof value === 'string' ? Number(value) : value;
  if (!Number.isFinite(n)) return '—';
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(n);
}

export function formatWeight(kg: number | string, locale = 'en-ET'): string {
  const n = typeof kg === 'string' ? Number(kg) : kg;
  if (!Number.isFinite(n)) return '—';
  if (n >= 1000) return `${formatDecimal(n / 1000, 2, locale)} MT`;
  return `${formatDecimal(n, 2, locale)} kg`;
}

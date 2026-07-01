export type Currency = 'TRY' | 'USD' | 'EUR' | 'USDT';

const SYMBOLS: Record<Currency, string> = {
  TRY: '₺',
  USD: '$',
  EUR: '€',
  USDT: '₮',
};

const LOCALE: Record<Currency, string> = {
  TRY: 'tr-TR',
  USD: 'en-US',
  EUR: 'de-DE',
  USDT: 'en-US',
};

export function formatCurrency(amount: number, currency: Currency = 'TRY'): string {
  const formatted = new Intl.NumberFormat(LOCALE[currency], {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
  return `${SYMBOLS[currency]}${formatted}`;
}

export function formatNumber(value: number, locale = 'tr-TR'): string {
  return new Intl.NumberFormat(locale).format(value);
}

export function formatDate(input: string | Date, withTime = false): string {
  const d = typeof input === 'string' ? new Date(input) : input;
  if (Number.isNaN(d.getTime())) return '-';
  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  }).format(d);
}

export function formatDateTime(input: string | Date): string {
  return formatDate(input, true);
}

import type { Currency } from './types';

const RATES: Record<Currency, number> = {
  TRY: 1,
  USD: 0.031,
  EUR: 0.029,
  USDT: 0.031,
};

export function convertCurrency(amount: number, from: Currency, to: Currency): number {
  if (from === to) return roundCurrency(amount, to);
  const inTry = amount / RATES[from];
  const target = inTry * RATES[to];
  return roundCurrency(target, to);
}

export function roundCurrency(amount: number, currency: Currency): number {
  const decimals = currency === 'USDT' ? 6 : 2;
  return Math.round(amount * 10 ** decimals) / 10 ** decimals;
}

export function formatCurrency(amount: number, currency: Currency, locale = 'tr-TR'): string {
  const symbols: Record<Currency, string> = {
    TRY: '₺',
    USD: '$',
    EUR: '€',
    USDT: 'USDT ',
  };
  return `${symbols[currency]}${amount.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function sumBalances(balances: Record<Currency, number>): number {
  return roundCurrency(
    Object.entries(balances).reduce(
      (sum, [cur, amt]) => sum + convertCurrency(amt, cur as Currency, 'TRY'),
      0,
    ),
    'TRY',
  );
}

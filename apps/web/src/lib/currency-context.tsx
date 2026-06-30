'use client';

import * as React from 'react';

export type Currency = 'TRY' | 'USD' | 'EUR';

const STORAGE_KEY = 'cl_currency_v1';

const RATES: Record<Currency, number> = {
  TRY: 1,
  USD: 0.0303,
  EUR: 0.028,
};

const SYMBOLS: Record<Currency, string> = {
  TRY: '₺',
  USD: '$',
  EUR: '€',
};

const LOCALE: Record<Currency, string> = {
  TRY: 'tr-TR',
  USD: 'en-US',
  EUR: 'de-DE',
};

interface CurrencyContextValue {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  format: (amountTry: number) => string;
  convert: (amountTry: number) => number;
  symbol: string;
}

const CurrencyContext = React.createContext<CurrencyContextValue | null>(null);

function loadInitial(): Currency {
  if (typeof window === 'undefined') return 'TRY';
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === 'TRY' || stored === 'USD' || stored === 'EUR') return stored;
  return 'TRY';
}

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = React.useState<Currency>('TRY');
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => {
    setCurrencyState(loadInitial());
    setHydrated(true);
  }, []);

  const setCurrency = React.useCallback((c: Currency) => {
    setCurrencyState(c);
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(STORAGE_KEY, c);
      } catch {}
    }
  }, []);

  const convert = React.useCallback(
    (amountTry: number): number => amountTry * RATES[currency],
    [currency],
  );

  const format = React.useCallback(
    (amountTry: number): string => {
      const value = convert(amountTry);
      const formatted = new Intl.NumberFormat(LOCALE[currency], {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value);
      return `${SYMBOLS[currency]}${formatted}`;
    },
    [currency, convert],
  );

  const symbol = SYMBOLS[currency];

  const value = React.useMemo<CurrencyContextValue>(
    () => ({ currency, setCurrency, format, convert, symbol }),
    [currency, setCurrency, format, convert, symbol],
  );

  return (
    <CurrencyContext.Provider value={value}>
      <span suppressHydrationWarning style={{ display: 'contents' }}>
        {children}
      </span>
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = React.useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used inside CurrencyProvider');
  return ctx;
}

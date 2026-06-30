'use client';

import { ChevronDown } from 'lucide-react';
import { useCurrency, type Currency } from '@/lib/currency-context';

const CURRENCIES: Array<{ value: Currency; label: string }> = [
  { value: 'TRY', label: '₺ TRY' },
  { value: 'USD', label: '$ USD' },
  { value: 'EUR', label: '€ EUR' },
];

export function CurrencySwitcher() {
  const { currency, setCurrency } = useCurrency();

  return (
    <div className="relative">
      <select
        aria-label="Para birimi"
        value={currency}
        onChange={(e) => setCurrency(e.target.value as Currency)}
        className="h-9 appearance-none rounded-md border border-cyber-cyan/30 bg-cyber-darker/60 pl-3 pr-8 font-mono text-xs uppercase tracking-wider text-white transition-colors hover:border-cyber-cyan/60 focus:border-cyber-cyan focus:outline-none"
      >
        {CURRENCIES.map((c) => (
          <option key={c.value} value={c.value} className="bg-cyber-darker text-white">
            {c.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-cyber-cyan/70" />
    </div>
  );
}

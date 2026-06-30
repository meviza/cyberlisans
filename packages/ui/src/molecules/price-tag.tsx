'use client';

import * as React from 'react';
import { cn } from '../utils/cn';

export type Currency = 'TRY' | 'USD' | 'EUR';

export interface PriceTagProps extends React.HTMLAttributes<HTMLDivElement> {
  amount: number;
  currency: Currency;
  originalCurrency?: Currency;
  discount?: number;
}

const symbol: Record<Currency, string> = { TRY: '₺', USD: '$', EUR: '€' };

const rates: Record<Currency, number> = { TRY: 1, USD: 1 / 32, EUR: 1 / 35 };

function PriceTag({
  amount,
  currency,
  originalCurrency,
  discount,
  className,
  ...props
}: PriceTagProps) {
  const inTry = amount * rates[currency];
  const usd = inTry * rates.USD;
  const eur = inTry * rates.EUR;

  return (
    <div className={cn('flex flex-col gap-1', className)} {...props}>
      <div className="flex items-baseline gap-2">
        <span className="font-orbitron text-3xl font-bold text-cyber-cyan text-glow-cyan">
          {symbol[currency]}
          {amount.toLocaleString()}
        </span>
        <span className="text-sm text-cyber-text-dim">{currency}</span>
        {originalCurrency && originalCurrency !== currency && (
          <span className="text-xs text-cyber-text-dim line-through">
            {symbol[originalCurrency]}
            {amount.toLocaleString()}
          </span>
        )}
        {discount !== undefined && discount > 0 && (
          <span className="ml-2 rounded-sm bg-cyber-pink/20 px-1.5 py-0.5 text-xs font-bold text-cyber-pink border border-cyber-pink/50">
            -{discount}%
          </span>
        )}
      </div>
      {currency !== 'TRY' && (
        <div className="flex gap-3 text-xs text-cyber-text-dim">
          <span>₺{inTry.toFixed(2)}</span>
          <span>${usd.toFixed(2)}</span>
          <span>€{eur.toFixed(2)}</span>
        </div>
      )}
    </div>
  );
}

export { PriceTag };

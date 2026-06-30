'use client';

import * as React from 'react';
import { Wallet } from 'lucide-react';
import { cn } from '../utils/cn';
import type { Currency } from './price-tag';

export interface WalletChipProps extends React.HTMLAttributes<HTMLButtonElement> {
  balance: number;
  currency: Currency;
  onClick?: () => void;
  loading?: boolean;
}

const symbol: Record<Currency, string> = { TRY: '₺', USD: '$', EUR: '€' };

const WalletChip = React.forwardRef<HTMLButtonElement, WalletChipProps>(
  ({ balance, currency, onClick, loading, className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        onClick={onClick}
        disabled={loading}
        className={cn(
          'group flex items-center gap-2 rounded-md border border-cyber-cyan/30 bg-cyber-bg-elevated/80 px-3 py-1.5 backdrop-blur-sm transition-all duration-200',
          'hover:border-cyber-cyan hover:shadow-neon-cyan hover:bg-cyber-bg-elevated',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          className,
        )}
        {...props}
      >
        <Wallet className="h-4 w-4 text-cyber-cyan transition-transform group-hover:rotate-12" />
        <div className="flex flex-col items-start leading-none">
          <span className="text-[10px] uppercase tracking-wider text-cyber-text-dim">Bakiye</span>
          <span className="font-orbitron text-sm font-bold text-cyber-cyan">
            {loading ? '...' : `${symbol[currency]}${balance.toLocaleString()}`}
          </span>
        </div>
      </button>
    );
  },
);
WalletChip.displayName = 'WalletChip';

export { WalletChip };

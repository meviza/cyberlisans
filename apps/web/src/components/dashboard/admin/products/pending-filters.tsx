'use client';

import * as React from 'react';
import type { ProductReviewStatus } from '@/lib/api/admin-products';

export type ProductFilter = 'ALL' | ProductReviewStatus;

export interface PendingFiltersProps {
  value: ProductFilter;
  onChange: (v: ProductFilter) => void;
}

const OPTIONS: Array<{ value: ProductFilter; label: string }> = [
  { value: 'PENDING', label: 'Bekleyen' },
  { value: 'APPROVED', label: 'Onaylanan' },
  { value: 'REJECTED', label: 'Reddedilen' },
  { value: 'ALL', label: 'Tümü' },
];

export function PendingFilters({ value, onChange }: PendingFiltersProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {OPTIONS.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={
            value === o.value
              ? 'rounded-md border border-cyber-cyan/50 bg-cyber-cyan/10 px-3 py-1.5 text-sm text-cyber-cyan'
              : 'rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/70 hover:border-cyber-cyan/30'
          }
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

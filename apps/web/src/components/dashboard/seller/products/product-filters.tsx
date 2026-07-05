'use client';

import * as React from 'react';
import type { SellerProductStatus } from '@/lib/api/seller-products';

export type ProductFilterValue = 'ALL' | SellerProductStatus;

const FILTERS: Array<{ value: ProductFilterValue; label: string }> = [
  { value: 'ALL', label: 'Tümü' },
  { value: 'PENDING_REVIEW', label: 'İncelemede' },
  { value: 'ACTIVE', label: 'Aktif' },
  { value: 'REJECTED', label: 'Reddedildi' },
];

export interface ProductFiltersProps {
  value: ProductFilterValue;
  onChange: (v: ProductFilterValue) => void;
}

export function ProductFilters({ value, onChange }: ProductFiltersProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {FILTERS.map((f) => {
        const active = f.value === value;
        return (
          <button
            key={f.value}
            type="button"
            onClick={() => onChange(f.value)}
            className={
              active
                ? 'rounded-md border border-cyber-cyan/50 bg-cyber-cyan/10 px-3 py-1.5 text-sm text-cyber-cyan'
                : 'rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/70 hover:border-cyber-cyan/30'
            }
          >
            {f.label}
          </button>
        );
      })}
    </div>
  );
}

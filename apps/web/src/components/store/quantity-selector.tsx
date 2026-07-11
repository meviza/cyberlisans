'use client';

import * as React from 'react';
import { Minus, Plus } from 'lucide-react';

export interface QuantitySelectorProps {
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
  size?: 'sm' | 'md';
}

export function QuantitySelector({
  value,
  min = 1,
  max = 99,
  onChange,
  size = 'md',
}: QuantitySelectorProps) {
  const h = size === 'sm' ? 'h-8' : 'h-10';
  const w = size === 'sm' ? 'w-8' : 'w-10';

  return (
    <div className="inline-flex items-center rounded-xl border border-white/12 bg-white/[0.03]">
      <button
        type="button"
        aria-label="Azalt"
        disabled={value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
        className={`flex ${h} ${w} items-center justify-center text-brand-text-secondary transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-40`}
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <span className={`min-w-[2rem] text-center text-sm font-medium text-white`}>{value}</span>
      <button
        type="button"
        aria-label="Arttır"
        disabled={value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
        className={`flex ${h} ${w} items-center justify-center text-brand-text-secondary transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-40`}
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

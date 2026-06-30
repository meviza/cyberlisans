'use client';

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
  max = 20,
  onChange,
  size = 'md',
}: QuantitySelectorProps) {
  const h = size === 'sm' ? 'h-9' : 'h-10';
  const w = size === 'sm' ? 'w-9' : 'w-10';
  const iconSize = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4';

  return (
    <div
      className={`inline-flex items-center rounded-md border border-cyber-cyan/30 bg-cyber-darker`}
    >
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label="Azalt"
        className={`flex ${h} ${w} items-center justify-center text-white/70 transition-colors hover:text-cyber-cyan disabled:cursor-not-allowed disabled:opacity-40`}
      >
        <Minus className={iconSize} />
      </button>
      <span
        className={`min-w-[40px] text-center text-sm font-medium text-white ${size === 'md' ? 'h-10' : 'h-9'} flex items-center justify-center`}
      >
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label="Arttır"
        className={`flex ${h} ${w} items-center justify-center text-white/70 transition-colors hover:text-cyber-cyan disabled:cursor-not-allowed disabled:opacity-40`}
      >
        <Plus className={iconSize} />
      </button>
    </div>
  );
}

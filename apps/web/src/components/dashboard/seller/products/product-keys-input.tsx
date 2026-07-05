'use client';

import * as React from 'react';
import { cn } from '@cyberlisans/ui/cn';

export interface ProductKeysInputProps {
  value: string;
  disabled: boolean;
  onChange: (v: string) => void;
  hint?: string;
}

export function ProductKeysInput({ value, disabled, onChange, hint }: ProductKeysInputProps) {
  const lines = value.split('\n').filter((l) => l.trim().length > 0);
  return (
    <div className="space-y-1.5">
      <textarea
        rows={6}
        disabled={disabled}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={'ABCD-EFGH-IJKL-MNOP\nQRST-UVWX-YZ12-3456'}
        className={cn(
          'flex w-full rounded-md border border-cyber-cyan/30 bg-cyber-dark/50 px-3 py-2 text-sm text-cyber-text',
          'placeholder:text-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyber-cyan/50',
          'disabled:cursor-not-allowed disabled:opacity-50 font-mono text-xs',
        )}
      />
      <div className="flex items-center justify-between text-xs text-white/50">
        <span>{hint ?? 'Her satıra bir anahtar yapıştır.'}</span>
        <span className="text-cyber-cyan">{lines.length} anahtar</span>
      </div>
    </div>
  );
}

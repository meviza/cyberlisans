'use client';

import * as React from 'react';
import type { DisputeRow } from './dispute-table';

export interface DisputeFiltersProps {
  status: 'ALL' | DisputeRow['status'];
  date: 'ALL' | '7d' | '30d';
  onStatusChange: (v: DisputeFiltersProps['status']) => void;
  onDateChange: (v: DisputeFiltersProps['date']) => void;
}

export function DisputeFilters({
  status,
  date,
  onStatusChange,
  onDateChange,
}: DisputeFiltersProps) {
  return (
    <div className="flex flex-wrap gap-3">
      <div className="flex items-center gap-1">
        <span className="text-xs uppercase tracking-wider text-white/50">Durum:</span>
        {(['ALL', 'OPEN', 'RESOLVED', 'CLOSED'] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onStatusChange(s)}
            className={
              status === s
                ? 'rounded-md border border-cyber-cyan/50 bg-cyber-cyan/10 px-2 py-1 text-xs text-cyber-cyan'
                : 'rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs text-white/70 hover:border-cyber-cyan/30'
            }
          >
            {s === 'ALL' ? 'Tümü' : s === 'OPEN' ? 'Açık' : s === 'RESOLVED' ? 'Çözüldü' : 'Kapalı'}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-1">
        <span className="text-xs uppercase tracking-wider text-white/50">Tarih:</span>
        {(['ALL', '7d', '30d'] as const).map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => onDateChange(d)}
            className={
              date === d
                ? 'rounded-md border border-cyber-cyan/50 bg-cyber-cyan/10 px-2 py-1 text-xs text-cyber-cyan'
                : 'rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs text-white/70 hover:border-cyber-cyan/30'
            }
          >
            {d === 'ALL' ? 'Tümü' : d === '7d' ? '7 gün' : '30 gün'}
          </button>
        ))}
      </div>
    </div>
  );
}

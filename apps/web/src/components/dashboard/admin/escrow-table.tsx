'use client';

import * as React from 'react';
import { Badge } from '@cyberlisans/ui/atoms';
import { formatCurrency, formatDateTime } from '@/lib/format';

export type EscrowStatus = 'HELD' | 'RELEASED' | 'REFUNDED' | 'DISPUTED';

export interface EscrowRow {
  id: string;
  orderId: string;
  amount: number;
  currency: 'TRY' | 'USD' | 'EUR' | 'USDT';
  status: EscrowStatus;
  releaseDate: string;
  ageDays: number;
}

const STATUS_MAP: Record<
  EscrowStatus,
  { label: string; variant: 'success' | 'warning' | 'danger' | 'default' | 'magenta' }
> = {
  HELD: { label: "Escrow'da", variant: 'magenta' },
  RELEASED: { label: 'Serbest', variant: 'success' },
  REFUNDED: { label: 'İade', variant: 'default' },
  DISPUTED: { label: 'İtiraz', variant: 'danger' },
};

export interface EscrowTableProps {
  rows: EscrowRow[];
}

export function EscrowTable({ rows }: EscrowTableProps) {
  if (rows.length === 0) {
    return null;
  }
  return (
    <div className="overflow-hidden rounded-lg border border-cyber-cyan/20">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-cyber-cyan/20 bg-cyber-darker/60 text-left text-xs uppercase tracking-wider text-white/60">
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Sipariş</th>
              <th className="px-4 py-3 text-right">Tutar</th>
              <th className="px-4 py-3">Durum</th>
              <th className="px-4 py-3">Serbest Bırakma</th>
              <th className="px-4 py-3">Yaş</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const s = STATUS_MAP[r.status];
              const oldDays = r.ageDays >= 7;
              return (
                <tr key={r.id} className="border-b border-cyber-cyan/10 hover:bg-cyber-cyan/5">
                  <td className="px-4 py-3 font-mono text-cyber-cyan">{r.id.slice(0, 8)}</td>
                  <td className="px-4 py-3 font-mono text-white/70">{r.orderId.slice(0, 10)}</td>
                  <td className="px-4 py-3 text-right font-mono text-white">
                    {formatCurrency(r.amount, r.currency)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={s.variant} size="sm">
                      {s.label}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-xs text-white/70">
                    {formatDateTime(r.releaseDate)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={oldDays ? 'text-cyber-magenta' : 'text-white/70'}>
                      {r.ageDays}g
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

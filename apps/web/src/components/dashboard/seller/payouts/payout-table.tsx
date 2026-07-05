'use client';

import * as React from 'react';
import { Card, CardContent, Badge } from '@cyberlisans/ui/atoms';
import { formatCurrency, formatDateTime } from '@/lib/format';

export type PayoutMethod = 'BANK' | 'PAYPAL' | 'CRYPTO';
export type PayoutStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface PayoutRow {
  id: string;
  amount: number;
  currency: 'TRY' | 'USD' | 'EUR' | 'USDT';
  method: PayoutMethod;
  destination: string;
  status: PayoutStatus;
  createdAt: string;
  txHash?: string | null;
}

const STATUS_MAP: Record<
  PayoutStatus,
  { label: string; variant: 'success' | 'warning' | 'danger' | 'default' }
> = {
  PENDING: { label: 'Bekliyor', variant: 'warning' },
  PROCESSING: { label: 'İşleniyor', variant: 'warning' },
  COMPLETED: { label: 'Tamamlandı', variant: 'success' },
  FAILED: { label: 'Başarısız', variant: 'danger' },
};

const METHOD_LABEL: Record<PayoutMethod, string> = {
  BANK: 'Banka',
  PAYPAL: 'PayPal',
  CRYPTO: 'Kripto',
};

export interface PayoutTableProps {
  rows: PayoutRow[];
}

export function PayoutTable({ rows }: PayoutTableProps) {
  if (rows.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-sm text-white/50">
          Henüz payout talebin yok.
        </CardContent>
      </Card>
    );
  }
  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-cyber-cyan/20 text-left text-xs uppercase tracking-wider text-white/60">
                <th className="px-4 py-3">Tarih</th>
                <th className="px-4 py-3 text-right">Tutar</th>
                <th className="px-4 py-3">Yöntem</th>
                <th className="px-4 py-3">Hedef</th>
                <th className="px-4 py-3">Durum</th>
                <th className="px-4 py-3">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const s = STATUS_MAP[r.status];
                return (
                  <tr key={r.id} className="border-b border-cyber-cyan/10 hover:bg-cyber-cyan/5">
                    <td className="px-4 py-3 text-white/70">{formatDateTime(r.createdAt)}</td>
                    <td className="px-4 py-3 text-right font-mono text-cyber-cyan">
                      {formatCurrency(r.amount, r.currency)}
                    </td>
                    <td className="px-4 py-3 text-white">{METHOD_LABEL[r.method]}</td>
                    <td className="px-4 py-3 font-mono text-xs text-white/70">{r.destination}</td>
                    <td className="px-4 py-3">
                      <Badge variant={s.variant} size="sm">
                        {s.label}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-white/50">{r.txHash ?? '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

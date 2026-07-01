'use client';

import * as React from 'react';
import Link from 'next/link';
import { Badge } from '@cyberlisans/ui/atoms';
import type { DealerSale, DealerSaleStatus } from '@/lib/dealer-types';

const STATUS_MAP: Record<
  DealerSaleStatus,
  { label: string; variant: 'success' | 'warning' | 'danger' | 'default' }
> = {
  PENDING: { label: 'Bekliyor', variant: 'warning' },
  SETTLED: { label: 'Ödendi', variant: 'success' },
  REFUNDED: { label: 'İade', variant: 'danger' },
};

const fmtTRY = (n: number) =>
  new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 2,
  }).format(n);

export function DealerSalesTable({
  sales,
  compact = false,
}: {
  sales: DealerSale[];
  compact?: boolean;
}) {
  const list = compact ? sales.slice(0, 10) : sales;

  if (list.length === 0) {
    return <p className="text-sm text-white/50">Henüz satış kaydı yok.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-cyber-cyan/20 text-left text-xs uppercase tracking-wider text-white/60">
            <th className="py-3 pr-4">Tarih</th>
            <th className="py-3 pr-4">Sipariş</th>
            <th className="py-3 pr-4">Link</th>
            <th className="py-3 pr-4">Ürün</th>
            <th className="py-3 pr-4 text-right">Brüt</th>
            <th className="py-3 pr-4 text-right">Komisyon</th>
            <th className="py-3 pr-4 text-right">Net</th>
            <th className="py-3 pr-4">Durum</th>
          </tr>
        </thead>
        <tbody>
          {list.map((s) => {
            const status = STATUS_MAP[s.status];
            return (
              <tr
                key={s.id}
                className="border-b border-cyber-cyan/10 transition-colors hover:bg-cyber-cyan/5"
              >
                <td className="py-3 pr-4 text-white/70">
                  {new Date(s.createdAt).toLocaleDateString('tr-TR')}
                </td>
                <td className="py-3 pr-4 font-mono text-xs text-cyber-cyan">
                  <Link href={`/dealer/sales?orderId=${s.orderId}`} className="hover:underline">
                    {s.orderId.slice(0, 8)}
                  </Link>
                </td>
                <td className="py-3 pr-4 font-mono text-xs text-white/70">
                  {s.linkCode ? (
                    <Link
                      href={s.linkId ? `/dealer/links/${s.linkId}` : '#'}
                      className="hover:text-cyber-cyan"
                    >
                      {s.linkCode}
                    </Link>
                  ) : (
                    <span className="text-white/30">—</span>
                  )}
                </td>
                <td className="py-3 pr-4 max-w-[200px] truncate text-white">
                  {s.productName ?? '—'}
                </td>
                <td className="py-3 pr-4 text-right font-mono text-white">
                  {fmtTRY(s.grossAmount)}
                </td>
                <td className="py-3 pr-4 text-right font-mono text-cyber-cyan">
                  {fmtTRY(s.commissionAmount)}
                </td>
                <td className="py-3 pr-4 text-right font-mono text-cyber-lime">
                  {fmtTRY(s.netAmount)}
                </td>
                <td className="py-3 pr-4">
                  <Badge variant={status.variant} size="sm">
                    {status.label}
                  </Badge>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

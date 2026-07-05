'use client';

import * as React from 'react';
import { Package, AlertCircle } from 'lucide-react';
import { Badge } from '@cyberlisans/ui/atoms';
import { formatCurrency, formatDateTime } from '@/lib/format';
import type { PendingProduct, ProductReviewStatus } from '@/lib/api/admin-products';
import { ApprovalActions } from './approval-actions';

export interface PendingTableProps {
  rows: PendingProduct[];
  onChanged?: () => void;
}

const STATUS_MAP: Record<
  ProductReviewStatus,
  { label: string; variant: 'success' | 'warning' | 'danger' | 'default' }
> = {
  PENDING: { label: 'Bekliyor', variant: 'warning' },
  APPROVED: { label: 'Onaylı', variant: 'success' },
  REJECTED: { label: 'Reddedildi', variant: 'danger' },
};

export function PendingTable({ rows, onChanged }: PendingTableProps) {
  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-md border border-dashed border-cyber-cyan/20 bg-cyber-darker/40 p-8 text-center">
        <Package className="h-8 w-8 text-white/30" />
        <p className="text-sm text-white/50">Bu filtreyle ürün yok.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-cyber-cyan/20">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-cyber-cyan/20 bg-cyber-darker/60 text-left text-xs uppercase tracking-wider text-white/60">
              <th className="px-4 py-3">Ürün</th>
              <th className="px-4 py-3">Satıcı</th>
              <th className="px-4 py-3 text-right">Fiyat</th>
              <th className="px-4 py-3 text-right">Stok</th>
              <th className="px-4 py-3">Tarih</th>
              <th className="px-4 py-3">Durum</th>
              <th className="px-4 py-3 text-right"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const s = STATUS_MAP[r.status];
              return (
                <tr key={r.id} className="border-b border-cyber-cyan/10 hover:bg-cyber-cyan/5">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="h-10 w-10 shrink-0 rounded-md border border-cyber-cyan/20 bg-cyber-darker"
                        style={{ background: r.imageUrl }}
                      />
                      <div className="min-w-0">
                        <p className="truncate font-medium text-white">{r.name}</p>
                        <p className="font-mono text-xs text-white/40">{r.id.slice(0, 10)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-white/80">{r.seller.name}</td>
                  <td className="px-4 py-3 text-right font-mono text-white">
                    {formatCurrency(r.price, r.currency)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {r.stock === 0 ? (
                      <span className="inline-flex items-center gap-1 text-cyber-magenta">
                        <AlertCircle className="h-3 w-3" /> Tükendi
                      </span>
                    ) : (
                      <span className="text-white/80">{r.stock}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-white/60">
                    {formatDateTime(r.submittedAt)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={s.variant} size="sm">
                      {s.label}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <ApprovalActions
                      productId={r.id}
                      productName={r.name}
                      status={r.status}
                      onComplete={onChanged}
                    />
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

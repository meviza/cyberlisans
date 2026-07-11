'use client';

import * as React from 'react';
import Link from 'next/link';
import { Badge } from '@cyberlisans/ui/atoms';
import { formatDateTime } from '@/lib/format';

export interface DisputeRow {
  id: string;
  orderId: string;
  customerName: string;
  sellerName: string;
  reason: string;
  status: 'OPEN' | 'RESOLVED' | 'CLOSED';
  openedAt: string;
}

const STATUS_MAP: Record<
  DisputeRow['status'],
  { label: string; variant: 'success' | 'warning' | 'danger' | 'default' }
> = {
  OPEN: { label: 'Açık', variant: 'danger' },
  RESOLVED: { label: 'Çözüldü', variant: 'success' },
  CLOSED: { label: 'Kapalı', variant: 'default' },
};

export interface DisputeTableProps {
  rows: DisputeRow[];
}

export function DisputeTable({ rows }: DisputeTableProps) {
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
              <th className="px-4 py-3">Müşteri</th>
              <th className="px-4 py-3">Satıcı</th>
              <th className="px-4 py-3">Sebep</th>
              <th className="px-4 py-3">Durum</th>
              <th className="px-4 py-3">Açılış</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const s = STATUS_MAP[r.status];
              return (
                <tr key={r.id} className="border-b border-cyber-cyan/10 hover:bg-cyber-cyan/5">
                  <td className="px-4 py-3 font-mono text-cyber-cyan">{r.id.slice(0, 8)}</td>
                  <td className="px-4 py-3 font-mono text-white/70">{r.orderId.slice(0, 8)}</td>
                  <td className="px-4 py-3 text-white">{r.customerName}</td>
                  <td className="px-4 py-3 text-white">{r.sellerName}</td>
                  <td className="px-4 py-3 max-w-[200px] truncate text-white/70">{r.reason}</td>
                  <td className="px-4 py-3">
                    <Badge variant={s.variant} size="sm">
                      {s.label}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-xs text-white/50">{formatDateTime(r.openedAt)}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/disputes/${r.id}`}
                      className="rounded-md border border-cyber-cyan/40 px-2 py-1 text-xs text-cyber-cyan hover:bg-cyber-cyan/10"
                    >
                      Çöz →
                    </Link>
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

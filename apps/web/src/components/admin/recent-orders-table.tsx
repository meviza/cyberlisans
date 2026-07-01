'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, CardContent, Badge } from '@cyberlisans/ui/atoms';
import { Spinner } from '@cyberlisans/ui/atoms';
import { apiFetch, ApiError } from '@/lib/api-client';
import { formatCurrency, formatDate } from '@/lib/format';

export interface AdminOrderRow {
  id: string;
  orderNumber?: string;
  createdAt: string;
  customer?: { username?: string; email?: string } | null;
  total?: number;
  totalTry?: number;
  status: 'PENDING' | 'PAID' | 'FULFILLED' | 'CANCELLED' | 'REFUNDED';
  currency?: 'TRY' | 'USD' | 'EUR';
}

const STATUS_LABEL: Record<AdminOrderRow['status'], string> = {
  PENDING: 'Bekliyor',
  PAID: 'Ödendi',
  FULFILLED: 'Teslim Edildi',
  CANCELLED: 'İptal',
  REFUNDED: 'İade',
};

const STATUS_VARIANT: Record<
  AdminOrderRow['status'],
  'success' | 'warning' | 'danger' | 'default' | 'magenta'
> = {
  PENDING: 'warning',
  PAID: 'warning',
  FULFILLED: 'success',
  CANCELLED: 'danger',
  REFUNDED: 'magenta',
};

export function RecentOrdersTable({ limit = 10 }: { limit?: number }) {
  const [data, setData] = React.useState<AdminOrderRow[] | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setError(null);
    try {
      const res = await apiFetch<{ items?: AdminOrderRow[] }>(`/api/admin/orders?limit=${limit}`);
      setData(res.items ?? []);
    } catch (e) {
      if (e instanceof ApiError) setError(e.message);
      else setError('Yüklenemedi');
      setData([]);
    }
  }, [limit]);

  React.useEffect(() => {
    load();
  }, [load]);

  return (
    <Card>
      <CardContent className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-orbitron text-sm font-bold uppercase tracking-wider text-white">
              Son Siparişler
            </h3>
            <p className="mt-1 text-xs text-white/50">Son {limit} sipariş</p>
          </div>
          <Link
            href="/admin/orders"
            className="text-xs text-cyber-cyan transition-colors hover:text-cyber-magenta"
          >
            Tümünü Gör →
          </Link>
        </div>

        {data === null && !error && (
          <div className="flex h-40 items-center justify-center">
            <Spinner size="md" />
          </div>
        )}

        {error && (
          <div className="rounded-md border border-cyber-magenta/30 bg-cyber-magenta/5 p-3 text-sm text-cyber-magenta">
            {error}
          </div>
        )}

        {data && data.length === 0 && !error && (
          <p className="rounded-md border border-dashed border-cyber-cyan/20 p-6 text-center text-sm text-white/50">
            Henüz sipariş yok
          </p>
        )}

        {data && data.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-cyber-cyan/20 text-left text-xs uppercase tracking-wider text-white/50">
                  <th className="py-2 pr-3">Sipariş</th>
                  <th className="py-2 pr-3">Müşteri</th>
                  <th className="py-2 pr-3">Tarih</th>
                  <th className="py-2 pr-3 text-right">Tutar</th>
                  <th className="py-2 pr-3">Durum</th>
                </tr>
              </thead>
              <tbody>
                {data.map((o) => {
                  const total = o.total ?? o.totalTry ?? 0;
                  const currency = (o.currency ?? 'TRY') as 'TRY' | 'USD' | 'EUR';
                  return (
                    <tr
                      key={o.id}
                      className="border-b border-cyber-cyan/10 transition-colors hover:bg-cyber-cyan/5"
                    >
                      <td className="py-3 pr-3">
                        <Link
                          href={`/admin/orders/${o.id}`}
                          className="font-mono text-cyber-cyan hover:text-cyber-magenta"
                        >
                          {o.orderNumber ?? `#${o.id.slice(0, 8)}`}
                        </Link>
                      </td>
                      <td className="py-3 pr-3 text-white/80">
                        {o.customer?.username ?? o.customer?.email ?? '—'}
                      </td>
                      <td className="py-3 pr-3 text-white/60">{formatDate(o.createdAt)}</td>
                      <td className="py-3 pr-3 text-right font-medium text-white">
                        {formatCurrency(total, currency)}
                      </td>
                      <td className="py-3 pr-3">
                        <Badge variant={STATUS_VARIANT[o.status]} size="sm">
                          {STATUS_LABEL[o.status]}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

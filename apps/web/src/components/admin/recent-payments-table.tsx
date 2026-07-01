'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, CardContent, Badge } from '@cyberlisans/ui/atoms';
import { Spinner } from '@cyberlisans/ui/atoms';
import { apiFetch, ApiError } from '@/lib/api-client';
import { formatCurrency, formatDateTime } from '@/lib/format';

export type PaymentMethod =
  | 'WALLET'
  | 'PAYTR'
  | 'PAPARA'
  | 'STRIPE'
  | 'NOWPAYMENTS'
  | 'BANK_TRANSFER';

export interface AdminPaymentRow {
  id: string;
  createdAt: string;
  method: PaymentMethod;
  amount: number;
  currency: 'TRY' | 'USD' | 'EUR' | 'USDT';
  status: 'PENDING' | 'SUCCEEDED' | 'FAILED' | 'REFUNDED';
  orderId?: string | null;
  customer?: { username?: string; email?: string } | null;
}

const METHOD_LABEL: Record<PaymentMethod, string> = {
  WALLET: 'Cüzdan',
  PAYTR: 'PayTR',
  PAPARA: 'Papara',
  STRIPE: 'Stripe',
  NOWPAYMENTS: 'Kripto',
  BANK_TRANSFER: 'Havale',
};

const STATUS_LABEL: Record<AdminPaymentRow['status'], string> = {
  PENDING: 'Bekliyor',
  SUCCEEDED: 'Başarılı',
  FAILED: 'Başarısız',
  REFUNDED: 'İade',
};

const STATUS_VARIANT: Record<
  AdminPaymentRow['status'],
  'success' | 'warning' | 'danger' | 'default' | 'magenta'
> = {
  PENDING: 'warning',
  SUCCEEDED: 'success',
  FAILED: 'danger',
  REFUNDED: 'magenta',
};

const METHOD_COLOR: Record<PaymentMethod, string> = {
  WALLET: '#00F0FF',
  PAYTR: '#FF00C8',
  PAPARA: '#BEF264',
  STRIPE: '#8B5CF6',
  NOWPAYMENTS: '#FBBF24',
  BANK_TRANSFER: '#60A5FA',
};

export function RecentPaymentsTable({ limit = 10 }: { limit?: number }) {
  const [data, setData] = React.useState<AdminPaymentRow[] | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setError(null);
    try {
      const res = await apiFetch<{ items?: AdminPaymentRow[] }>(
        `/api/admin/payments?limit=${limit}`,
      );
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
              Son Ödemeler
            </h3>
            <p className="mt-1 text-xs text-white/50">Son {limit} ödeme</p>
          </div>
          <Link
            href="/admin/payments"
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
            Henüz ödeme yok
          </p>
        )}

        {data && data.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-cyber-cyan/20 text-left text-xs uppercase tracking-wider text-white/50">
                  <th className="py-2 pr-3">Yöntem</th>
                  <th className="py-2 pr-3">Müşteri</th>
                  <th className="py-2 pr-3">Tarih</th>
                  <th className="py-2 pr-3 text-right">Tutar</th>
                  <th className="py-2 pr-3">Durum</th>
                </tr>
              </thead>
              <tbody>
                {data.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-cyber-cyan/10 transition-colors hover:bg-cyber-cyan/5"
                  >
                    <td className="py-3 pr-3">
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 rounded-sm"
                          style={{
                            backgroundColor: METHOD_COLOR[p.method],
                            boxShadow: `0 0 6px ${METHOD_COLOR[p.method]}88`,
                          }}
                        />
                        <span className="text-white">{METHOD_LABEL[p.method]}</span>
                      </div>
                    </td>
                    <td className="py-3 pr-3 text-white/80">
                      {p.customer?.username ?? p.customer?.email ?? '—'}
                    </td>
                    <td className="py-3 pr-3 text-white/60">{formatDateTime(p.createdAt)}</td>
                    <td className="py-3 pr-3 text-right font-medium text-white">
                      {formatCurrency(p.amount, p.currency)}
                    </td>
                    <td className="py-3 pr-3">
                      <Badge variant={STATUS_VARIANT[p.status]} size="sm">
                        {STATUS_LABEL[p.status]}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

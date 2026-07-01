'use client';

import * as React from 'react';
import Link from 'next/link';
import { Badge, Spinner, Checkbox } from '@cyberlisans/ui/atoms';
import { Eye, MoreHorizontal } from 'lucide-react';
import { apiFetch, ApiError } from '@/lib/api-client';
import { formatCurrency, formatDateTime } from '@/lib/format';
import { cn } from '@cyberlisans/ui/cn';
import { OrderActionButtons } from './order-action-buttons';
import { ExportCsvButton } from './export-csv-button';

export type OrderStatus = 'PENDING' | 'PAID' | 'FULFILLED' | 'CANCELLED' | 'REFUNDED' | 'FAILED';
export type PaymentStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'SUCCEEDED'
  | 'FAILED'
  | 'REFUNDED'
  | 'EXPIRED';
export type PaymentMethod =
  | 'PAYTR'
  | 'PAPARA'
  | 'NOWPAYMENTS'
  | 'STRIPE'
  | 'BANK_TRANSFER'
  | 'WALLET';

export interface AdminOrderRow {
  id: string;
  orderNumber: string;
  user: { id: string; email: string; username: string; displayName: string | null };
  totalAmount: number;
  currency: 'TRY' | 'USD' | 'EUR' | 'USDT';
  status: OrderStatus;
  paymentMethod: PaymentMethod | null;
  paymentStatus: PaymentStatus | null;
  itemsCount: number;
  createdAt: string;
  paidAt: string | null;
  fulfilledAt: string | null;
}

const STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: 'Bekliyor',
  PAID: 'Ödendi',
  FULFILLED: 'Teslim',
  CANCELLED: 'İptal',
  REFUNDED: 'İade',
  FAILED: 'Başarısız',
};

const STATUS_VARIANT: Record<
  OrderStatus,
  'success' | 'warning' | 'danger' | 'default' | 'magenta' | 'cyan'
> = {
  PENDING: 'warning',
  PAID: 'cyan',
  FULFILLED: 'success',
  CANCELLED: 'danger',
  REFUNDED: 'magenta',
  FAILED: 'danger',
};

const METHOD_LABEL: Record<PaymentMethod, string> = {
  PAYTR: 'PayTR',
  PAPARA: 'Papara',
  NOWPAYMENTS: 'Kripto',
  STRIPE: 'Stripe',
  BANK_TRANSFER: 'Havale',
  WALLET: 'Cüzdan',
};

export interface OrdersTableProps {
  filters: {
    search?: string;
    status?: string;
    paymentStatus?: string;
    paymentMethod?: string;
    from?: string;
    to?: string;
  };
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export function OrdersTable({ filters, page, pageSize, onPageChange }: OrdersTableProps) {
  const [data, setData] = React.useState<AdminOrderRow[] | null>(null);
  const [total, setTotal] = React.useState(0);
  const [error, setError] = React.useState<string | null>(null);
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [refreshKey, setRefreshKey] = React.useState(0);

  const load = React.useCallback(async () => {
    setError(null);
    try {
      const qs = new URLSearchParams();
      qs.set('page', String(page));
      qs.set('limit', String(pageSize));
      if (filters.search) qs.set('search', filters.search);
      if (filters.status) qs.set('status', filters.status);
      if (filters.paymentStatus) qs.set('paymentStatus', filters.paymentStatus);
      if (filters.paymentMethod) qs.set('paymentMethod', filters.paymentMethod);
      if (filters.from) qs.set('from', filters.from);
      if (filters.to) qs.set('to', filters.to);
      const res = await apiFetch<{ items: AdminOrderRow[]; total: number; totalPages: number }>(
        `/api/admin/orders?${qs.toString()}`,
      );
      setData(res.items);
      setTotal(res.total);
      setSelected(new Set());
    } catch (e) {
      if (e instanceof ApiError) setError(e.message);
      else setError('Yüklenemedi');
      setData([]);
    }
  }, [
    filters.search,
    filters.status,
    filters.paymentStatus,
    filters.paymentMethod,
    filters.from,
    filters.to,
    page,
    pageSize,
  ]);

  React.useEffect(() => {
    load();
  }, [load, refreshKey]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const allChecked = data ? data.every((o) => selected.has(o.id)) && data.length > 0 : false;
  const someChecked = data ? data.some((o) => selected.has(o.id)) && !allChecked : false;

  const toggleAll = () => {
    if (!data) return;
    if (allChecked) {
      setSelected(new Set());
    } else {
      setSelected(new Set(data.map((o) => o.id)));
    }
  };

  const toggleOne = (id: string) => {
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs text-white/50">{total} sipariş</div>
        <div className="flex flex-wrap items-center gap-2">
          <ExportCsvButton filters={filters} />
          {selected.size > 0 && (
            <OrderActionButtons
              mode="bulk"
              orderIds={Array.from(selected)}
              onDone={() => setRefreshKey((k) => k + 1)}
            />
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-cyber-cyan/20 bg-cyber-darker/40">
        {!data && !error && (
          <div className="flex h-64 items-center justify-center">
            <Spinner size="lg" />
          </div>
        )}

        {error && (
          <div className="border-b border-cyber-magenta/30 bg-cyber-magenta/5 p-4 text-sm text-cyber-magenta">
            {error}
          </div>
        )}

        {data && data.length === 0 && !error && (
          <p className="p-8 text-center text-sm text-white/50">Sonuç bulunamadı</p>
        )}

        {data && data.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-cyber-cyan/20 bg-cyber-darker/60">
                <tr className="text-left text-xs uppercase tracking-wider text-white/50">
                  <th className="w-10 px-4 py-3">
                    <Checkbox checked={allChecked} onChange={toggleAll} aria-label="Tümünü seç" />
                    {someChecked && <span className="sr-only">Bazıları seçili</span>}
                  </th>
                  <th className="px-4 py-3">Sipariş</th>
                  <th className="px-4 py-3">Müşteri</th>
                  <th className="px-4 py-3 text-right">Tutar</th>
                  <th className="px-4 py-3">Ödeme</th>
                  <th className="px-4 py-3 text-right">Ürün</th>
                  <th className="px-4 py-3">Durum</th>
                  <th className="px-4 py-3">Tarih</th>
                  <th className="px-4 py-3 text-right">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {data.map((o) => (
                  <tr
                    key={o.id}
                    className={cn(
                      'border-b border-cyber-cyan/10 transition-colors hover:bg-cyber-cyan/5',
                      selected.has(o.id) && 'bg-cyber-cyan/10',
                    )}
                  >
                    <td className="px-4 py-3">
                      <Checkbox
                        checked={selected.has(o.id)}
                        onChange={() => toggleOne(o.id)}
                        aria-label={`Sipariş ${o.orderNumber} seç`}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/orders/${o.id}`}
                        className="font-mono text-cyber-cyan hover:text-cyber-magenta"
                      >
                        {o.orderNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-white/80">
                      {o.user.displayName ?? o.user.username}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-white">
                      {formatCurrency(o.totalAmount, o.currency)}
                    </td>
                    <td className="px-4 py-3 text-xs text-white/60">
                      {o.paymentMethod ? METHOD_LABEL[o.paymentMethod] : '—'}
                    </td>
                    <td className="px-4 py-3 text-right text-white/80">{o.itemsCount}</td>
                    <td className="px-4 py-3">
                      <Badge variant={STATUS_VARIANT[o.status]} size="sm">
                        {STATUS_LABEL[o.status]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-white/60">
                      {formatDateTime(o.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/orders/${o.id}`}
                          className="rounded p-1.5 text-white/60 transition-colors hover:bg-cyber-cyan/10 hover:text-cyber-cyan"
                          title="Detay"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <OrderActionButtons
                          mode="inline"
                          orderId={o.id}
                          currentStatus={o.status}
                          onDone={() => setRefreshKey((k) => k + 1)}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-cyber-cyan/20 px-4 py-3 text-xs">
            <button
              type="button"
              onClick={() => onPageChange(Math.max(1, page - 1))}
              disabled={page <= 1}
              className={cn(
                'rounded border border-cyber-cyan/30 px-3 py-1 transition-colors',
                page <= 1 ? 'cursor-not-allowed opacity-40' : 'hover:bg-cyber-cyan/10',
              )}
            >
              Önceki
            </button>
            <span className="text-white/60">
              {page} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => onPageChange(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages}
              className={cn(
                'rounded border border-cyber-cyan/30 px-3 py-1 transition-colors',
                page >= totalPages ? 'cursor-not-allowed opacity-40' : 'hover:bg-cyber-cyan/10',
              )}
            >
              Sonraki
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

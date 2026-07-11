'use client';

import * as React from 'react';
import Link from 'next/link';
import { Badge, Checkbox, Spinner } from '@cyberlisans/ui/atoms';
import { Eye, Loader2 } from 'lucide-react';
import { apiFetch, ApiError } from '@/lib/api-client';
import { formatCurrency, formatDateTime } from '@/lib/format';
import { cn } from '@cyberlisans/ui/cn';

export type PaymentProvider =
  | 'PAYTR'
  | 'PAPARA'
  | 'STRIPE'
  | 'NOWPAYMENTS'
  | 'BANK_TRANSFER'
  | 'WALLET';
export type PaymentStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'SUCCEEDED'
  | 'FAILED'
  | 'REFUNDED'
  | 'EXPIRED';
export type PaymentCurrency = 'TRY' | 'USD' | 'EUR' | 'USDT';

export interface AdminPaymentRow {
  id: string;
  orderId: string | null;
  orderNumber: string | null;
  user: { id: string; email: string; username: string; displayName: string | null } | null;
  provider: PaymentProvider;
  providerRef: string | null;
  amount: number;
  currency: PaymentCurrency;
  status: PaymentStatus;
  paidAt: string | null;
  refundedAt: string | null;
  createdAt: string;
}

const STATUS_LABEL: Record<PaymentStatus, string> = {
  PENDING: 'Bekliyor',
  PROCESSING: 'İşleniyor',
  SUCCEEDED: 'Başarılı',
  FAILED: 'Başarısız',
  REFUNDED: 'İade',
  EXPIRED: 'Süresi Doldu',
};

const STATUS_VARIANT: Record<
  PaymentStatus,
  'success' | 'warning' | 'danger' | 'default' | 'magenta' | 'cyan'
> = {
  PENDING: 'warning',
  PROCESSING: 'cyan',
  SUCCEEDED: 'success',
  FAILED: 'danger',
  REFUNDED: 'magenta',
  EXPIRED: 'default',
};

const PROVIDER_LABEL: Record<PaymentProvider, string> = {
  PAYTR: 'PayTR',
  PAPARA: 'Papara',
  STRIPE: 'Stripe',
  NOWPAYMENTS: 'Kripto',
  BANK_TRANSFER: 'Havale',
  WALLET: 'Cüzdan',
};

export interface PaymentsTableProps {
  filters: {
    search?: string;
    provider?: string;
    status?: string;
    currency?: string;
    from?: string;
    to?: string;
  };
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  refreshKey?: number;
}

export function PaymentsTable({
  filters,
  page,
  pageSize,
  onPageChange,
  refreshKey = 0,
}: PaymentsTableProps) {
  const [data, setData] = React.useState<AdminPaymentRow[] | null>(null);
  const [total, setTotal] = React.useState(0);
  const [error, setError] = React.useState<string | null>(null);
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [bulkBusy, setBulkBusy] = React.useState(false);
  const [bulkMsg, setBulkMsg] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setError(null);
    try {
      const qs = new URLSearchParams();
      qs.set('page', String(page));
      qs.set('limit', String(pageSize));
      if (filters.search) qs.set('search', filters.search);
      if (filters.provider) qs.set('provider', filters.provider);
      if (filters.status) qs.set('status', filters.status);
      if (filters.currency) qs.set('currency', filters.currency);
      if (filters.from) qs.set('from', filters.from);
      if (filters.to) qs.set('to', filters.to);
      const res = await apiFetch<{ items: AdminPaymentRow[]; total: number; totalPages: number }>(
        `/admin/payments?${qs.toString()}`,
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
    filters.provider,
    filters.status,
    filters.currency,
    filters.from,
    filters.to,
    page,
    pageSize,
  ]);

  React.useEffect(() => {
    load();
  }, [load, refreshKey]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const allChecked = data ? data.every((p) => selected.has(p.id)) && data.length > 0 : false;
  const someChecked = data ? data.some((p) => selected.has(p.id)) && !allChecked : false;

  const toggleAll = () => {
    if (!data) return;
    if (allChecked) setSelected(new Set());
    else setSelected(new Set(data.map((p) => p.id)));
  };

  const toggleOne = (id: string) => {
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const bulkRefund = async () => {
    if (bulkBusy || selected.size === 0) return;
    if (!window.confirm(`${selected.size} ödemeyi iade etmek istediğinize emin misiniz?`)) return;
    setBulkBusy(true);
    setBulkMsg(null);
    let ok = 0;
    let fail = 0;
    for (const id of Array.from(selected)) {
      try {
        await apiFetch(`/admin/payments/${id}/refund`, {
          method: 'POST',
          body: JSON.stringify({ creditWallet: true }),
        });
        ok += 1;
      } catch {
        fail += 1;
      }
    }
    setBulkBusy(false);
    setBulkMsg(`${ok} iade edildi, ${fail} başarısız`);
    load();
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs text-white/50">{total} ödeme</div>
        <div className="flex flex-wrap items-center gap-2">
          {bulkMsg && <span className="text-xs text-cyber-cyan">{bulkMsg}</span>}
          {selected.size > 0 && (
            <button
              type="button"
              onClick={bulkRefund}
              disabled={bulkBusy}
              className="inline-flex items-center gap-1 rounded-md border border-cyber-magenta/40 bg-cyber-magenta/10 px-3 py-1.5 text-xs text-cyber-magenta transition-colors hover:bg-cyber-magenta/20 disabled:opacity-50"
            >
              {bulkBusy ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
              {selected.size} Seçili · Toplu İade
            </button>
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
                  <th className="px-4 py-3">Ödeme</th>
                  <th className="px-4 py-3">Sipariş</th>
                  <th className="px-4 py-3">Kullanıcı</th>
                  <th className="px-4 py-3">Sağlayıcı</th>
                  <th className="px-4 py-3 text-right">Tutar</th>
                  <th className="px-4 py-3">Durum</th>
                  <th className="px-4 py-3">Tarih</th>
                  <th className="px-4 py-3 text-right">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {data.map((p) => (
                  <tr
                    key={p.id}
                    className={cn(
                      'border-b border-cyber-cyan/10 transition-colors hover:bg-cyber-cyan/5',
                      selected.has(p.id) && 'bg-cyber-cyan/10',
                    )}
                  >
                    <td className="px-4 py-3">
                      <Checkbox
                        checked={selected.has(p.id)}
                        onChange={() => toggleOne(p.id)}
                        aria-label={`Ödeme ${p.id} seç`}
                      />
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-white/60">
                      <Link href={`/admin/payments/${p.id}`} className="hover:text-cyber-cyan">
                        {p.id.slice(0, 8)}…
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      {p.orderId && p.orderNumber ? (
                        <Link
                          href={`/admin/orders/${p.orderId}`}
                          className="font-mono text-cyber-cyan hover:text-cyber-magenta"
                        >
                          {p.orderNumber}
                        </Link>
                      ) : (
                        <span className="text-white/40">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-white/80">
                      {p.user ? (
                        <Link href={`/admin/users/${p.user.id}`} className="hover:text-cyber-cyan">
                          {p.user.displayName ?? p.user.username}
                        </Link>
                      ) : (
                        <span className="text-white/40">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-white/60">
                      {PROVIDER_LABEL[p.provider]}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-white">
                      {formatCurrency(p.amount, p.currency)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={STATUS_VARIANT[p.status]} size="sm">
                        {STATUS_LABEL[p.status]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-white/60">
                      {formatDateTime(p.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/payments/${p.id}`}
                          className="rounded p-1.5 text-white/60 transition-colors hover:bg-cyber-cyan/10 hover:text-cyber-cyan"
                          title="Detay"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
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

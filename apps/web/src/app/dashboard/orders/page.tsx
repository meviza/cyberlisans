'use client';

import * as React from 'react';
import Link from 'next/link';
import { Receipt, AlertCircle } from 'lucide-react';
import { Card, CardContent, Badge, Spinner } from '@cyberlisans/ui/atoms';
import { EmptyState } from '@/components/store/empty-state';
import { useCurrency } from '@/lib/currency-context';
import { apiFetch } from '@/lib/api-client';
import { formatDateTime } from '@/lib/format';
import type { OrderStatus } from '@/components/dashboard/orders/order-header';

interface OrderRow {
  id: string;
  productTitle: string;
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
}

const STATUS_MAP: Record<
  OrderStatus,
  { label: string; variant: 'success' | 'warning' | 'danger' | 'default' | 'magenta' }
> = {
  PENDING: { label: 'Bekliyor', variant: 'warning' },
  PAID: { label: 'Ödendi', variant: 'success' },
  ESCROW_HELD: { label: "Escrow'da", variant: 'magenta' },
  RELEASED: { label: 'Tamamlandı', variant: 'success' },
  DISPUTED: { label: 'İtiraz', variant: 'danger' },
  REFUNDED: { label: 'İade', variant: 'default' },
  CANCELLED: { label: 'İptal', variant: 'default' },
};

const FILTERS: Array<{ value: 'all' | OrderStatus; label: string }> = [
  { value: 'all', label: 'Tümü' },
  { value: 'PENDING', label: 'Bekliyor' },
  { value: 'PAID', label: 'Ödendi' },
  { value: 'ESCROW_HELD', label: "Escrow'da" },
  { value: 'RELEASED', label: 'Tamamlandı' },
  { value: 'DISPUTED', label: 'İtiraz' },
];

export default function DashboardOrdersPage() {
  const { format } = useCurrency();
  const [orders, setOrders] = React.useState<OrderRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [filter, setFilter] = React.useState<'all' | OrderStatus>('all');

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiFetch<{ items: OrderRow[] }>('/orders/me');
        if (!cancelled) setOrders(res.items);
      } catch {
        if (!cancelled) {
          setError('Siparişler yüklenemedi');
          setOrders([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = filter === 'all' ? orders : orders.filter((o) => o.status === filter);
  if (loading)
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-orbitron text-2xl font-black text-white">Siparişlerim</h1>
        <p className="text-sm text-white/60">Tüm siparişlerini buradan takip et</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFilter(f.value)}
            className={
              filter === f.value
                ? 'rounded-md border border-cyber-cyan/50 bg-cyber-cyan/10 px-3 py-1.5 text-sm text-cyber-cyan'
                : 'rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/70 hover:border-cyber-cyan/30'
            }
          >
            {f.label}
          </button>
        ))}
      </div>
      {error && (
        <div className="flex items-center gap-2 rounded-md border border-cyber-magenta/40 bg-cyber-magenta/10 px-4 py-3 text-sm text-cyber-magenta">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title={orders.length === 0 ? 'Henüz sipariş yok' : 'Bu filtreyle sipariş yok'}
          ctaLabel={orders.length === 0 ? 'Mağazaya git' : undefined}
          ctaHref={orders.length === 0 ? '/products' : undefined}
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-cyber-cyan/20 text-left text-xs uppercase tracking-wider text-white/60">
                    <th className="px-4 py-3">Sipariş</th>
                    <th className="px-4 py-3">Tarih</th>
                    <th className="px-4 py-3 text-right">Tutar</th>
                    <th className="px-4 py-3">Durum</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((o) => {
                    const s = STATUS_MAP[o.status] ?? {
                      label: o.status,
                      variant: 'default' as const,
                    };
                    return (
                      <tr
                        key={o.id}
                        className="border-b border-cyber-cyan/10 hover:bg-cyber-cyan/5"
                      >
                        <td className="px-4 py-3">
                          <p className="font-mono text-cyber-cyan">{o.id}</p>
                          <p className="text-xs text-white/60">{o.productTitle}</p>
                        </td>
                        <td className="px-4 py-3 text-white/70">{formatDateTime(o.createdAt)}</td>
                        <td className="px-4 py-3 text-right font-medium text-white">
                          {format(o.totalAmount)}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={s.variant} size="sm">
                            {s.label}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link
                            href={`/dashboard/orders/${o.id}`}
                            className="text-xs text-cyber-cyan hover:text-cyber-magenta"
                          >
                            Detay →
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

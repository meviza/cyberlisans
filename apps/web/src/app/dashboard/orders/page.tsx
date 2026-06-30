'use client';

import * as React from 'react';
import Link from 'next/link';
import { Receipt, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Card, CardContent, Badge, Button, Spinner } from '@cyberlisans/ui/atoms';
import { EmptyState } from '@/components/store/empty-state';
import { useCurrency } from '@/lib/currency-context';
import { apiFetch } from '@/lib/api-client';

interface Order {
  id: string;
  totalAmount: number;
  currency: string;
  status: 'PENDING' | 'PAID' | 'CANCELLED' | 'REFUNDED' | string;
  paymentMethod?: string;
  createdAt: string;
  itemCount: number;
  items: Array<{ title: string; qty: number }>;
}

const STATUS_MAP: Record<
  string,
  { label: string; variant: 'success' | 'warning' | 'danger' | 'default' }
> = {
  PENDING: { label: 'Bekliyor', variant: 'warning' },
  PAID: { label: 'Ödendi', variant: 'warning' },
  FULFILLED: { label: 'Teslim Edildi', variant: 'success' },
  CANCELLED: { label: 'İptal', variant: 'danger' },
  REFUNDED: { label: 'İade Edildi', variant: 'default' },
};

const FILTERS: Array<{ value: 'all' | string; label: string }> = [
  { value: 'all', label: 'Tümü' },
  { value: 'PENDING', label: 'Bekliyor' },
  { value: 'PAID', label: 'Ödendi' },
  { value: 'CANCELLED', label: 'İptal' },
  { value: 'REFUNDED', label: 'İade' },
];

export default function DashboardOrdersPage() {
  const { format } = useCurrency();
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [filter, setFilter] = React.useState<'all' | string>('all');
  const [page, setPage] = React.useState(1);
  const perPage = 10;

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiFetch<{ items: Order[] }>('/orders?limit=100');
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
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * perPage, safePage * perPage);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-orbitron text-2xl font-black text-white">Siparişler</h1>
        <p className="text-sm text-white/60">Tüm siparişlerini buradan takip et</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => {
              setFilter(f.value);
              setPage(1);
            }}
            className={
              filter === f.value
                ? 'rounded-md border border-cyber-cyan/50 bg-cyber-cyan/10 px-3 py-1.5 text-sm font-medium text-cyber-cyan'
                : 'rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/70 transition-colors hover:border-cyber-cyan/30 hover:text-white'
            }
          >
            {f.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="rounded-md border border-cyber-magenta/40 bg-cyber-magenta/10 px-4 py-3 text-sm text-cyber-magenta">
          {error}
        </div>
      )}

      {paged.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title={orders.length === 0 ? 'Henüz sipariş yok' : 'Bu filtreyle sipariş yok'}
          description={
            orders.length === 0
              ? 'İlk siparişini oluşturmak için mağazayı gez.'
              : 'Farklı bir filtre seçerek tekrar dene.'
          }
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
                    <th className="px-4 py-3">Sipariş No</th>
                    <th className="px-4 py-3">Tarih</th>
                    <th className="px-4 py-3">Ürünler</th>
                    <th className="px-4 py-3 text-right">Toplam</th>
                    <th className="px-4 py-3">Ödeme</th>
                    <th className="px-4 py-3">Durum</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((o) => {
                    const s = STATUS_MAP[o.status] ?? {
                      label: o.status,
                      variant: 'default' as const,
                    };
                    return (
                      <tr
                        key={o.id}
                        className="border-b border-cyber-cyan/10 transition-colors hover:bg-cyber-cyan/5"
                      >
                        <td className="px-4 py-3 font-mono text-cyber-cyan">{o.id}</td>
                        <td className="px-4 py-3 text-white/70">
                          {new Date(o.createdAt).toLocaleDateString('tr-TR')}
                        </td>
                        <td className="px-4 py-3 text-white">
                          {o.items.slice(0, 2).map((it, i) => (
                            <div key={i} className="text-xs">
                              {it.qty > 1 && <span className="text-white/50">{it.qty}x </span>}
                              {it.title}
                            </div>
                          ))}
                          {o.items.length > 2 && (
                            <div className="text-xs text-white/40">
                              +{o.items.length - 2} ürün daha
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-white">
                          {format(o.totalAmount)}
                        </td>
                        <td className="px-4 py-3 text-white/70">{o.paymentMethod ?? '—'}</td>
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

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-white/60">
            Sayfa {safePage} / {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              disabled={safePage <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
              Önceki
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={safePage >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Sonraki
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {loading === false && orders.length === 0 && !error && (
        <div className="hidden items-center justify-center text-xs text-white/40">
          <Loader2 className="mr-2 h-3 w-3 animate-spin" /> Veriler önbellekten tazelendi
        </div>
      )}
    </div>
  );
}

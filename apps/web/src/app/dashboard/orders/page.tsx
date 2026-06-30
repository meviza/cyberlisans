'use client';

import * as React from 'react';
import Link from 'next/link';
import { Receipt, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, Badge, Button } from '@cyberlisans/ui/atoms';
import { EmptyState } from '@/components/dashboard/empty-state';

interface Order {
  id: string;
  date: string;
  products: { name: string; qty: number }[];
  total: number;
  status: 'pending' | 'paid' | 'fulfilled' | 'cancelled';
}

const MOCK_ORDERS: Order[] = [
  { id: 'ORD-2024-1842', date: '28 Haz 2026', products: [{ name: 'Steam Cüzdan 50 TL', qty: 1 }], total: 50, status: 'fulfilled' },
  { id: 'ORD-2024-1839', date: '27 Haz 2026', products: [{ name: 'OpenAI API $10', qty: 1 }], total: 320, status: 'fulfilled' },
  { id: 'ORD-2024-1835', date: '24 Haz 2026', products: [{ name: 'Windows 11 Pro Key', qty: 1 }], total: 1200, status: 'paid' },
  { id: 'ORD-2024-1821', date: '19 Haz 2026', products: [{ name: 'Netflix Premium 1 Ay', qty: 1 }], total: 250, status: 'fulfilled' },
  { id: 'ORD-2024-1810', date: '12 Haz 2026', products: [{ name: 'Discord Nitro 1 Ay', qty: 2 }], total: 400, status: 'cancelled' },
];

const STATUS_MAP: Record<Order['status'], { label: string; variant: 'success' | 'warning' | 'danger' | 'default' }> = {
  pending: { label: 'Bekliyor', variant: 'warning' },
  paid: { label: 'Ödendi', variant: 'warning' },
  fulfilled: { label: 'Teslim Edildi', variant: 'success' },
  cancelled: { label: 'İptal', variant: 'danger' },
};

const FILTERS: Array<{ value: 'all' | Order['status']; label: string }> = [
  { value: 'all', label: 'Tümü' },
  { value: 'pending', label: 'Bekliyor' },
  { value: 'paid', label: 'Ödendi' },
  { value: 'fulfilled', label: 'Teslim Edildi' },
  { value: 'cancelled', label: 'İptal' },
];

export default function DashboardOrdersPage() {
  const [filter, setFilter] = React.useState<'all' | Order['status']>('all');
  const [page, setPage] = React.useState(1);
  const perPage = 10;

  const filtered = filter === 'all' ? MOCK_ORDERS : MOCK_ORDERS.filter((o) => o.status === filter);
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

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

      {paged.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="Bu filtreyle sipariş yok"
          description="Farklı bir filtre seçerek tekrar dene."
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
                    <th className="px-4 py-3">Durum</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((o) => {
                    const s = STATUS_MAP[o.status];
                    return (
                      <tr key={o.id} className="border-b border-cyber-cyan/10 transition-colors hover:bg-cyber-cyan/5">
                        <td className="px-4 py-3 font-mono text-cyber-cyan">{o.id}</td>
                        <td className="px-4 py-3 text-white/70">{o.date}</td>
                        <td className="px-4 py-3 text-white">
                          {o.products.map((p) => (
                            <div key={p.name} className="text-xs">
                              {p.qty > 1 && <span className="text-white/50">{p.qty}x </span>}
                              {p.name}
                            </div>
                          ))}
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-white">
                          ₺{o.total.toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={s.variant} size="sm">{s.label}</Badge>
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
            Sayfa {page} / {totalPages}
          </p>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              <ChevronLeft className="h-4 w-4" />
              Önceki
            </Button>
            <Button variant="ghost" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
              Sonraki
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
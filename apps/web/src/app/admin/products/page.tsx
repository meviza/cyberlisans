'use client';

import * as React from 'react';
import Link from 'next/link';
import { Badge, Button } from '@cyberlisans/ui/atoms';
import { Package, Plus, Search } from 'lucide-react';
import { PageHeader } from '@/components/admin/page-header';
import { AdminTableShell, getAdminErrorMessage } from '@/components/admin/simple-admin-table';
import { apiFetch } from '@/lib/api-client';
import { formatCurrency, formatDateTime, formatNumber } from '@/lib/format';

interface AdminProductRow {
  id: string;
  slug: string;
  title: string;
  category: string;
  brand: string | null;
  stock: number;
  availableKeys: number;
  priceTry: number;
  deliveryType: string;
  isActive: boolean;
  isFeatured: boolean;
  updatedAt: string;
}

export default function AdminProductsPage() {
  const [items, setItems] = React.useState<AdminProductRow[] | null>(null);
  const [total, setTotal] = React.useState(0);
  const [search, setSearch] = React.useState('');
  const [stockView, setStockView] = React.useState<'all' | 'low'>('all');
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setError(null);
    try {
      const qs = new URLSearchParams({ page: '1', limit: '50' });
      if (search.trim()) qs.set('search', search.trim());
      if (stockView === 'low') qs.set('maxStock', '10');
      const res = await apiFetch<{ items: AdminProductRow[]; total: number }>(
        `/api/admin/products?${qs.toString()}`,
      );
      setItems(res.items);
      setTotal(res.total);
    } catch (err) {
      setError(getAdminErrorMessage(err, 'Ürünler yüklenemedi'));
      setItems([]);
    }
  }, [search, stockView]);

  React.useEffect(() => {
    load();
  }, [load]);

  const activeCount = items?.filter((item) => item.isActive).length ?? 0;
  const lowStockCount = items?.filter((item) => item.stock <= 10).length ?? 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ürünler"
        description="Katalog, stok ve dijital teslimat envanterini tek merkezden izle"
        crumbs={[{ href: '/admin/products', label: 'Ürünler' }]}
        actions={
          <Button type="button" variant="outline" disabled>
            <Plus className="h-4 w-4" />
            Yeni Ürün
          </Button>
        }
      />

      <div className="grid gap-3 md:grid-cols-3">
        <Metric label="Toplam Ürün" value={total} tone="cyan" />
        <Metric label="Aktif Katalog" value={activeCount} tone="lime" />
        <Metric label="Düşük Stok" value={lowStockCount} tone="magenta" />
      </div>

      <div className="flex flex-wrap items-end gap-3 rounded-lg border border-cyber-cyan/20 bg-cyber-darker/50 p-4">
        <div className="min-w-[240px] flex-1">
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/60">
            Ara
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cyber-cyan/60" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Ürün, slug, kategori veya marka"
              className="h-10 w-full rounded-md border border-cyber-cyan/30 bg-cyber-darker px-3 pl-9 text-sm text-white outline-none focus:border-cyber-cyan"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant={stockView === 'all' ? 'primary' : 'outline'}
            onClick={() => setStockView('all')}
          >
            Tümü
          </Button>
          <Button
            type="button"
            variant={stockView === 'low' ? 'secondary' : 'outline'}
            onClick={() => setStockView('low')}
          >
            Düşük Stok
          </Button>
        </div>
      </div>

      <AdminTableShell
        title="Katalog Envanteri"
        description="Fiyat, stok, key havuzu ve görünürlük durumu"
        count={total}
        loading={items === null && !error}
        error={error}
        onRetry={load}
      >
        {items && items.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-cyber-cyan/10 text-sm">
              <thead className="bg-cyber-cyan/5 text-left text-xs uppercase tracking-wider text-white/50">
                <tr>
                  <th className="px-5 py-3">Ürün</th>
                  <th className="px-5 py-3">Kategori</th>
                  <th className="px-5 py-3">Fiyat</th>
                  <th className="px-5 py-3">Stok</th>
                  <th className="px-5 py-3">Durum</th>
                  <th className="px-5 py-3">Güncelleme</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cyber-cyan/10">
                {items.map((item) => (
                  <tr key={item.id} className="transition-colors hover:bg-cyber-cyan/5">
                    <td className="px-5 py-4">
                      <Link
                        href={`/admin/products/${item.id}`}
                        className="font-medium text-white hover:text-cyber-cyan"
                      >
                        {item.title}
                      </Link>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-white/45">
                        <span>{item.slug}</span>
                        {item.isFeatured && (
                          <Badge size="sm" variant="magenta">
                            Öne çıkan
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-white/70">
                      <div>{item.category}</div>
                      <div className="text-xs text-white/40">{item.brand ?? 'Markasız'}</div>
                    </td>
                    <td className="px-5 py-4 font-mono text-cyber-cyan">
                      {formatCurrency(item.priceTry, 'TRY')}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-2">
                        <Badge
                          variant={
                            item.stock <= 3 ? 'danger' : item.stock <= 10 ? 'warning' : 'success'
                          }
                        >
                          {formatNumber(item.stock)} stok
                        </Badge>
                        <Badge variant="outline">{formatNumber(item.availableKeys)} key</Badge>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <Badge variant={item.isActive ? 'success' : 'outline'}>
                        {item.isActive ? 'Aktif' : 'Pasif'}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-xs text-white/50">
                      {formatDateTime(item.updatedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyCatalog message="Filtrelere uygun ürün bulunamadı" />
        )}
      </AdminTableShell>
    </div>
  );
}

function Metric({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: 'cyan' | 'lime' | 'magenta';
}) {
  const toneClass = {
    cyan: 'border-cyber-cyan/30 bg-cyber-cyan/5 text-cyber-cyan',
    lime: 'border-cyber-lime/30 bg-cyber-lime/5 text-cyber-lime',
    magenta: 'border-cyber-magenta/30 bg-cyber-magenta/5 text-cyber-magenta',
  }[tone];
  return (
    <div className={`rounded-lg border p-4 ${toneClass}`}>
      <p className="text-xs uppercase tracking-wider text-white/50">{label}</p>
      <p className="mt-2 font-orbitron text-2xl font-black">{formatNumber(value)}</p>
    </div>
  );
}

function EmptyCatalog({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 p-10 text-center text-white/60">
      <Package className="h-10 w-10 text-cyber-cyan/40" />
      <p>{message}</p>
    </div>
  );
}

'use client';

import * as React from 'react';
import Link from 'next/link';
import { AlertTriangle, Package } from 'lucide-react';
import { Card, CardContent, Badge } from '@cyberlisans/ui/atoms';
import { Spinner } from '@cyberlisans/ui/atoms';
import { apiFetch, ApiError } from '@/lib/api-client';
import { formatNumber } from '@/lib/format';

export interface LowStockProduct {
  id: string;
  title: string;
  slug?: string;
  stock: number;
  category?: string;
  brand?: string;
}

export function LowStockAlert({
  threshold = 10,
  limit = 8,
}: {
  threshold?: number;
  limit?: number;
}) {
  const [data, setData] = React.useState<LowStockProduct[] | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setError(null);
    try {
      const res = await apiFetch<{ items?: LowStockProduct[] }>(
        `/api/admin/products?maxStock=${threshold}&limit=100`,
      );
      const items = (res.items ?? []).filter((p) => p.stock < threshold).slice(0, limit);
      setData(items);
    } catch (e) {
      if (e instanceof ApiError) setError(e.message);
      else setError('Yüklenemedi');
      setData([]);
    }
  }, [threshold, limit]);

  React.useEffect(() => {
    load();
  }, [load]);

  const empty = data !== null && data.length === 0 && !error;

  return (
    <Card>
      <CardContent className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-md border border-cyber-magenta/30 bg-cyber-magenta/10 p-1.5 text-cyber-magenta">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-orbitron text-sm font-bold uppercase tracking-wider text-white">
                Düşük Stok Uyarısı
              </h3>
              <p className="mt-0.5 text-xs text-white/50">Stok &lt; {threshold} olan ürünler</p>
            </div>
          </div>
          <Link
            href="/admin/products?stock=low"
            className="text-xs text-cyber-cyan transition-colors hover:text-cyber-magenta"
          >
            Tümünü Gör →
          </Link>
        </div>

        {data === null && !error && (
          <div className="flex h-32 items-center justify-center">
            <Spinner size="md" />
          </div>
        )}

        {error && (
          <div className="rounded-md border border-cyber-magenta/30 bg-cyber-magenta/5 p-3 text-sm text-cyber-magenta">
            {error}
          </div>
        )}

        {empty && (
          <div className="flex flex-col items-center justify-center gap-2 rounded-md border border-dashed border-cyber-lime/20 p-6 text-center">
            <div className="rounded-full border border-cyber-lime/30 bg-cyber-lime/5 p-2 text-cyber-lime">
              <Package className="h-5 w-5" />
            </div>
            <p className="text-sm text-cyber-lime">Tüm stoklar yeterli seviyede</p>
            <p className="text-xs text-white/50">Şu anda uyarı gerektiren ürün yok</p>
          </div>
        )}

        {data && data.length > 0 && (
          <ul className="space-y-2">
            {data.map((p) => {
              const critical = p.stock <= 3;
              return (
                <li
                  key={p.id}
                  className={`flex items-center justify-between gap-3 rounded-md border px-3 py-2 ${
                    critical
                      ? 'border-cyber-magenta/30 bg-cyber-magenta/5'
                      : 'border-cyber-cyan/20 bg-cyber-cyan/5'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/admin/products/${p.id}`}
                      className="block truncate text-sm font-medium text-white hover:text-cyber-cyan"
                    >
                      {p.title}
                    </Link>
                    <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] text-white/50">
                      {p.brand && <span>{p.brand}</span>}
                      {p.category && <span>• {p.category}</span>}
                    </div>
                  </div>
                  <Badge variant={critical ? 'danger' : 'warning'} size="sm">
                    {formatNumber(p.stock)} adet
                  </Badge>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

'use client';

import * as React from 'react';
import { Badge, Button } from '@cyberlisans/ui/atoms';
import { Award, ExternalLink, Plus } from 'lucide-react';
import { PageHeader } from '@/components/admin/page-header';
import { AdminTableShell, getAdminErrorMessage } from '@/components/admin/simple-admin-table';
import { apiFetch } from '@/lib/api-client';
import { formatDateTime, formatNumber } from '@/lib/format';

interface BrandRow {
  id: string;
  slug: string;
  name: string;
  logoUrl: string | null;
  websiteUrl: string | null;
  isActive: boolean;
  updatedAt: string;
}

export default function AdminBrandsPage() {
  const [items, setItems] = React.useState<BrandRow[] | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setError(null);
    try {
      const res = await apiFetch<{ items: BrandRow[] }>('/api/admin/brands');
      setItems(res.items);
    } catch (err) {
      setError(getAdminErrorMessage(err, 'Markalar yüklenemedi'));
      setItems([]);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Markalar"
        description="Lisans sağlayıcıları, ürün aileleri ve marka görünürlüğünü yönet"
        crumbs={[{ href: '/admin/brands', label: 'Markalar' }]}
        actions={
          <Button type="button" variant="outline" disabled>
            <Plus className="h-4 w-4" />
            Yeni Marka
          </Button>
        }
      />

      <div className="grid gap-3 md:grid-cols-3">
        <Metric label="Toplam Marka" value={items?.length ?? 0} />
        <Metric label="Aktif" value={items?.filter((item) => item.isActive).length ?? 0} />
        <Metric
          label="Web Sitesi Olan"
          value={items?.filter((item) => item.websiteUrl).length ?? 0}
        />
      </div>

      <AdminTableShell
        title="Marka Kütüphanesi"
        description="Marka kimliği, dış bağlantılar ve katalog görünürlüğü"
        count={items?.length}
        loading={items === null && !error}
        error={error}
        onRetry={load}
      >
        {items && items.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-cyber-cyan/10 text-sm">
              <thead className="bg-cyber-cyan/5 text-left text-xs uppercase tracking-wider text-white/50">
                <tr>
                  <th className="px-5 py-3">Marka</th>
                  <th className="px-5 py-3">Slug</th>
                  <th className="px-5 py-3">Web</th>
                  <th className="px-5 py-3">Durum</th>
                  <th className="px-5 py-3">Güncelleme</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cyber-cyan/10">
                {items.map((item) => (
                  <tr key={item.id} className="transition-colors hover:bg-cyber-cyan/5">
                    <td className="px-5 py-4">
                      <div className="font-medium text-white">{item.name}</div>
                      <div className="mt-1 text-xs text-white/45">
                        {item.logoUrl ? 'Logo tanımlı' : 'Logo yok'}
                      </div>
                    </td>
                    <td className="px-5 py-4 font-mono text-xs text-cyber-cyan">{item.slug}</td>
                    <td className="px-5 py-4">
                      {item.websiteUrl ? (
                        <a
                          href={item.websiteUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-cyber-cyan hover:text-cyber-magenta"
                        >
                          Site
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      ) : (
                        <span className="text-white/40">-</span>
                      )}
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
          <Empty message="Henüz marka bulunmuyor" />
        )}
      </AdminTableShell>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-cyber-magenta/30 bg-cyber-magenta/5 p-4 text-cyber-magenta">
      <p className="text-xs uppercase tracking-wider text-white/50">{label}</p>
      <p className="mt-2 font-orbitron text-2xl font-black">{formatNumber(value)}</p>
    </div>
  );
}

function Empty({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 p-10 text-center text-white/60">
      <Award className="h-10 w-10 text-cyber-magenta/40" />
      <p>{message}</p>
    </div>
  );
}

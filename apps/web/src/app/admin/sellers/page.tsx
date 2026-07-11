'use client';

import * as React from 'react';
import Link from 'next/link';
import { Store, Loader2, CheckCircle2, XCircle, ExternalLink } from 'lucide-react';
import { Spinner, Badge, Button } from '@cyberlisans/ui/atoms';
import { apiFetch, ApiError } from '@/lib/api-client';
import { EmptyState } from '@/components/store/empty-state';

type SellerStatus = 'PENDING' | 'APPROVED' | 'SUSPENDED' | 'REJECTED';

interface AdminSeller {
  id: string;
  slug: string;
  companyName: string;
  taxId?: string;
  status: SellerStatus;
  kycStatus?: string;
  phone?: string | null;
  websiteUrl?: string | null;
  createdAt: string;
  user?: { email?: string; username?: string };
}

const STATUS_LABEL: Record<SellerStatus, string> = {
  PENDING: 'Bekliyor',
  APPROVED: 'Onaylı',
  SUSPENDED: 'Askıda',
  REJECTED: 'Reddedildi',
};

const STATUS_VARIANT: Record<SellerStatus, 'warning' | 'success' | 'danger' | 'default'> = {
  PENDING: 'warning',
  APPROVED: 'success',
  SUSPENDED: 'danger',
  REJECTED: 'default',
};

export default function AdminSellersPage() {
  const [status, setStatus] = React.useState<SellerStatus | 'ALL'>('PENDING');
  const [items, setItems] = React.useState<AdminSeller[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [refresh, setRefresh] = React.useState(0);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const path =
          status === 'PENDING'
            ? '/admin/sellers/pending?page=1&limit=50'
            : `/admin/sellers?page=1&limit=50${status !== 'ALL' ? `&status=${status}` : ''}`;
        const res = await apiFetch<{ items: AdminSeller[] } | AdminSeller[]>(path);
        const list = Array.isArray(res) ? res : (res.items ?? []);
        if (!cancelled) setItems(list);
      } catch (err) {
        if (!cancelled) {
          setItems([]);
          setError(err instanceof ApiError ? err.message : 'Satıcılar yüklenemedi');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [status, refresh]);

  const approve = async (id: string) => {
    setBusyId(id);
    try {
      await apiFetch(`/admin/sellers/${id}/approve`, {
        method: 'POST',
        body: JSON.stringify({ notes: 'Admin panelinden onay' }),
      });
      setRefresh((k) => k + 1);
    } catch (err) {
      window.alert(err instanceof ApiError ? err.message : 'Onay başarısız');
    } finally {
      setBusyId(null);
    }
  };

  const reject = async (id: string) => {
    const reason = window.prompt('Red sebebi (en az 5 karakter):');
    if (!reason || reason.trim().length < 5) return;
    setBusyId(id);
    try {
      await apiFetch(`/admin/sellers/${id}/reject`, {
        method: 'POST',
        body: JSON.stringify({ reason: reason.trim() }),
      });
      setRefresh((k) => k + 1);
    } catch (err) {
      window.alert(err instanceof ApiError ? err.message : 'Red başarısız');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white">Satıcılar / KYC</h1>
        <p className="mt-1 text-sm text-brand-text-secondary">
          Başvuruları incele, onayla veya reddet
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {(['PENDING', 'APPROVED', 'SUSPENDED', 'REJECTED', 'ALL'] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatus(s)}
            className={
              status === s
                ? 'rounded-lg bg-brand-accent/20 px-3 py-1.5 text-xs font-semibold text-brand-accent'
                : 'rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/70 hover:border-white/25'
            }
          >
            {s === 'ALL' ? 'Tümü' : STATUS_LABEL[s]}
          </button>
        ))}
      </div>

      {error && (
        <div className="rounded-xl border border-brand-danger/30 bg-brand-danger/10 px-4 py-3 text-sm text-brand-danger">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex min-h-[30vh] items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : items.length === 0 ? (
        <EmptyState icon={Store} title="Satıcı yok" description="Bu filtrede başvuru bulunamadı." />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/[0.08]">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/[0.03] text-xs uppercase tracking-wider text-white/50">
              <tr>
                <th className="px-4 py-3">Şirket</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3">Durum</th>
                <th className="px-4 py-3">Tarih</th>
                <th className="px-4 py-3 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {items.map((s) => (
                <tr key={s.id} className="hover:bg-white/[0.02]">
                  <td className="px-4 py-3">
                    <div className="font-medium text-white">{s.companyName}</div>
                    <div className="text-xs text-white/50">{s.user?.email ?? s.taxId ?? '—'}</div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-brand-accent">{s.slug}</td>
                  <td className="px-4 py-3">
                    <Badge variant={STATUS_VARIANT[s.status]} size="sm">
                      {STATUS_LABEL[s.status]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-xs text-white/50">
                    {new Date(s.createdAt).toLocaleDateString('tr-TR')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/sellers/${s.id}`}
                        className="rounded-md border border-white/10 p-1.5 text-white/70 hover:border-brand-accent/40 hover:text-brand-accent"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                      {s.status === 'PENDING' && (
                        <>
                          <Button
                            size="sm"
                            disabled={busyId === s.id}
                            onClick={() => approve(s.id)}
                          >
                            {busyId === s.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            )}
                            Onayla
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={busyId === s.id}
                            onClick={() => reject(s.id)}
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            Red
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

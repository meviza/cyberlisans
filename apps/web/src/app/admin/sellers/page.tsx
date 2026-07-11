'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Store,
  Loader2,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Search,
  RefreshCw,
} from 'lucide-react';
import { Spinner, Badge, Button, Input } from '@cyberlisans/ui/atoms';
import { ApiError } from '@/lib/api-client';
import { EmptyState } from '@/components/store/empty-state';
import { PageHeader } from '@/components/admin/page-header';
import { SellerReviewStats } from '@/components/admin/sellers/seller-review-stats';
import {
  SellerActionModal,
  type SellerActionKind,
} from '@/components/admin/sellers/seller-action-modal';
import {
  type AdminSeller,
  type AdminSellerStatus,
  type AdminSellerStatusCounts,
  SELLER_STATUS_LABEL,
  SELLER_STATUS_VARIANT,
  fetchAdminSellers,
  fetchSellerStatusCounts,
  approveSeller,
  rejectSeller,
} from '@/lib/api/admin-sellers';

type FilterStatus = AdminSellerStatus | 'ALL';

export default function AdminSellersPage() {
  const [status, setStatus] = React.useState<FilterStatus>('PENDING');
  const [search, setSearch] = React.useState('');
  const [query, setQuery] = React.useState('');
  const [items, setItems] = React.useState<AdminSeller[]>([]);
  const [total, setTotal] = React.useState(0);
  const [counts, setCounts] = React.useState<AdminSellerStatusCounts | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [modal, setModal] = React.useState<{
    kind: SellerActionKind;
    seller: AdminSeller;
  } | null>(null);
  const [refreshKey, setRefreshKey] = React.useState(0);

  const reload = React.useCallback(() => setRefreshKey((k) => k + 1), []);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [listRes, statsRes] = await Promise.all([
          fetchAdminSellers({
            status,
            search: query || undefined,
            page: 1,
            limit: 50,
          }),
          fetchSellerStatusCounts(),
        ]);
        if (cancelled) return;
        setItems(listRes.items ?? []);
        setTotal(listRes.total ?? listRes.items?.length ?? 0);
        setCounts(statsRes);
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
  }, [status, query, refreshKey]);

  const onModalConfirm = async (payload: { notes?: string; reason?: string }) => {
    if (!modal) return;
    const { seller, kind } = modal;
    setBusyId(seller.id);
    try {
      if (kind === 'approve') await approveSeller(seller.id, payload.notes);
      else if (kind === 'reject') await rejectSeller(seller.id, payload.reason ?? '');
      setModal(null);
      reload();
    } catch (err) {
      throw new Error(err instanceof ApiError ? err.message : 'İşlem başarısız');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Satıcı Başvuruları"
        description="KYC ve mağaza başvurularını incele, onayla veya reddet"
        crumbs={[{ href: '/admin/sellers', label: 'Satıcılar / KYC' }]}
        actions={
          <Button variant="outline" size="sm" onClick={reload} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Yenile
          </Button>
        }
      />

      <SellerReviewStats counts={counts} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {(['PENDING', 'APPROVED', 'SUSPENDED', 'REJECTED', 'ALL'] as const).map((s) => {
            const count =
              s === 'ALL' ? counts?.total : counts ? counts[s as AdminSellerStatus] : undefined;
            return (
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
                {s === 'ALL' ? 'Tümü' : SELLER_STATUS_LABEL[s]}
                {typeof count === 'number' ? (
                  <span className="ml-1.5 tabular-nums text-white/50">{count}</span>
                ) : null}
              </button>
            );
          })}
        </div>

        <form
          className="relative w-full sm:w-72"
          onSubmit={(e) => {
            e.preventDefault();
            setQuery(search.trim());
          }}
        >
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Şirket, slug, vergi no…"
            className="pl-9"
          />
        </form>
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
        <EmptyState
          icon={Store}
          title="Kayıt yok"
          description={
            status === 'PENDING'
              ? 'İnceleme bekleyen satıcı başvurusu bulunmuyor.'
              : 'Bu filtrede satıcı bulunamadı.'
          }
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/[0.08]">
          <div className="flex items-center justify-between border-b border-white/[0.06] bg-white/[0.02] px-4 py-2 text-xs text-white/50">
            <span>
              {total} kayıt · gösterilen {items.length}
            </span>
            {status === 'PENDING' && (
              <span className="text-amber-300/90">
                Önce detay sayfasından belge / bilgileri kontrol edin
              </span>
            )}
          </div>
          <table className="w-full text-left text-sm">
            <thead className="bg-white/[0.03] text-xs uppercase tracking-wider text-white/50">
              <tr>
                <th className="px-4 py-3">Şirket / hesap</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3">KYC</th>
                <th className="px-4 py-3">Durum</th>
                <th className="px-4 py-3">Başvuru</th>
                <th className="px-4 py-3 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {items.map((s) => (
                <tr key={s.id} className="hover:bg-white/[0.02]">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/sellers/${s.id}`}
                      className="font-medium text-white hover:text-brand-accent"
                    >
                      {s.companyName}
                    </Link>
                    <div className="text-xs text-white/50">
                      {s.user?.email ?? s.taxId ?? '—'}
                      {s.user?.username ? (
                        <span className="text-white/35"> · @{s.user.username}</span>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-brand-accent">{s.slug}</td>
                  <td className="px-4 py-3 text-xs text-white/60">{s.kycStatus ?? '—'}</td>
                  <td className="px-4 py-3">
                    <Badge variant={SELLER_STATUS_VARIANT[s.status]} size="sm">
                      {SELLER_STATUS_LABEL[s.status]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-xs text-white/50">
                    {new Date(s.createdAt).toLocaleString('tr-TR', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/sellers/${s.id}`}
                        className="inline-flex items-center gap-1 rounded-md border border-white/10 px-2 py-1.5 text-xs text-white/80 hover:border-brand-accent/40 hover:text-brand-accent"
                      >
                        İncele
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                      {s.status === 'PENDING' && (
                        <>
                          <Button
                            size="sm"
                            disabled={busyId === s.id}
                            onClick={() => setModal({ kind: 'approve', seller: s })}
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
                            onClick={() => setModal({ kind: 'reject', seller: s })}
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

      {modal && (
        <SellerActionModal
          open
          kind={modal.kind}
          companyName={modal.seller.companyName}
          busy={busyId === modal.seller.id}
          onClose={() => setModal(null)}
          onConfirm={onModalConfirm}
        />
      )}
    </div>
  );
}

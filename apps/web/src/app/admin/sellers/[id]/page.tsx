'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Pause,
  Play,
  Loader2,
  ExternalLink,
  Building2,
  User,
  FileText,
  Clock,
} from 'lucide-react';
import { Spinner, Badge, Button, Card, CardContent } from '@cyberlisans/ui/atoms';
import { ApiError } from '@/lib/api-client';
import { PageHeader } from '@/components/admin/page-header';
import {
  SellerActionModal,
  type SellerActionKind,
} from '@/components/admin/sellers/seller-action-modal';
import {
  type AdminSeller,
  SELLER_STATUS_LABEL,
  SELLER_STATUS_VARIANT,
  fetchAdminSeller,
  approveSeller,
  rejectSeller,
  suspendSeller,
  reactivateSeller,
} from '@/lib/api/admin-sellers';

export default function AdminSellerDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id;
  const [data, setData] = React.useState<AdminSeller | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [modal, setModal] = React.useState<SellerActionKind | null>(null);

  const load = React.useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await fetchAdminSeller(id);
      setData(res);
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Yüklenemedi');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const onConfirm = async (payload: { notes?: string; reason?: string }) => {
    if (!id || !modal) return;
    setBusy(true);
    try {
      if (modal === 'approve') await approveSeller(id, payload.notes);
      else if (modal === 'reject') await rejectSeller(id, payload.reason ?? '');
      else if (modal === 'suspend') await suspendSeller(id, payload.reason ?? '');
      setModal(null);
      await load();
    } catch (err) {
      throw new Error(err instanceof ApiError ? err.message : 'İşlem başarısız');
    } finally {
      setBusy(false);
    }
  };

  const onReactivate = async () => {
    if (!id) return;
    if (!window.confirm('Satıcıyı yeniden aktifleştirmek istiyor musunuz?')) return;
    setBusy(true);
    try {
      await reactivateSeller(id);
      await load();
    } catch (err) {
      window.alert(err instanceof ApiError ? err.message : 'İşlem başarısız');
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-4">
        <Link href="/admin/sellers" className="text-sm text-brand-accent hover:underline">
          ← Satıcılara dön
        </Link>
        <p className="text-brand-danger">{error ?? 'Bulunamadı'}</p>
      </div>
    );
  }

  const commission =
    data.commissionRate > 0 && data.commissionRate <= 1
      ? data.commissionRate * 100
      : data.commissionRate;

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={() => router.push('/admin/sellers')}
        className="inline-flex items-center gap-2 text-sm text-brand-accent hover:underline"
      >
        <ArrowLeft className="h-4 w-4" /> Satıcı listesine dön
      </button>

      <PageHeader
        title={data.companyName}
        description={`Başvuru inceleme · /${data.slug}`}
        crumbs={[
          { href: '/admin/sellers', label: 'Satıcılar / KYC' },
          { href: `/admin/sellers/${data.id}`, label: data.companyName },
        ]}
        actions={
          <Badge variant={SELLER_STATUS_VARIANT[data.status]} size="lg">
            {SELLER_STATUS_LABEL[data.status]}
          </Badge>
        }
      />

      {data.status === 'PENDING' && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-400/25 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
          <Clock className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
          <p>
            Bu başvuru onay bekliyor. Vergi bilgileri ve iletişim alanlarını kontrol edip onaylayın
            veya red sebebiyle reddedin.
          </p>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent className="space-y-5 p-6">
            <SectionTitle icon={Building2} title="Şirket bilgileri" />
            <div className="grid gap-3 sm:grid-cols-2">
              <Row label="Şirket adı" value={data.companyName} />
              <Row label="Mağaza slug" value={data.slug} mono />
              <Row label="Vergi no / VKN" value={data.taxId} />
              <Row label="Vergi dairesi" value={data.taxOffice} />
              <Row label="Telefon" value={data.phone} />
              <Row label="Web sitesi" value={data.websiteUrl} href={data.websiteUrl ?? undefined} />
              <Row label="Adres" value={data.address} className="sm:col-span-2" />
            </div>

            <SectionTitle icon={FileText} title="Mağaza tanıtımı" />
            <p className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4 text-sm leading-relaxed text-white/75">
              {data.bio?.trim() || 'Satıcı bio girmemiş.'}
            </p>

            {(data.rejectionReason || data.notes) && (
              <>
                <SectionTitle icon={FileText} title="Kayıt notları" />
                {data.rejectionReason && (
                  <p className="rounded-lg border border-brand-danger/25 bg-brand-danger/10 px-3 py-2 text-sm text-brand-danger">
                    Red / askı sebebi: {data.rejectionReason}
                  </p>
                )}
                {data.notes && (
                  <p className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white/70">
                    Admin notu: {data.notes}
                  </p>
                )}
              </>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardContent className="space-y-3 p-6">
              <SectionTitle icon={User} title="Hesap" />
              <Row label="E-posta" value={data.user?.email} />
              <Row
                label="Kullanıcı adı"
                value={data.user?.username ? `@${data.user.username}` : null}
              />
              <Row label="Görünen ad" value={data.user?.displayName} />
              <Row label="User ID" value={data.userId} mono />
              {data.slug && (
                <Link
                  href={`/s/${data.slug}`}
                  target="_blank"
                  className="mt-2 inline-flex items-center gap-1 text-sm text-brand-accent hover:underline"
                >
                  Genel mağaza sayfası <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-3 p-6">
              <SectionTitle icon={FileText} title="Durum & komisyon" />
              <Row label="Durum" value={SELLER_STATUS_LABEL[data.status]} />
              <Row label="KYC" value={data.kycStatus} />
              <Row label="Komisyon" value={`%${Number(commission).toFixed(0)}`} />
              <Row label="Bakiye" value={`₺${Number(data.balance ?? 0).toLocaleString('tr-TR')}`} />
              <Row label="Başvuru" value={new Date(data.createdAt).toLocaleString('tr-TR')} />
              {data.approvedAt && (
                <Row label="Onay" value={new Date(data.approvedAt).toLocaleString('tr-TR')} />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-3 p-6">
              <h3 className="text-sm font-semibold text-white">İnceleme aksiyonları</h3>
              <div className="flex flex-col gap-2">
                {data.status === 'PENDING' && (
                  <>
                    <Button disabled={busy} onClick={() => setModal('approve')}>
                      {busy ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4" />
                      )}
                      Başvuruyu onayla
                    </Button>
                    <Button variant="outline" disabled={busy} onClick={() => setModal('reject')}>
                      <XCircle className="h-4 w-4" /> Reddet
                    </Button>
                  </>
                )}
                {data.status === 'APPROVED' && (
                  <Button variant="outline" disabled={busy} onClick={() => setModal('suspend')}>
                    <Pause className="h-4 w-4" /> Askıya al
                  </Button>
                )}
                {data.status === 'SUSPENDED' && (
                  <Button disabled={busy} onClick={() => void onReactivate()}>
                    {busy ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                    Yeniden aktifleştir
                  </Button>
                )}
                {data.status === 'REJECTED' && (
                  <p className="text-xs text-white/50">
                    Reddedilen başvuru için satıcının yeni başvuru akışı gerekir.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {modal && (
        <SellerActionModal
          open
          kind={modal}
          companyName={data.companyName}
          busy={busy}
          onClose={() => setModal(null)}
          onConfirm={onConfirm}
        />
      )}
    </div>
  );
}

function SectionTitle({
  icon: Icon,
  title,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
}) {
  return (
    <div className="flex items-center gap-2 text-white">
      <Icon className="h-4 w-4 text-brand-accent" />
      <h2 className="text-sm font-semibold tracking-wide">{title}</h2>
    </div>
  );
}

function Row({
  label,
  value,
  mono,
  href,
  className,
}: {
  label: string;
  value?: string | null;
  mono?: boolean;
  href?: string;
  className?: string;
}) {
  const display = value?.trim() ? value : '—';
  return (
    <div className={className}>
      <p className="text-[11px] uppercase tracking-wider text-white/40">{label}</p>
      {href && value ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-0.5 break-all text-sm text-brand-accent hover:underline"
        >
          {display}
        </a>
      ) : (
        <p
          className={`mt-0.5 break-all text-sm text-white ${mono ? 'font-mono text-xs text-white/80' : ''}`}
        >
          {display}
        </p>
      )}
    </div>
  );
}

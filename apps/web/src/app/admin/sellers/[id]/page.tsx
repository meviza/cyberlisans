'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, XCircle, Pause, Play, Loader2 } from 'lucide-react';
import { Spinner, Badge, Button, Card, CardContent } from '@cyberlisans/ui/atoms';
import { apiFetch, ApiError } from '@/lib/api-client';

type SellerStatus = 'PENDING' | 'APPROVED' | 'SUSPENDED' | 'REJECTED';

interface SellerDetail {
  id: string;
  slug: string;
  companyName: string;
  taxId?: string;
  taxOffice?: string | null;
  address?: string | null;
  phone?: string | null;
  websiteUrl?: string | null;
  bio?: string | null;
  status: SellerStatus;
  kycStatus?: string;
  rejectionReason?: string | null;
  notes?: string | null;
  commissionRate?: number;
  createdAt: string;
  user?: { id?: string; email?: string; username?: string };
}

export default function AdminSellerDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id;
  const [data, setData] = React.useState<SellerDetail | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  const load = React.useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await apiFetch<SellerDetail>(`/admin/sellers/${id}`);
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

  const act = async (action: 'approve' | 'reject' | 'suspend' | 'reactivate') => {
    if (!id) return;
    let body: Record<string, string> = {};
    if (action === 'reject' || action === 'suspend') {
      const reason = window.prompt(
        action === 'reject' ? 'Red sebebi (min 5):' : 'Askı sebebi (min 5):',
      );
      if (!reason || reason.trim().length < 5) return;
      body = { reason: reason.trim() };
    } else if (action === 'approve') {
      body = { notes: 'Detay sayfasından onay' };
    }
    setBusy(true);
    try {
      await apiFetch(`/admin/sellers/${id}/${action}`, {
        method: 'POST',
        body: JSON.stringify(body),
      });
      await load();
    } catch (err) {
      window.alert(err instanceof ApiError ? err.message : 'İşlem başarısız');
    } finally {
      setBusy(false);
    }
  };

  if (loading)
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );

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

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={() => router.push('/admin/sellers')}
        className="inline-flex items-center gap-2 text-sm text-brand-accent hover:underline"
      >
        <ArrowLeft className="h-4 w-4" /> Satıcılara dön
      </button>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">{data.companyName}</h1>
          <p className="mt-1 font-mono text-sm text-brand-accent">/{data.slug}</p>
        </div>
        <Badge
          variant={
            data.status === 'APPROVED'
              ? 'success'
              : data.status === 'PENDING'
                ? 'warning'
                : data.status === 'SUSPENDED'
                  ? 'danger'
                  : 'default'
          }
        >
          {data.status}
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="space-y-2 p-5 text-sm">
            <h2 className="font-semibold text-white">Kimlik</h2>
            <Row label="Vergi no" value={data.taxId} />
            <Row label="Vergi dairesi" value={data.taxOffice} />
            <Row label="Telefon" value={data.phone} />
            <Row label="Web" value={data.websiteUrl} />
            <Row label="Adres" value={data.address} />
            <Row label="E-posta" value={data.user?.email} />
            <Row label="KYC" value={data.kycStatus} />
            <Row
              label="Komisyon"
              value={data.commissionRate !== undefined ? `%${data.commissionRate}` : undefined}
            />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-2 p-5 text-sm">
            <h2 className="font-semibold text-white">Notlar</h2>
            <p className="text-white/70">{data.bio || '—'}</p>
            {data.rejectionReason && (
              <p className="text-brand-danger">Red: {data.rejectionReason}</p>
            )}
            {data.notes && <p className="text-white/50">Admin: {data.notes}</p>}
            <p className="text-xs text-white/40">
              Başvuru: {new Date(data.createdAt).toLocaleString('tr-TR')}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-2">
        {data.status === 'PENDING' && (
          <>
            <Button disabled={busy} onClick={() => act('approve')}>
              {busy ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              Onayla
            </Button>
            <Button variant="outline" disabled={busy} onClick={() => act('reject')}>
              <XCircle className="h-4 w-4" /> Reddet
            </Button>
          </>
        )}
        {data.status === 'APPROVED' && (
          <Button variant="outline" disabled={busy} onClick={() => act('suspend')}>
            <Pause className="h-4 w-4" /> Askıya al
          </Button>
        )}
        {data.status === 'SUSPENDED' && (
          <Button disabled={busy} onClick={() => act('reactivate')}>
            <Play className="h-4 w-4" /> Yeniden aktifleştir
          </Button>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex justify-between gap-4 border-b border-white/[0.05] py-1.5">
      <span className="text-white/50">{label}</span>
      <span className="text-right text-white">{value || '—'}</span>
    </div>
  );
}

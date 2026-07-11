'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { Card, CardContent, Badge, Spinner } from '@cyberlisans/ui/atoms';
import { apiFetch, ApiError } from '@/lib/api-client';
import {
  DisputeMessages,
  type DisputeMessage,
} from '@/components/dashboard/admin/dispute-messages';
import { DisputeResolveForm } from '@/components/dashboard/admin/dispute-resolve-form';
import { formatDateTime } from '@/lib/format';

interface DisputeDetail {
  id: string;
  orderId: string;
  reason: string;
  status: 'OPEN' | 'RESOLVED' | 'CLOSED';
  openedBy: string;
  openedAt: string;
  messages: DisputeMessage[];
}

const STATUS_MAP: Record<
  DisputeDetail['status'],
  { label: string; variant: 'success' | 'warning' | 'danger' | 'default' }
> = {
  OPEN: { label: 'Açık', variant: 'danger' },
  RESOLVED: { label: 'Çözüldü', variant: 'success' },
  CLOSED: { label: 'Kapalı', variant: 'default' },
};

export default function AdminDisputeDetailPage() {
  const params = useParams<{ id: string }>();
  const disputeId = params?.id;
  const [data, setData] = React.useState<DisputeDetail | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!disputeId) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await apiFetch<DisputeDetail>(`/admin/disputes/${disputeId}`);
        if (!cancelled) setData(res);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof ApiError ? err.message : 'İtiraz yüklenemedi');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [disputeId]);

  if (loading)
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  if (error || !data) {
    return (
      <div className="space-y-6">
        <Link
          href="/admin/disputes"
          className="inline-flex items-center gap-2 text-sm text-cyber-cyan hover:text-cyber-magenta"
        >
          <ArrowLeft className="h-4 w-4" />
          Listeye dön
        </Link>
        <div className="flex items-center gap-2 rounded-md border border-cyber-magenta/40 bg-cyber-magenta/10 px-4 py-3 text-sm text-cyber-magenta">
          <AlertCircle className="h-4 w-4" />
          {error ?? 'İtiraz bulunamadı'}
        </div>
      </div>
    );
  }

  const s = STATUS_MAP[data.status];
  return (
    <div className="space-y-6">
      <Link
        href="/admin/disputes"
        className="inline-flex items-center gap-2 text-sm text-cyber-cyan hover:text-cyber-magenta"
      >
        <ArrowLeft className="h-4 w-4" />
        İtirazlara dön
      </Link>
      <Card>
        <CardContent className="space-y-3 p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="font-orbitron text-xl font-black text-white">
                İtiraz #{data.id.slice(0, 8)}
              </h1>
              <p className="text-xs text-white/50">Sipariş: {data.orderId}</p>
            </div>
            <Badge variant={s.variant} size="lg">
              {s.label}
            </Badge>
          </div>
          <div className="grid grid-cols-1 gap-4 border-t border-cyber-cyan/20 pt-4 sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-wider text-white/50">Açan</p>
              <p className="font-medium text-white">{data.openedBy}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-white/50">Tarih</p>
              <p className="font-medium text-white">{formatDateTime(data.openedAt)}</p>
            </div>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-white/50">Sebep</p>
            <p className="text-white">{data.reason}</p>
          </div>
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <DisputeMessages messages={data.messages} />
        <DisputeResolveForm disputeId={data.id} />
      </div>
    </div>
  );
}

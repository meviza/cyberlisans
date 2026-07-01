'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, AlertCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, Spinner } from '@cyberlisans/ui/atoms';
import { apiFetch, ApiError } from '@/lib/api-client';
import { formatCurrency, formatDateTime } from '@/lib/format';
import { PageHeader } from '@/components/admin/page-header';
import { PaymentDetailCard } from '@/components/admin/payment-detail-card';
import { PaymentActionButtons } from '@/components/admin/payment-action-buttons';
import { WebhookLogTimeline, type WebhookEntry } from '@/components/admin/webhook-log-timeline';
import type { AdminPaymentRow } from '@/components/admin/payments-table';

interface PaymentDetailResponse {
  payment: AdminPaymentRow & {
    expiresAt: string | null;
    webhookPayload: unknown;
    metadata: unknown;
    updatedAt: string;
  };
  refunds: Array<{
    id: string;
    amount: number;
    currency: string;
    description: string | null;
    createdAt: string;
  }>;
  audit: WebhookEntry[];
}

export default function AdminPaymentDetailPage() {
  const params = useParams<{ id: string }>();
  const paymentId = params.id;
  const [data, setData] = React.useState<PaymentDetailResponse | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [refreshKey, setRefreshKey] = React.useState(0);

  const load = React.useCallback(async () => {
    if (!paymentId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch<PaymentDetailResponse>(`/api/admin/payments/${paymentId}`);
      setData(res);
    } catch (e) {
      if (e instanceof ApiError) setError(e.message);
      else setError('Yüklenemedi');
    } finally {
      setLoading(false);
    }
  }, [paymentId]);

  React.useEffect(() => {
    load();
  }, [load, refreshKey]);

  if (loading && !data) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-md border border-cyber-magenta/30 bg-cyber-magenta/5 p-6 text-cyber-magenta">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          <p>{error ?? 'Ödeme bulunamadı'}</p>
        </div>
        <Link
          href="/admin/payments"
          className="mt-4 inline-flex items-center gap-1 text-sm text-white/70 hover:text-cyber-cyan"
        >
          <ArrowLeft className="h-4 w-4" /> Listeye dön
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Ödeme ${data.payment.id.slice(0, 8)}`}
        description={`${formatCurrency(data.payment.amount, data.payment.currency)} • ${data.payment.provider}`}
        crumbs={[
          { href: '/admin/payments', label: 'Ödemeler' },
          { href: `/admin/payments/${data.payment.id}`, label: data.payment.id.slice(0, 8) },
        ]}
        actions={
          <PaymentActionButtons
            payment={{
              id: data.payment.id,
              status: data.payment.status,
              amount: data.payment.amount,
              currency: data.payment.currency,
            }}
            onDone={() => setRefreshKey((k) => k + 1)}
          />
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <PaymentDetailCard payment={data.payment} />
          <WebhookLogTimeline entries={data.audit} />
        </div>
        <div className="space-y-6">
          <Card>
            <CardContent className="p-5">
              <h3 className="mb-3 font-orbitron text-sm font-bold uppercase tracking-wider text-white">
                İade Geçmişi
              </h3>
              {data.refunds.length === 0 ? (
                <p className="rounded border border-dashed border-cyber-cyan/20 p-6 text-center text-sm text-white/50">
                  İade yapılmadı
                </p>
              ) : (
                <ul className="space-y-2">
                  {data.refunds.map((r) => (
                    <li
                      key={r.id}
                      className="rounded border border-cyber-cyan/10 bg-cyber-darker/30 p-3"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-white/60">{r.description ?? 'İade'}</span>
                        <span className="font-mono text-cyber-magenta">
                          −{formatCurrency(r.amount, r.currency as 'TRY')}
                        </span>
                      </div>
                      <div className="mt-1 text-[10px] text-white/40">
                        {formatDateTime(r.createdAt)}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          {data.payment.webhookPayload ? (
            <Card>
              <CardContent className="p-5">
                <h3 className="mb-3 font-orbitron text-sm font-bold uppercase tracking-wider text-white">
                  Son Webhook Payload
                </h3>
                <pre className="overflow-x-auto rounded bg-cyber-darker/60 p-3 text-[11px] text-white/70">
                  {JSON.stringify(data.payment.webhookPayload, null, 2)}
                </pre>
              </CardContent>
            </Card>
          ) : null}

          {data.payment.orderId ? (
            <Link
              href={`/admin/orders/${data.payment.orderId}`}
              className="block rounded-lg border border-cyber-cyan/20 bg-cyber-cyan/5 p-4 text-sm text-cyber-cyan transition-colors hover:bg-cyber-cyan/10"
            >
              Siparişe git →
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}

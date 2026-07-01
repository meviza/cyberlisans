import * as React from 'react';
import Link from 'next/link';
import { Card, CardContent, Badge, Separator } from '@cyberlisans/ui/atoms';
import { formatCurrency, formatDateTime } from '@/lib/format';
import type {
  AdminPaymentRow,
  PaymentProvider,
  PaymentStatus,
  PaymentCurrency,
} from './payments-table';

export interface PaymentDetailCardProps {
  payment: AdminPaymentRow & {
    paidAt: string | null;
    refundedAt: string | null;
    expiresAt: string | null;
    webhookPayload: unknown;
    metadata: unknown;
    updatedAt: string;
  };
}

const STATUS_LABEL: Record<PaymentStatus, string> = {
  PENDING: 'Bekliyor',
  PROCESSING: 'İşleniyor',
  SUCCEEDED: 'Başarılı',
  FAILED: 'Başarısız',
  REFUNDED: 'İade',
  EXPIRED: 'Süresi Doldu',
};

const STATUS_VARIANT: Record<
  PaymentStatus,
  'success' | 'warning' | 'danger' | 'default' | 'magenta' | 'cyan'
> = {
  PENDING: 'warning',
  PROCESSING: 'cyan',
  SUCCEEDED: 'success',
  FAILED: 'danger',
  REFUNDED: 'magenta',
  EXPIRED: 'default',
};

const PROVIDER_LABEL: Record<PaymentProvider, string> = {
  PAYTR: 'PayTR',
  PAPARA: 'Papara',
  STRIPE: 'Stripe',
  NOWPAYMENTS: 'Kripto',
  BANK_TRANSFER: 'Havale',
  WALLET: 'Cüzdan',
};

export function PaymentDetailCard({ payment }: PaymentDetailCardProps) {
  return (
    <Card>
      <CardContent className="space-y-4 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wider text-white/40">Ödeme ID</p>
            <p className="font-mono text-sm text-white">{payment.id}</p>
          </div>
          <Badge variant={STATUS_VARIANT[payment.status]} size="md">
            {STATUS_LABEL[payment.status]}
          </Badge>
        </div>

        <Separator />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Sipariş">
            {payment.orderId && payment.orderNumber ? (
              <Link
                href={`/admin/orders/${payment.orderId}`}
                className="font-mono text-cyber-cyan hover:text-cyber-magenta"
              >
                {payment.orderNumber}
              </Link>
            ) : (
              <span className="text-white/40">—</span>
            )}
          </Field>
          <Field label="Kullanıcı">
            {payment.user ? (
              <Link
                href={`/admin/users/${payment.user.id}`}
                className="text-white hover:text-cyber-cyan"
              >
                {payment.user.displayName ?? payment.user.username}
                <span className="ml-2 text-xs text-white/40">{payment.user.email}</span>
              </Link>
            ) : (
              <span className="text-white/40">—</span>
            )}
          </Field>
          <Field label="Sağlayıcı">{PROVIDER_LABEL[payment.provider as PaymentProvider]}</Field>
          <Field label="Provider Tx ID">
            <span className="font-mono text-xs text-white/70">{payment.providerRef ?? '—'}</span>
          </Field>
          <Field label="Tutar">
            <span className="font-mono text-lg text-white">
              {formatCurrency(payment.amount, payment.currency as PaymentCurrency)}
            </span>
          </Field>
          <Field label="Para Birimi">{payment.currency}</Field>
          <Field label="Ödeme Tarihi">
            {payment.paidAt ? formatDateTime(payment.paidAt) : '—'}
          </Field>
          <Field label="İade Tarihi">
            {payment.refundedAt ? formatDateTime(payment.refundedAt) : '—'}
          </Field>
          <Field label="Son Kullanma">
            {payment.expiresAt ? formatDateTime(payment.expiresAt) : '—'}
          </Field>
          <Field label="Güncellendi">{formatDateTime(payment.updatedAt)}</Field>
        </div>

        {payment.metadata ? (
          <>
            <Separator />
            <div>
              <p className="mb-2 text-xs uppercase tracking-wider text-white/40">Metadata</p>
              <pre className="overflow-x-auto rounded bg-cyber-darker/60 p-3 text-[11px] text-white/70">
                {JSON.stringify(payment.metadata, null, 2)}
              </pre>
            </div>
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-white/40">{label}</p>
      <div className="text-sm text-white">{children}</div>
    </div>
  );
}

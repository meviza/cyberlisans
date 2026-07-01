import * as React from 'react';
import { Card, CardContent, Badge } from '@cyberlisans/ui/atoms';
import { formatCurrency, formatDateTime } from '@/lib/format';

export interface OrderPaymentInfo {
  method: string | null;
  paymentStatus: string | null;
  paymentRef: string | null;
  totalAmount: number;
  currency: string;
  payments: Array<{
    id: string;
    provider: string;
    providerRef: string | null;
    amount: number;
    currency: string;
    status: string;
    paidAt: Date | string | null;
    refundedAt: Date | string | null;
    createdAt: Date | string;
  }>;
}

const METHOD_LABEL: Record<string, string> = {
  PAYTR: 'PayTR',
  PAPARA: 'Papara',
  NOWPAYMENTS: 'Kripto (NOWPayments)',
  STRIPE: 'Stripe',
  BANK_TRANSFER: 'Banka Havalesi',
  WALLET: 'Cüzdan',
};

const STATUS_VARIANT: Record<string, 'success' | 'warning' | 'danger' | 'default' | 'magenta'> = {
  SUCCEEDED: 'success',
  PENDING: 'warning',
  PROCESSING: 'warning',
  FAILED: 'danger',
  REFUNDED: 'magenta',
  EXPIRED: 'default',
};

export function OrderPaymentInfo({ info }: { info: OrderPaymentInfo }) {
  const ccy = info.currency as 'TRY' | 'USD' | 'EUR' | 'USDT';
  return (
    <Card>
      <CardContent className="space-y-4 p-5">
        <h3 className="font-orbitron text-sm font-bold uppercase tracking-wider text-white">
          Ödeme Bilgileri
        </h3>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <p className="text-white/40">Yöntem</p>
            <p className="mt-1 text-sm text-white">
              {info.method ? (METHOD_LABEL[info.method] ?? info.method) : '—'}
            </p>
          </div>
          <div>
            <p className="text-white/40">Durum</p>
            <div className="mt-1">
              <Badge variant={STATUS_VARIANT[info.paymentStatus ?? ''] ?? 'default'} size="sm">
                {info.paymentStatus ?? '—'}
              </Badge>
            </div>
          </div>
          <div>
            <p className="text-white/40">Tutar</p>
            <p className="mt-1 font-mono text-sm text-white">
              {formatCurrency(info.totalAmount, ccy)}
            </p>
          </div>
          <div>
            <p className="text-white/40">Ref</p>
            <p
              className="mt-1 truncate font-mono text-xs text-white/80"
              title={info.paymentRef ?? undefined}
            >
              {info.paymentRef ?? '—'}
            </p>
          </div>
        </div>

        {info.payments.length > 0 && (
          <div className="border-t border-cyber-cyan/20 pt-4">
            <p className="mb-2 text-[10px] uppercase tracking-wider text-white/40">Ödeme Geçmişi</p>
            <ul className="space-y-2">
              {info.payments.map((p) => {
                const pCcy = p.currency as 'TRY' | 'USD' | 'EUR' | 'USDT';
                return (
                  <li
                    key={p.id}
                    className="flex items-center justify-between rounded border border-cyber-cyan/10 bg-cyber-darker/30 p-2 text-xs"
                  >
                    <div>
                      <p className="text-white">{METHOD_LABEL[p.provider] ?? p.provider}</p>
                      <p className="text-[10px] text-white/50">{formatDateTime(p.createdAt)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-white">{formatCurrency(p.amount, pCcy)}</p>
                      <Badge
                        variant={STATUS_VARIANT[p.status] ?? 'default'}
                        size="sm"
                        className="mt-1"
                      >
                        {p.status}
                      </Badge>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

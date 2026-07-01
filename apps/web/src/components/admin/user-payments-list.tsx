import * as React from 'react';
import { Card, CardContent, Badge } from '@cyberlisans/ui/atoms';
import { formatCurrency, formatDateTime } from '@/lib/format';

export interface UserPaymentRow {
  id: string;
  createdAt: Date | string;
  method: 'WALLET' | 'PAYTR' | 'PAPARA' | 'STRIPE' | 'NOWPAYMENTS' | 'BANK_TRANSFER';
  amount: number;
  currency: string;
  status: 'PENDING' | 'SUCCEEDED' | 'FAILED' | 'REFUNDED';
  orderId?: string | null;
}

const METHOD_LABEL: Record<UserPaymentRow['method'], string> = {
  WALLET: 'Cüzdan',
  PAYTR: 'PayTR',
  PAPARA: 'Papara',
  STRIPE: 'Stripe',
  NOWPAYMENTS: 'Kripto',
  BANK_TRANSFER: 'Havale',
};

const STATUS_LABEL: Record<UserPaymentRow['status'], string> = {
  PENDING: 'Bekliyor',
  SUCCEEDED: 'Başarılı',
  FAILED: 'Başarısız',
  REFUNDED: 'İade',
};

const STATUS_VARIANT: Record<
  UserPaymentRow['status'],
  'success' | 'warning' | 'danger' | 'magenta'
> = {
  PENDING: 'warning',
  SUCCEEDED: 'success',
  FAILED: 'danger',
  REFUNDED: 'magenta',
};

export function UserPaymentsList({ payments }: { payments: UserPaymentRow[] }) {
  return (
    <Card id="payments">
      <CardContent className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-orbitron text-sm font-bold uppercase tracking-wider text-white">
            Ödemeler
          </h3>
          <span className="text-xs text-white/50">{payments.length} kayıt</span>
        </div>
        {payments.length === 0 ? (
          <p className="rounded border border-dashed border-cyber-cyan/20 p-6 text-center text-sm text-white/50">
            Henüz ödeme yok
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-cyber-cyan/20 text-left text-xs uppercase tracking-wider text-white/50">
                <tr>
                  <th className="py-2 pr-3">Tarih</th>
                  <th className="py-2 pr-3">Yöntem</th>
                  <th className="py-2 pr-3 text-right">Tutar</th>
                  <th className="py-2 pr-3">Durum</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => {
                  const ccy = (p.currency as 'TRY' | 'USD' | 'EUR' | 'USDT') ?? 'TRY';
                  return (
                    <tr key={p.id} className="border-b border-cyber-cyan/10 hover:bg-cyber-cyan/5">
                      <td className="py-2 pr-3 text-xs text-white/60">
                        {formatDateTime(p.createdAt)}
                      </td>
                      <td className="py-2 pr-3 text-white/80">{METHOD_LABEL[p.method]}</td>
                      <td className="py-2 pr-3 text-right font-medium text-white">
                        {formatCurrency(p.amount, ccy)}
                      </td>
                      <td className="py-2 pr-3">
                        <Badge variant={STATUS_VARIANT[p.status]} size="sm">
                          {STATUS_LABEL[p.status]}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

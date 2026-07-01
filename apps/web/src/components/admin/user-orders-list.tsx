import * as React from 'react';
import Link from 'next/link';
import { Card, CardContent, Badge } from '@cyberlisans/ui/atoms';
import { formatCurrency, formatDate } from '@/lib/format';

export interface UserOrderRow {
  id: string;
  orderNumber: string;
  createdAt: Date | string;
  totalAmount: number;
  currency: string;
  status: 'PENDING' | 'PAID' | 'FULFILLED' | 'CANCELLED' | 'REFUNDED';
  itemsCount: number;
}

const STATUS_LABEL: Record<UserOrderRow['status'], string> = {
  PENDING: 'Bekliyor',
  PAID: 'Ödendi',
  FULFILLED: 'Teslim Edildi',
  CANCELLED: 'İptal',
  REFUNDED: 'İade',
};

const STATUS_VARIANT: Record<
  UserOrderRow['status'],
  'success' | 'warning' | 'danger' | 'default' | 'magenta'
> = {
  PENDING: 'warning',
  PAID: 'warning',
  FULFILLED: 'success',
  CANCELLED: 'danger',
  REFUNDED: 'magenta',
};

export function UserOrdersList({ orders }: { orders: UserOrderRow[] }) {
  return (
    <Card id="orders">
      <CardContent className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-orbitron text-sm font-bold uppercase tracking-wider text-white">
            Siparişler
          </h3>
          <span className="text-xs text-white/50">{orders.length} kayıt</span>
        </div>
        {orders.length === 0 ? (
          <p className="rounded border border-dashed border-cyber-cyan/20 p-6 text-center text-sm text-white/50">
            Henüz sipariş yok
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-cyber-cyan/20 text-left text-xs uppercase tracking-wider text-white/50">
                <tr>
                  <th className="py-2 pr-3">Sipariş</th>
                  <th className="py-2 pr-3">Tarih</th>
                  <th className="py-2 pr-3 text-right">Ürün</th>
                  <th className="py-2 pr-3 text-right">Tutar</th>
                  <th className="py-2 pr-3">Durum</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => {
                  const ccy = (o.currency as 'TRY' | 'USD' | 'EUR' | 'USDT') ?? 'TRY';
                  return (
                    <tr key={o.id} className="border-b border-cyber-cyan/10 hover:bg-cyber-cyan/5">
                      <td className="py-2 pr-3">
                        <Link
                          href={`/admin/orders/${o.id}`}
                          className="font-mono text-cyber-cyan hover:text-cyber-magenta"
                        >
                          {o.orderNumber}
                        </Link>
                      </td>
                      <td className="py-2 pr-3 text-xs text-white/60">{formatDate(o.createdAt)}</td>
                      <td className="py-2 pr-3 text-right text-white/80">{o.itemsCount}</td>
                      <td className="py-2 pr-3 text-right font-medium text-white">
                        {formatCurrency(o.totalAmount, ccy)}
                      </td>
                      <td className="py-2 pr-3">
                        <Badge variant={STATUS_VARIANT[o.status]} size="sm">
                          {STATUS_LABEL[o.status]}
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

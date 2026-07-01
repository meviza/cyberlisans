import * as React from 'react';
import Link from 'next/link';
import { Badge, Card, CardContent } from '@cyberlisans/ui/atoms';
import { ArrowLeft, User as UserIcon } from 'lucide-react';
import { formatCurrency, formatDateTime } from '@/lib/format';
import type { OrderStatus } from './orders-table';

const STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: 'Bekliyor',
  PAID: 'Ödendi',
  FULFILLED: 'Teslim Edildi',
  CANCELLED: 'İptal Edildi',
  REFUNDED: 'İade Edildi',
  FAILED: 'Başarısız',
};

const STATUS_VARIANT: Record<
  OrderStatus,
  'success' | 'warning' | 'danger' | 'default' | 'magenta' | 'cyan'
> = {
  PENDING: 'warning',
  PAID: 'cyan',
  FULFILLED: 'success',
  CANCELLED: 'danger',
  REFUNDED: 'magenta',
  FAILED: 'danger',
};

export interface OrderDetailHeaderProps {
  order: {
    id: string;
    orderNumber: string;
    status: OrderStatus;
    totalAmount: number;
    currency: string;
    createdAt: Date | string;
    paidAt: Date | string | null;
    fulfilledAt: Date | string | null;
    user: { id: string; email: string; username: string; displayName: string | null };
  };
}

export function OrderDetailHeader({ order }: OrderDetailHeaderProps) {
  const ccy = order.currency as 'TRY' | 'USD' | 'EUR' | 'USDT';
  return (
    <Card>
      <CardContent className="space-y-4 p-6">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/orders"
            className="rounded p-1.5 text-white/60 transition-colors hover:bg-cyber-cyan/10 hover:text-cyber-cyan"
            title="Listeye dön"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-orbitron text-xl font-black text-white sm:text-2xl">
                {order.orderNumber}
              </h1>
              <Badge variant={STATUS_VARIANT[order.status]} size="sm">
                {STATUS_LABEL[order.status]}
              </Badge>
            </div>
            <p className="mt-1 text-xs text-white/50">
              Oluşturuldu: {formatDateTime(order.createdAt)}
            </p>
          </div>
          <div className="text-right">
            <p className="font-orbitron text-2xl font-black text-white">
              {formatCurrency(order.totalAmount, ccy)}
            </p>
            <p className="text-[10px] uppercase tracking-wider text-white/40">{order.currency}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 border-t border-cyber-cyan/20 pt-4 md:grid-cols-2">
          <Link
            href={`/admin/users/${order.user.id}`}
            className="flex items-center gap-3 rounded border border-cyber-cyan/20 bg-cyber-darker/30 p-3 transition-colors hover:border-cyber-cyan/60"
          >
            <div className="rounded-md bg-cyber-purple/10 p-2 text-cyber-purple">
              <UserIcon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-white">
                {order.user.displayName ?? order.user.username}
              </p>
              <p className="truncate text-xs text-white/50">{order.user.email}</p>
            </div>
          </Link>

          <div className="rounded border border-cyber-cyan/20 bg-cyber-darker/30 p-3 text-xs">
            <div className="mb-1 text-[10px] uppercase tracking-wider text-white/40">Tarihler</div>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-white/60">Oluşturma:</span>
                <span className="text-white">{formatDateTime(order.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Ödeme:</span>
                <span className="text-white">
                  {order.paidAt ? formatDateTime(order.paidAt) : '—'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Teslim:</span>
                <span className="text-white">
                  {order.fulfilledAt ? formatDateTime(order.fulfilledAt) : '—'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

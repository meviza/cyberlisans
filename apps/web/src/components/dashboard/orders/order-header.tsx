'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Badge } from '@cyberlisans/ui/atoms';
import { formatDateTime } from '@/lib/format';

export type OrderStatus =
  | 'PENDING'
  | 'PAID'
  | 'ESCROW_HELD'
  | 'RELEASED'
  | 'DISPUTED'
  | 'REFUNDED'
  | 'CANCELLED';

export interface OrderHeaderProps {
  orderId: string;
  status: OrderStatus;
  createdAt: string;
}

const STATUS_MAP: Record<
  OrderStatus,
  { label: string; variant: 'success' | 'warning' | 'danger' | 'default' | 'magenta' }
> = {
  PENDING: { label: 'Bekliyor', variant: 'warning' },
  PAID: { label: 'Ödendi', variant: 'success' },
  ESCROW_HELD: { label: "Escrow'da", variant: 'magenta' },
  RELEASED: { label: 'Serbest Bırakıldı', variant: 'success' },
  DISPUTED: { label: 'İtiraz Var', variant: 'danger' },
  REFUNDED: { label: 'İade Edildi', variant: 'default' },
  CANCELLED: { label: 'İptal', variant: 'default' },
};

export function OrderHeader({ orderId, status, createdAt }: OrderHeaderProps) {
  const s = STATUS_MAP[status] ?? { label: status, variant: 'default' as const };
  return (
    <div className="space-y-3">
      <Link
        href="/dashboard/orders"
        className="inline-flex items-center gap-2 text-sm text-cyber-cyan hover:text-cyber-magenta"
      >
        <ArrowLeft className="h-4 w-4" />
        Siparişlere dön
      </Link>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-orbitron text-2xl font-black text-white">Sipariş Detayı</h1>
          <p className="mt-1 font-mono text-sm text-cyber-cyan">{orderId}</p>
          <p className="mt-1 text-xs text-white/50">{formatDateTime(createdAt)}</p>
        </div>
        <Badge variant={s.variant} size="lg">
          {s.label}
        </Badge>
      </div>
    </div>
  );
}

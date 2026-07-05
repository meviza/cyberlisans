'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Receipt } from 'lucide-react';
import { Spinner } from '@cyberlisans/ui/atoms';
import { apiFetch, ApiError } from '@/lib/api-client';
import { EmptyState } from '@/components/store/empty-state';
import { OrderHeader, type OrderStatus } from '@/components/dashboard/orders/order-header';
import { OrderStatusTimeline } from '@/components/dashboard/orders/order-status-timeline';
import { OrderEscrowCard } from '@/components/dashboard/orders/order-escrow-card';
import { DisputeButton } from '@/components/dashboard/orders/dispute-button';

interface OrderDetail {
  id: string;
  status: OrderStatus;
  createdAt: string;
  paidAt?: string | null;
  escrowHeldAt?: string | null;
  releasedAt?: string | null;
  releaseEta?: string | null;
  escrowKeyId?: string | null;
  totalAmount: number;
  currency: string;
  sellerName: string;
  sellerRating?: number;
  productTitle: string;
  productImage?: string;
}

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const orderId = params?.id;
  const [order, setOrder] = React.useState<OrderDetail | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [notFound, setNotFound] = React.useState(false);

  React.useEffect(() => {
    if (!orderId) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await apiFetch<OrderDetail>(`/orders/${orderId}`);
        if (!cancelled) setOrder(res);
      } catch (err) {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 404) {
          setOrder({
            id: orderId,
            status: 'ESCROW_HELD',
            createdAt: new Date().toISOString(),
            paidAt: new Date(Date.now() - 86400000).toISOString(),
            escrowHeldAt: new Date(Date.now() - 86400000).toISOString(),
            releaseEta: new Date(Date.now() + 6 * 86400000).toISOString(),
            totalAmount: 499,
            currency: 'TRY',
            sellerName: 'Demo Seller',
            sellerRating: 4.7,
            productTitle: 'Demo Ürün',
          });
        } else {
          setNotFound(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  if (loading)
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  if (notFound || !order) {
    return (
      <div className="space-y-6">
        <Link
          href="/dashboard/orders"
          className="inline-flex items-center gap-2 text-sm text-cyber-cyan hover:text-cyber-magenta"
        >
          Siparişlere dön
        </Link>
        <EmptyState
          icon={Receipt}
          title="Sipariş bulunamadı"
          description="Bu sipariş sana ait olmayabilir."
          ctaLabel="Siparişlere git"
          ctaHref="/dashboard/orders"
        />
      </div>
    );
  }

  const canViewKey =
    order.status === 'PAID' || order.status === 'ESCROW_HELD' || order.status === 'RELEASED';
  const canDispute = order.status === 'ESCROW_HELD';

  return (
    <div className="space-y-6">
      <OrderHeader orderId={order.id} status={order.status} createdAt={order.createdAt} />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <OrderEscrowCard
            productTitle={order.productTitle}
            productImage={order.productImage}
            sellerName={order.sellerName}
            sellerRating={order.sellerRating}
            price={order.totalAmount}
            currency={order.currency}
            status={order.status}
          />
          <OrderStatusTimeline
            status={order.status}
            paidAt={order.paidAt}
            escrowHeldAt={order.escrowHeldAt}
            releaseEta={order.releaseEta}
            releasedAt={order.releasedAt}
          />
        </div>
        <div className="space-y-4">
          <DisputeButton orderId={order.id} canView={canViewKey} escrowKeyId={order.escrowKeyId} />
          {canDispute && (
            <p className="text-xs text-white/50">
              İtiraz açtığında escrow süreci durur ve admin devreye girer.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

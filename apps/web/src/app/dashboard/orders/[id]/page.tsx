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

interface ApiOrderItem {
  id: string;
  productId: string;
  productKeyId?: string | null;
  productKeyCode?: string | null;
  quantity?: number;
  unitPrice?: number;
  totalPrice?: number;
  title?: string;
  productTitle?: string;
}

interface ApiOrder {
  id: string;
  orderNumber?: string;
  status: OrderStatus | string;
  createdAt: string;
  paidAt?: string | null;
  fulfilledAt?: string | null;
  cancelledAt?: string | null;
  refundedAt?: string | null;
  totalAmount: number;
  currency: string;
  paymentMethod?: string | null;
  items?: ApiOrderItem[];
  // optional enriched fields if API adds later
  sellerName?: string;
  sellerRating?: number;
  productTitle?: string;
  productImage?: string;
  escrowHeldAt?: string | null;
  releasedAt?: string | null;
  releaseEta?: string | null;
  escrowKeyId?: string | null;
}

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
  keyCodes: string[];
}

function mapStatus(status: string): OrderStatus {
  const s = status.toUpperCase();
  if (s === 'FULFILLED') return 'RELEASED';
  if (s === 'PAID') return 'ESCROW_HELD';
  if (
    s === 'PENDING' ||
    s === 'ESCROW_HELD' ||
    s === 'DISPUTED' ||
    s === 'RELEASED' ||
    s === 'REFUNDED' ||
    s === 'CANCELLED'
  ) {
    return s as OrderStatus;
  }
  return 'PENDING';
}

function mapOrder(raw: ApiOrder): OrderDetail {
  const first = raw.items?.[0];
  const productTitle =
    raw.productTitle ??
    first?.productTitle ??
    first?.title ??
    (raw.items && raw.items.length > 1 ? `${raw.items.length} ürün` : 'Dijital ürün');
  const keyCodes = (raw.items ?? [])
    .map((i) => i.productKeyCode)
    .filter((c): c is string => Boolean(c));
  const escrowKeyId = raw.escrowKeyId ?? first?.productKeyId ?? null;

  // Processing window after payment
  let releaseEta = raw.releaseEta ?? null;
  if (!releaseEta && raw.paidAt && mapStatus(raw.status) === 'ESCROW_HELD') {
    const eta = new Date(raw.paidAt);
    eta.setDate(eta.getDate() + 7);
    releaseEta = eta.toISOString();
  }

  return {
    id: raw.orderNumber ?? raw.id,
    status: mapStatus(String(raw.status)),
    createdAt: raw.createdAt,
    paidAt: raw.paidAt ?? null,
    escrowHeldAt: raw.escrowHeldAt ?? raw.paidAt ?? null,
    releasedAt: raw.releasedAt ?? raw.fulfilledAt ?? null,
    releaseEta,
    escrowKeyId,
    totalAmount: Number(raw.totalAmount ?? 0),
    currency: raw.currency || 'TRY',
    sellerName: raw.sellerName ?? 'Platform satıcısı',
    sellerRating: raw.sellerRating,
    productTitle,
    productImage: raw.productImage,
    keyCodes,
  };
}

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const orderId = params?.id;
  const [order, setOrder] = React.useState<OrderDetail | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [notFound, setNotFound] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!orderId) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await apiFetch<ApiOrder>(`/orders/${orderId}`);
        if (!cancelled) setOrder(mapOrder(res));
      } catch (err) {
        if (cancelled) return;
        if (err instanceof ApiError && (err.status === 404 || err.status === 403)) {
          setNotFound(true);
        } else {
          setError(err instanceof ApiError ? err.message : 'Sipariş yüklenemedi');
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
          className="inline-flex items-center gap-2 text-sm text-brand-accent hover:underline"
        >
          Siparişlere dön
        </Link>
        <EmptyState
          icon={Receipt}
          title="Sipariş bulunamadı"
          description={error ?? 'Bu sipariş sana ait olmayabilir veya silinmiş olabilir.'}
          ctaLabel="Siparişlere git"
          ctaHref="/dashboard/orders"
        />
      </div>
    );
  }

  const canViewKey =
    order.status === 'PAID' ||
    order.status === 'ESCROW_HELD' ||
    order.status === 'RELEASED' ||
    order.keyCodes.length > 0;
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
          {order.keyCodes.length > 0 && (
            <div className="surface-card p-5">
              <h3 className="text-sm font-semibold text-white">Lisans anahtarların</h3>
              <ul className="mt-3 space-y-2">
                {order.keyCodes.map((code) => (
                  <li
                    key={code}
                    className="rounded-lg border border-white/10 bg-brand-bg/60 px-3 py-2 font-mono text-sm text-brand-accent"
                  >
                    {code}
                  </li>
                ))}
              </ul>
            </div>
          )}
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
              İtiraz açtığınızda destek ekibi siparişi inceler.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

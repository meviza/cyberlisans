'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Receipt, Package, Shield, Calendar, CreditCard } from 'lucide-react';
import { Card, CardContent, Badge, Spinner } from '@cyberlisans/ui/atoms';
import { EmptyState } from '@/components/store/empty-state';
import { useCurrency } from '@/lib/currency-context';
import { apiFetch, ApiError } from '@/lib/api-client';

interface OrderDetail {
  id: string;
  totalAmount: number;
  currency: string;
  status: string;
  paymentMethod?: string;
  createdAt: string;
  paidAt?: string | null;
  items: Array<{ id: string; title: string; qty: number; price: number; image: string }>;
}

const STATUS_MAP: Record<
  string,
  { label: string; variant: 'success' | 'warning' | 'danger' | 'default' }
> = {
  PENDING: { label: 'Bekliyor', variant: 'warning' },
  PAID: { label: 'Ödendi', variant: 'warning' },
  FULFILLED: { label: 'Teslim Edildi', variant: 'success' },
  CANCELLED: { label: 'İptal', variant: 'danger' },
  REFUNDED: { label: 'İade Edildi', variant: 'default' },
};

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { format } = useCurrency();
  const [order, setOrder] = React.useState<OrderDetail | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [notFound, setNotFound] = React.useState(false);

  const orderId = params?.id;

  React.useEffect(() => {
    if (!orderId) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await apiFetch<OrderDetail>(`/orders/${orderId}`);
        if (!cancelled) setOrder(res);
      } catch (err) {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 404) setNotFound(true);
        else setNotFound(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (notFound || !order) {
    return (
      <div className="space-y-6">
        <Link
          href="/dashboard/orders"
          className="inline-flex items-center gap-2 text-sm text-cyber-cyan hover:text-cyber-magenta"
        >
          <ArrowLeft className="h-4 w-4" />
          Siparişlere dön
        </Link>
        <EmptyState
          icon={Receipt}
          title="Sipariş bulunamadı"
          description="Bu sipariş sana ait olmayabilir veya silinmiş olabilir."
          ctaLabel="Siparişlere git"
          ctaHref="/dashboard/orders"
        />
      </div>
    );
  }

  const status = STATUS_MAP[order.status] ?? { label: order.status, variant: 'default' as const };

  return (
    <div className="space-y-6">
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
          <p className="mt-1 font-mono text-sm text-cyber-cyan">{order.id}</p>
        </div>
        <Badge variant={status.variant} size="lg">
          {status.label}
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <InfoCard
          icon={Calendar}
          label="Tarih"
          value={new Date(order.createdAt).toLocaleString('tr-TR')}
        />
        <InfoCard icon={CreditCard} label="Ödeme Yöntemi" value={order.paymentMethod ?? 'WALLET'} />
        <InfoCard icon={Shield} label="Durum" value={status.label} />
      </div>

      <Card>
        <CardContent className="p-6">
          <h2 className="mb-4 font-orbitron text-base font-bold text-white">Ürünler</h2>
          <ul className="divide-y divide-cyber-cyan/10">
            {order.items.map((it) => (
              <li key={it.id} className="flex items-center gap-4 py-3">
                <div
                  className="h-14 w-14 shrink-0 rounded-md border border-cyber-cyan/20"
                  style={{ background: it.image }}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-white">{it.title}</p>
                  <p className="text-xs text-white/50">
                    {it.qty} adet × {format(it.price)}
                  </p>
                </div>
                <div className="font-orbitron text-sm font-bold text-white">
                  {format(it.price * it.qty)}
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex items-center justify-between border-t border-cyber-cyan/20 pt-4">
            <span className="font-medium text-white">Toplam</span>
            <span className="font-orbitron text-2xl font-black text-cyber-cyan text-glow-cyan">
              {format(order.totalAmount)}
            </span>
          </div>
        </CardContent>
      </Card>

      {order.status === 'PENDING' && (
        <Card>
          <CardContent className="flex items-start gap-3 p-4">
            <Package className="h-5 w-5 shrink-0 text-cyber-cyan" />
            <div className="text-sm text-white/70">
              <p className="font-medium text-white">Teslimat Bekleniyor</p>
              <p>
                Ödeme onayı sonrası lisanslarınız 5 saniye içinde otomatik olarak teslim
                edilecektir.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function InfoCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-md border border-cyber-cyan/30 bg-cyber-cyan/10 text-cyber-cyan">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider text-white/50">{label}</p>
          <p className="font-medium text-white">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

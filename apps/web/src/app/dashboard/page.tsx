'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  CreditCard,
  ShoppingBag,
  Sparkles,
  Receipt,
  Wallet,
  ArrowUpRight,
  Shield,
  Mail,
  Clock,
} from 'lucide-react';
import { Card, CardContent, Badge, Button, Spinner } from '@cyberlisans/ui/atoms';
import { useAuth } from '@/lib/auth-context';
import { StatCard } from '@/components/dashboard/stat-card';
import { apiFetch } from '@/lib/api-client';

interface DashboardOrder {
  id: string;
  orderNumber?: string;
  totalAmount: number;
  currency: string;
  status: 'PENDING' | 'PAID' | 'FULFILLED' | 'CANCELLED' | 'REFUNDED' | string;
  createdAt: string;
  paidAt?: string | null;
  fulfilledAt?: string | null;
  items?: Array<{
    title?: string;
    productTitle?: string;
    quantity?: number;
    qty?: number;
  }>;
}

interface RecentOrder {
  id: string;
  date: string;
  product: string;
  amount: number;
  status: DashboardOrder['status'];
}

const STATUS_MAP: Record<
  string,
  { label: string; variant: 'success' | 'warning' | 'danger' | 'default' }
> = {
  PAID: { label: 'Ödendi', variant: 'warning' },
  PENDING: { label: 'Bekliyor', variant: 'warning' },
  FULFILLED: { label: 'Teslim edildi', variant: 'success' },
  CANCELLED: { label: 'İptal', variant: 'danger' },
  REFUNDED: { label: 'İade edildi', variant: 'default' },
};

export default function DashboardOverviewPage() {
  const { user } = useAuth();
  const [orders, setOrders] = React.useState<DashboardOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = React.useState(true);
  const [ordersError, setOrdersError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiFetch<{ items: DashboardOrder[] }>('/orders?limit=5');
        if (!cancelled) setOrders(res.items ?? []);
      } catch {
        if (!cancelled) setOrdersError('Son siparişler yüklenemedi');
      } finally {
        if (!cancelled) setLoadingOrders(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const recentOrders: RecentOrder[] = orders.map((order) => {
    const firstItem = order.items?.[0];
    const firstTitle = firstItem?.productTitle ?? firstItem?.title ?? 'Dijital ürün';
    const extraCount = Math.max(0, (order.items?.length ?? 0) - 1);
    return {
      id: order.orderNumber ?? order.id,
      date: new Date(order.createdAt).toLocaleDateString('tr-TR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      product: extraCount > 0 ? `${firstTitle} +${extraCount}` : firstTitle,
      amount: order.totalAmount,
      status: order.status,
    };
  });

  const completedOrders = orders.filter((o) => o.status === 'PAID' || o.status === 'FULFILLED');
  const totalSpend = completedOrders.reduce((sum, order) => sum + order.totalAmount, 0);
  const activeLicenses = completedOrders.reduce(
    (sum, order) =>
      sum +
      (order.items ?? []).reduce((itemSum, item) => itemSum + (item.quantity ?? item.qty ?? 1), 0),
    0,
  );
  const loyaltyPoints = Math.floor(totalSpend / 10);
  const lastOrder = orders[0];

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <div
          className="relative h-36 sm:h-40"
          style={{
            background:
              'radial-gradient(ellipse 80% 80% at 20% 0%, rgba(0,87,255,0.35), transparent 55%), linear-gradient(135deg, #0B1220 0%, #00001e 100%)',
          }}
        >
          <div
            className="absolute inset-0 bg-grid-faint opacity-40"
            style={{ backgroundSize: '48px 48px' }}
          />
        </div>
        <CardContent className="relative -mt-12 p-6 sm:p-8">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm text-brand-muted">Hoş geldin,</p>
              <h1 className="text-3xl font-semibold tracking-tight text-white">
                {user?.displayName ?? user?.username}
              </h1>
              <p className="mt-1 text-sm text-brand-text-secondary">{user?.email}</p>
            </div>
            <div className="flex gap-2">
              <Badge variant="default" size="lg">
                {user?.role}
              </Badge>
              <Badge variant="outline" size="lg">
                {user?.currency}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Toplam harcama"
          value={`₺${totalSpend.toLocaleString('tr-TR')}`}
          icon={CreditCard}
          hint="Ödenen ve teslim edilen siparişler"
        />
        <StatCard
          label="Aktif lisanslar"
          value={String(activeLicenses)}
          icon={ShoppingBag}
          hint="Satın alınan dijital ürün adedi"
        />
        <StatCard
          label="Sadakat puanı"
          value={loyaltyPoints.toLocaleString('tr-TR')}
          icon={Sparkles}
          hint="Harcamaya göre hesaplanır"
        />
        <StatCard
          label="Son sipariş"
          value={lastOrder ? `₺${lastOrder.totalAmount.toLocaleString('tr-TR')}` : '—'}
          icon={Receipt}
          hint={
            lastOrder
              ? new Date(lastOrder.createdAt).toLocaleDateString('tr-TR')
              : 'Henüz sipariş yok'
          }
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Hızlı eylemler</h2>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Link href="/dashboard/wallet">
                <Button variant="primary" className="w-full">
                  <Wallet className="h-4 w-4" />
                  Cüzdan yükle
                </Button>
              </Link>
              <Link href="/products">
                <Button variant="outline" className="w-full">
                  <ShoppingBag className="h-4 w-4" />
                  Ürünlere göz at
                </Button>
              </Link>
              <Link href="/dashboard/settings">
                <Button variant="ghost" className="w-full">
                  <Shield className="h-4 w-4" />
                  Ayarlar
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h2 className="mb-4 text-lg font-semibold text-white">Hesap durumu</h2>
            <div className="space-y-3">
              <StatusRow
                icon={Mail}
                label="E-posta doğrulandı"
                status="success"
                detail={user?.email ?? ''}
              />
              <StatusRow
                icon={Shield}
                label="2FA"
                status={user?.twoFactorEnabled ? 'success' : 'warning'}
                detail={user?.twoFactorEnabled ? 'Aktif' : 'Pasif'}
              />
              <StatusRow icon={Clock} label="Son giriş" status="default" detail="Şimdi" />
            </div>
            <Link
              href="/dashboard/settings"
              className="mt-4 inline-flex items-center gap-1 text-sm text-brand-accent hover:underline"
            >
              Güvenliği yönet
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Son siparişler</h2>
            <Link href="/dashboard/orders" className="text-sm text-brand-accent hover:underline">
              Tümünü gör →
            </Link>
          </div>
          {loadingOrders ? (
            <div className="flex min-h-32 items-center justify-center">
              <Spinner size="md" />
            </div>
          ) : ordersError ? (
            <div className="rounded-xl border border-brand-danger/40 bg-brand-danger/10 px-4 py-3 text-sm text-brand-danger">
              {ordersError}
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/10 px-4 py-10 text-center text-sm text-brand-muted">
              Henüz sipariş yok. İlk alışverişin burada görünecek.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.08] text-left text-xs uppercase tracking-wider text-brand-muted">
                    <th className="py-3 pr-4">Sipariş no</th>
                    <th className="py-3 pr-4">Tarih</th>
                    <th className="py-3 pr-4">Ürün</th>
                    <th className="py-3 pr-4 text-right">Tutar</th>
                    <th className="py-3 pr-4">Durum</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((o) => {
                    const s = STATUS_MAP[o.status] ?? {
                      label: o.status,
                      variant: 'default' as const,
                    };
                    return (
                      <tr
                        key={o.id}
                        className="border-b border-white/[0.06] transition-colors hover:bg-white/[0.03]"
                      >
                        <td className="py-3 pr-4 font-mono text-xs text-brand-accent">{o.id}</td>
                        <td className="py-3 pr-4 text-brand-text-secondary">{o.date}</td>
                        <td className="py-3 pr-4 text-white">{o.product}</td>
                        <td className="py-3 pr-4 text-right font-medium text-white">
                          ₺{o.amount.toLocaleString()}
                        </td>
                        <td className="py-3 pr-4">
                          <Badge variant={s.variant} size="sm">
                            {s.label}
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
    </div>
  );
}

function StatusRow({
  icon: Icon,
  label,
  status,
  detail,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  status: 'success' | 'warning' | 'default';
  detail: string;
}) {
  const colors =
    status === 'success'
      ? 'text-brand-success border-brand-success/25 bg-brand-success/5'
      : status === 'warning'
        ? 'text-brand-warning border-brand-warning/25 bg-brand-warning/5'
        : 'text-brand-text-secondary border-white/10 bg-white/[0.03]';
  return (
    <div className={`flex items-center justify-between rounded-xl border px-3 py-2 ${colors}`}>
      <div className="flex min-w-0 items-center gap-2">
        <Icon className="h-4 w-4 shrink-0" />
        <span className="text-sm">{label}</span>
      </div>
      <span className="ml-2 max-w-[45%] truncate text-xs font-medium">{detail}</span>
    </div>
  );
}

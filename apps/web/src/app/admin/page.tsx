'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Users,
  ShoppingCart,
  Wallet as WalletIcon,
  Package,
  ArrowUpRight,
  AlertTriangle,
  ShieldCheck,
  Store,
} from 'lucide-react';
import { Spinner } from '@cyberlisans/ui/atoms';
import { apiFetch, ApiError } from '@/lib/api-client';
import { StatCard } from '@/components/admin/stat-card';
import { ChartCard } from '@/components/admin/chart-card';
import { LineChart } from '@/components/admin/charts/line-chart';
import { AreaChart } from '@/components/admin/charts/area-chart';
import { PieChart } from '@/components/admin/charts/pie-chart';
import { BarChart } from '@/components/admin/charts/bar-chart';
import { RecentOrdersTable } from '@/components/admin/recent-orders-table';
import { RecentPaymentsTable } from '@/components/admin/recent-payments-table';
import { LowStockAlert } from '@/components/admin/low-stock-alert';
import { formatCurrency, formatNumber } from '@/lib/format';
import type { PaymentMethod } from '@/components/admin/recent-payments-table';

export interface AdminStats {
  users: { total: number; last30DaysIncrease: number };
  orders: { total: number; today: number; last30Days: number[]; pending?: number };
  revenue: { totalTry: number; last30DaysTry: number; last30Days: number[] };
  products: { active: number; lowStock?: number };
  dealers?: { pending: number };
  paymentsByMethod: Record<PaymentMethod, number>;
  topProducts: { id: string; title: string; sold: number }[];
}

const METHOD_COLORS: Record<PaymentMethod, string> = {
  WALLET: '#0057FF',
  PAYTR: '#6B7CFF',
  PAPARA: '#29A383',
  STRIPE: '#4B6BFF',
  NOWPAYMENTS: '#FD8802',
  BANK_TRANSFER: '#60A5FA',
};

export default function AdminDashboardPage() {
  const [stats, setStats] = React.useState<AdminStats | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiFetch<AdminStats>('/api/admin/stats');
        if (!cancelled) setStats(res);
      } catch (e) {
        if (cancelled) return;
        if (e instanceof ApiError) setError(e.message);
        else setError('Yüklenemedi');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!stats && !error) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="rounded-xl border border-brand-danger/30 bg-brand-danger/10 p-4 text-brand-danger">
        İstatistikler yüklenemedi: {error}
      </div>
    );
  }

  const s = stats as AdminStats;

  const orderLabels = s.orders.last30Days.map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (s.orders.last30Days.length - 1 - i));
    return new Intl.DateTimeFormat('tr-TR', { day: '2-digit', month: 'short' }).format(d);
  });

  const revenueLabels = s.revenue.last30Days.map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (s.revenue.last30Days.length - 1 - i));
    return new Intl.DateTimeFormat('tr-TR', { day: '2-digit', month: 'short' }).format(d);
  });

  const methodSlices = (Object.entries(s.paymentsByMethod) as Array<[PaymentMethod, number]>)
    .filter(([, v]) => v > 0)
    .map(([method, value]) => ({
      label: methodLabel(method),
      value,
      color: METHOD_COLORS[method],
    }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyber-cyan/80">
            Admin command center
          </p>
          <h1 className="mt-2 font-orbitron text-2xl font-black text-white sm:text-3xl">
            Operasyon Dashboard
          </h1>
          <p className="mt-1 text-sm text-white/60">
            Gelir, sipariş, stok ve bayi risklerini tek ekranda izle.
          </p>
        </div>
        <Link
          href="/admin/audit"
          className="inline-flex items-center gap-1 rounded-md border border-cyber-cyan/30 bg-cyber-cyan/5 px-3 py-1.5 text-xs text-cyber-cyan transition-colors hover:bg-cyber-cyan/10"
        >
          Audit Log
          <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Toplam Kullanıcı"
          value={formatNumber(s.users.total)}
          icon={Users}
          trend={{ value: s.users.last30DaysIncrease, positive: s.users.last30DaysIncrease >= 0 }}
          accent="cyan"
        />
        <StatCard
          label="Toplam Sipariş"
          value={formatNumber(s.orders.total)}
          icon={ShoppingCart}
          hint={`Bugün: ${formatNumber(s.orders.today)}`}
          accent="magenta"
        />
        <StatCard
          label="Toplam Gelir"
          value={formatCurrency(s.revenue.totalTry)}
          icon={WalletIcon}
          hint={`Son 30 gün: ${formatCurrency(s.revenue.last30DaysTry)}`}
          accent="purple"
        />
        <StatCard
          label="Aktif Ürün"
          value={formatNumber(s.products.active)}
          icon={Package}
          accent="lime"
        />
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <Link
          href="/admin/orders?status=PENDING"
          className="group rounded-xl border border-cyber-cyan/20 bg-cyber-cyan/5 p-4 transition-colors hover:border-cyber-cyan/50 hover:bg-cyber-cyan/10"
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wider text-white/50">Operasyon kuyruğu</p>
              <p className="mt-1 font-orbitron text-xl text-white">
                {formatNumber(s.orders.pending ?? 0)} bekleyen sipariş
              </p>
            </div>
            <ShieldCheck className="h-6 w-6 text-cyber-cyan" />
          </div>
        </Link>
        <Link
          href="/admin/products"
          className="group rounded-xl border border-amber-300/20 bg-amber-300/5 p-4 transition-colors hover:border-amber-300/50 hover:bg-amber-300/10"
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wider text-white/50">Stok uyarısı</p>
              <p className="mt-1 font-orbitron text-xl text-white">
                {formatNumber(s.products.lowStock ?? 0)} düşük stok
              </p>
            </div>
            <AlertTriangle className="h-6 w-6 text-amber-300" />
          </div>
        </Link>
        <Link
          href="/admin/dealers?status=PENDING"
          className="group rounded-xl border border-cyber-magenta/20 bg-cyber-magenta/5 p-4 transition-colors hover:border-cyber-magenta/50 hover:bg-cyber-magenta/10"
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wider text-white/50">Bayi onayı</p>
              <p className="mt-1 font-orbitron text-xl text-white">
                {formatNumber(s.dealers?.pending ?? 0)} bekleyen başvuru
              </p>
            </div>
            <Store className="h-6 w-6 text-cyber-magenta" />
          </div>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartCard title="Sipariş Trendi" description="Son 30 gün" className="lg:col-span-2">
          <LineChart data={s.orders.last30Days} labels={orderLabels} color="#0057FF" height={220} />
        </ChartCard>

        <ChartCard title="Ödeme Yöntemi" description="Tüm zamanlar">
          {methodSlices.length === 0 ? (
            <p className="rounded-md border border-dashed border-cyber-cyan/20 p-6 text-center text-sm text-white/50">
              Henüz ödeme verisi yok
            </p>
          ) : (
            <PieChart data={methodSlices} />
          )}
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartCard title="Gelir Trendi" description="TRY, son 30 gün" className="lg:col-span-2">
          <AreaChart
            data={s.revenue.last30Days}
            labels={revenueLabels}
            color="#6B7CFF"
            height={220}
          />
        </ChartCard>

        <ChartCard title="En Çok Satan 5 Ürün">
          {s.topProducts.length === 0 ? (
            <p className="rounded-md border border-dashed border-cyber-cyan/20 p-6 text-center text-sm text-white/50">
              Henüz satış yok
            </p>
          ) : (
            <BarChart
              data={s.topProducts.map((p) => ({ label: p.title, value: p.sold }))}
              color="#0057FF"
              formatValue={(v) => `${formatNumber(v)} adet`}
            />
          )}
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <RecentOrdersTable limit={10} />
        <RecentPaymentsTable limit={10} />
      </div>

      <LowStockAlert threshold={10} limit={8} />
    </div>
  );
}

function methodLabel(m: PaymentMethod): string {
  switch (m) {
    case 'WALLET':
      return 'Cüzdan';
    case 'PAYTR':
      return 'PayTR';
    case 'PAPARA':
      return 'Papara';
    case 'STRIPE':
      return 'Stripe';
    case 'NOWPAYMENTS':
      return 'Kripto';
    case 'BANK_TRANSFER':
      return 'Havale';
    default:
      return m;
  }
}

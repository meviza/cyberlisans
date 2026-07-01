'use client';

import * as React from 'react';
import { Users, ShoppingCart, Wallet as WalletIcon, Package, ArrowUpRight } from 'lucide-react';
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
  orders: { total: number; today: number; last30Days: number[] };
  revenue: { totalTry: number; last30DaysTry: number; last30Days: number[] };
  products: { active: number };
  paymentsByMethod: Record<PaymentMethod, number>;
  topProducts: { id: string; title: string; sold: number }[];
}

const METHOD_COLORS: Record<PaymentMethod, string> = {
  WALLET: '#00F0FF',
  PAYTR: '#FF00C8',
  PAPARA: '#BEF264',
  STRIPE: '#8B5CF6',
  NOWPAYMENTS: '#FBBF24',
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
      <div className="rounded-md border border-cyber-magenta/30 bg-cyber-magenta/5 p-4 text-cyber-magenta">
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
          <h1 className="font-orbitron text-2xl font-black text-white sm:text-3xl">Dashboard</h1>
          <p className="mt-1 text-sm text-white/60">Genel bakış ve son 30 günlük performans</p>
        </div>
        <a
          href="/admin/audit"
          className="inline-flex items-center gap-1 rounded-md border border-cyber-cyan/30 bg-cyber-cyan/5 px-3 py-1.5 text-xs text-cyber-cyan transition-colors hover:bg-cyber-cyan/10"
        >
          Audit Log
          <ArrowUpRight className="h-3 w-3" />
        </a>
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

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartCard title="Sipariş Trendi" description="Son 30 gün" className="lg:col-span-2">
          <LineChart data={s.orders.last30Days} labels={orderLabels} color="#00F0FF" height={220} />
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
            color="#FF00C8"
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
              color="#00F0FF"
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

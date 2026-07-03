'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Store,
  Star,
  Wallet,
  TrendingUp,
  ExternalLink,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent, Badge, Button, Spinner } from '@cyberlisans/ui/atoms';
import { useAuth } from '@/lib/auth-context';
import { apiFetch, ApiError } from '@/lib/api-client';
import type { SellerInfo } from '@/lib/api-client';
import { StatCard } from '@/components/dashboard/stat-card';

const STATUS_MAP: Record<
  SellerInfo['status'],
  { label: string; variant: 'success' | 'warning' | 'danger' | 'default' }
> = {
  APPROVED: { label: 'Onaylı', variant: 'success' },
  PENDING: { label: 'Onay Bekliyor', variant: 'warning' },
  SUSPENDED: { label: 'Askıda', variant: 'danger' },
  REJECTED: { label: 'Reddedildi', variant: 'danger' },
};

export default function SellerOverviewPage() {
  const { user } = useAuth();
  const [seller, setSeller] = React.useState<SellerInfo | null | undefined>(undefined);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiFetch<SellerInfo>('/sellers/me');
        if (!cancelled) setSeller(res);
      } catch (err) {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 404) setSeller(null);
        else setSeller(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="mx-auto max-w-2xl space-y-6 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-cyber-cyan/40 bg-cyber-cyan/10 text-cyber-cyan">
              <Store className="h-8 w-8" />
            </div>
            <h1 className="font-orbitron text-2xl font-bold text-white">Satıcı Ol, Mağazanı Aç</h1>
            <p className="mt-3 text-sm text-white/70">
              Cyberlisans&apos;ta dijital ürünlerinizi satışa sunun. Komisyon oranlarınız, mağaza
              puanınız ve tüm gelirleriniz tek bir panelde.
            </p>
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Feature icon={TrendingUp} title="Rekabete Dayalı Komisyon" />
              <Feature icon={Wallet} title="Hızlı Ödeme" />
              <Feature icon={Star} title="Müşteri Puanları" />
            </div>
            <Link href="/dashboard/seller/apply" className="mt-8 inline-block">
              <Button size="lg">
                <Store className="h-4 w-4" /> Hemen Başvur
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusInfo = STATUS_MAP[seller.status];

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <div
          className="relative h-32 sm:h-40"
          style={{
            background:
              'linear-gradient(135deg, rgba(0,240,255,0.2) 0%, rgba(139,92,246,0.2) 50%, rgba(255,0,200,0.2) 100%)',
          }}
        >
          <div className="absolute inset-0 bg-grid-pattern opacity-30" />
        </div>
        <CardContent className="relative -mt-10 p-6 sm:p-8">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm text-white/60">Mağaza</p>
              <h1 className="font-orbitron text-2xl font-black text-white sm:text-3xl">
                {seller.companyName}
              </h1>
              <Link
                href={`/s/${seller.slug}`}
                className="mt-1 inline-flex items-center gap-1 text-sm text-cyber-cyan hover:text-cyber-magenta"
              >
                /s/{seller.slug}
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
            <Badge variant={statusInfo.variant} size="lg">
              {seller.status === 'APPROVED' && <CheckCircle2 className="h-3 w-3" />}
              {seller.status === 'PENDING' && <Clock className="h-3 w-3" />}
              {(seller.status === 'REJECTED' || seller.status === 'SUSPENDED') && (
                <AlertCircle className="h-3 w-3" />
              )}
              {statusInfo.label}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Bakiye"
          value={`₺${seller.balance.toLocaleString('tr-TR')}`}
          icon={Wallet}
          hint={`Bekleyen: ₺${seller.pendingBalance.toLocaleString('tr-TR')}`}
        />
        <StatCard
          label="Toplam Satış"
          value={`₺${seller.totalSales.toLocaleString('tr-TR')}`}
          icon={TrendingUp}
        />
        <StatCard
          label="Puan"
          value={seller.rating.toFixed(1)}
          icon={Star}
          hint={`${seller.ratingCount} değerlendirme`}
        />
        <StatCard
          label="Komisyon"
          value={`%${(seller.commissionRate * 100).toFixed(0)}`}
          icon={Store}
          hint="Mevcut oranınız"
        />
      </div>

      {seller.status === 'PENDING' && (
        <Card className="border-cyber-yellow/40">
          <CardContent className="flex items-start gap-3 p-6">
            <Clock className="mt-0.5 h-5 w-5 shrink-0 text-cyber-yellow" />
            <div>
              <h3 className="font-medium text-white">Başvurunuz İnceleniyor</h3>
              <p className="mt-1 text-sm text-white/70">
                Ekibimiz başvurunuzu inceliyor. Onay süreci genellikle 1-3 iş günü sürer.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {seller.status === 'REJECTED' && (
        <Card className="border-cyber-magenta/40">
          <CardContent className="flex items-start gap-3 p-6">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-cyber-magenta" />
            <div>
              <h3 className="font-medium text-white">Başvurunuz Reddedildi</h3>
              <p className="mt-1 text-sm text-white/70">
                Başvurunuz kabul edilmedi. Destek ekibimizle iletişime geçebilirsiniz.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-6">
          <h2 className="mb-4 font-orbitron text-lg font-bold text-white">Yakında</h2>
          <ul className="space-y-2 text-sm text-white/70">
            <li className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-cyber-cyan" /> Ürün yönetimi paneli
            </li>
            <li className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-cyber-cyan" /> Sipariş ve ödeme takibi
            </li>
            <li className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-cyber-cyan" /> Müşteri mesajlaşma
            </li>
            <li className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-cyber-cyan" /> Detaylı satış raporları
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

function Feature({
  icon: Icon,
  title,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-md border border-cyber-cyan/20 bg-cyber-cyan/5 p-3 text-center">
      <Icon className="h-5 w-5 text-cyber-cyan" />
      <span className="text-xs text-white/80">{title}</span>
    </div>
  );
}

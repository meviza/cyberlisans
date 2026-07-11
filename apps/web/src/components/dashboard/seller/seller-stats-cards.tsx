import * as React from 'react';
import { Wallet, TrendingUp, Star, Store } from 'lucide-react';
import { StatCard } from '@/components/dashboard/stat-card';
import type { SellerInfo } from '@/lib/api-client';

export interface SellerStatsCardsProps {
  seller: SellerInfo;
}

function money(n: unknown): string {
  const v = typeof n === 'number' && Number.isFinite(n) ? n : 0;
  return `₺${v.toLocaleString('tr-TR', { maximumFractionDigits: 2 })}`;
}

function num(n: unknown, fallback = 0): number {
  return typeof n === 'number' && Number.isFinite(n) ? n : fallback;
}

/** API may return commission as 12 (percent) or 0.12 (fraction). */
function commissionLabel(rate: unknown): string {
  const r = num(rate, 12);
  const pct = r > 0 && r <= 1 ? r * 100 : r;
  return `%${pct.toFixed(0)}`;
}

export function SellerStatsCards({ seller }: SellerStatsCardsProps) {
  const balance = num(seller.balance);
  const pending = num(seller.pendingBalance);
  const totalSales = num(seller.totalSales);
  const rating = num(seller.rating);
  const ratingCount = num(seller.ratingCount);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="Bakiye"
        value={money(balance)}
        icon={Wallet}
        hint={`Bekleyen: ${money(pending)}`}
      />
      <StatCard label="Toplam Satış" value={money(totalSales)} icon={TrendingUp} />
      <StatCard
        label="Puan"
        value={rating.toFixed(1)}
        icon={Star}
        hint={`${ratingCount} değerlendirme`}
      />
      <StatCard
        label="Komisyon"
        value={commissionLabel(seller.commissionRate)}
        icon={Store}
        hint="Mevcut oranınız"
      />
    </div>
  );
}

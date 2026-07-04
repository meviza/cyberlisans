import * as React from 'react';
import { Wallet, TrendingUp, Star, Store } from 'lucide-react';
import { StatCard } from '@/components/dashboard/stat-card';
import type { SellerInfo } from '@/lib/api-client';

export interface SellerStatsCardsProps {
  seller: SellerInfo;
}

export function SellerStatsCards({ seller }: SellerStatsCardsProps) {
  return (
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
  );
}

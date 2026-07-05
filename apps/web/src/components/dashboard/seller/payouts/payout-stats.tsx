'use client';

import * as React from 'react';
import { Wallet, Clock, ArrowDownToLine } from 'lucide-react';
import { StatCard } from '@/components/dashboard/stat-card';
import { formatCurrency } from '@/lib/format';

export interface PayoutStatsProps {
  availableBalance: number;
  pendingPayouts: number;
  lifetimeWithdrawn: number;
  currency: 'TRY' | 'USD' | 'EUR' | 'USDT';
}

export function PayoutStats({
  availableBalance,
  pendingPayouts,
  lifetimeWithdrawn,
  currency,
}: PayoutStatsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <StatCard
        label="Çekilebilir Bakiye"
        value={formatCurrency(availableBalance, currency)}
        icon={Wallet}
        hint="Şimdi çekebilirsin"
      />
      <StatCard
        label="Bekleyen Payout"
        value={formatCurrency(pendingPayouts, currency)}
        icon={Clock}
        hint="İşlem sürecinde"
      />
      <StatCard
        label="Toplam Çekilen"
        value={formatCurrency(lifetimeWithdrawn, currency)}
        icon={ArrowDownToLine}
        hint="Tüm zamanlar"
      />
    </div>
  );
}

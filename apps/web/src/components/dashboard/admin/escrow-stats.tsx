'use client';

import * as React from 'react';
import { Wallet, Clock, Unlock, AlertCircle } from 'lucide-react';
import { StatCard } from '@/components/dashboard/stat-card';
import { formatCurrency } from '@/lib/format';

export interface EscrowStatsProps {
  held: number;
  pending: number;
  released: number;
  disputed: number;
  currency: 'TRY' | 'USD' | 'EUR' | 'USDT';
}

export function EscrowStats({ held, pending, released, disputed, currency }: EscrowStatsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="Escrow'da"
        value={formatCurrency(held, currency)}
        icon={Wallet}
        hint="Henüz serbest bırakılmadı"
      />
      <StatCard
        label="Bekleyen (7g+)"
        value={formatCurrency(pending, currency)}
        icon={Clock}
        hint="Auto-release için hazır"
      />
      <StatCard
        label="Serbest Bırakılan"
        value={formatCurrency(released, currency)}
        icon={Unlock}
      />
      <StatCard label="İtirazlı" value={formatCurrency(disputed, currency)} icon={AlertCircle} />
    </div>
  );
}

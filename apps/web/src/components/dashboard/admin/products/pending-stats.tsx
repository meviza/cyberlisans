'use client';

import * as React from 'react';
import { Package, CheckCircle2, XCircle } from 'lucide-react';
import { StatCard } from '@/components/dashboard/stat-card';

export interface PendingStatsProps {
  pending: number;
  approvedToday: number;
  rejectedToday: number;
}

export function PendingStats({ pending, approvedToday, rejectedToday }: PendingStatsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <StatCard
        label="Bekleyen Onay"
        value={pending}
        icon={Package}
        hint="İnceleme bekleyen ürünler"
      />
      <StatCard
        label="Bugün Onaylanan"
        value={approvedToday}
        icon={CheckCircle2}
        hint="Son 24 saat"
      />
      <StatCard label="Bugün Reddedilen" value={rejectedToday} icon={XCircle} hint="Son 24 saat" />
    </div>
  );
}

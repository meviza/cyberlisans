'use client';

import * as React from 'react';
import { Package, CheckCircle, Clock, XCircle } from 'lucide-react';
import { StatCard } from '@/components/dashboard/stat-card';

export interface ProductStatsProps {
  total: number;
  active: number;
  pending: number;
  rejected: number;
}

export function ProductStats({ total, active, pending, rejected }: ProductStatsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard label="Toplam Ürün" value={total} icon={Package} hint="Tüm durumlar" />
      <StatCard label="Aktif" value={active} icon={CheckCircle} hint="Satışta" />
      <StatCard label="İncelemede" value={pending} icon={Clock} hint="Onay bekliyor" />
      <StatCard label="Reddedildi" value={rejected} icon={XCircle} hint="Düzeltilmesi gereken" />
    </div>
  );
}

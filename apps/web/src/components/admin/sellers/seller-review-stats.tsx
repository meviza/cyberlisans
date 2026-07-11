'use client';

import * as React from 'react';
import { Clock, CheckCircle2, XCircle, Pause, Store } from 'lucide-react';
import { StatCard } from '@/components/admin/stat-card';
import type { AdminSellerStatusCounts } from '@/lib/api/admin-sellers';

export function SellerReviewStats({ counts }: { counts: AdminSellerStatusCounts | null }) {
  const c = counts ?? { PENDING: 0, APPROVED: 0, SUSPENDED: 0, REJECTED: 0, total: 0 };
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
      <StatCard
        label="Bekleyen"
        value={c.PENDING}
        icon={Clock}
        accent="cyan"
        hint="İnceleme kuyruğu"
      />
      <StatCard
        label="Onaylı"
        value={c.APPROVED}
        icon={CheckCircle2}
        accent="lime"
        hint="Aktif satıcılar"
      />
      <StatCard
        label="Askıda"
        value={c.SUSPENDED}
        icon={Pause}
        accent="magenta"
        hint="Geçici kapatma"
      />
      <StatCard
        label="Reddedilen"
        value={c.REJECTED}
        icon={XCircle}
        accent="purple"
        hint="Kapatılan başvurular"
      />
      <StatCard label="Toplam" value={c.total} icon={Store} accent="cyan" hint="Tüm kayıtlar" />
    </div>
  );
}

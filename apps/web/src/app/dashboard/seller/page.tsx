'use client';

import * as React from 'react';
import { Spinner } from '@cyberlisans/ui/atoms';
import { apiFetch, ApiError } from '@/lib/api-client';
import type { SellerInfo } from '@/lib/api-client';
import { SellerHeader } from '@/components/dashboard/seller/seller-header';
import { SellerStatsCards } from '@/components/dashboard/seller/seller-stats-cards';
import { SellerRoadmap } from '@/components/dashboard/seller/seller-roadmap';
import { ApplySellerPrompt } from '@/components/dashboard/seller/apply-seller-prompt';

export default function SellerOverviewPage() {
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

  if (!seller) return <ApplySellerPrompt />;

  return (
    <div className="space-y-6">
      <SellerHeader seller={seller} />
      <SellerStatsCards seller={seller} />
      <SellerRoadmap />
    </div>
  );
}

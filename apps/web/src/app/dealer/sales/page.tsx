'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Spinner } from '@cyberlisans/ui/atoms';
import { DealerSalesList } from '@/components/dealer/DealerSalesList';
import { apiFetch } from '@/lib/api-client';
import type { DealerLink, DealerProfile, DealerSale } from '@/lib/dealer-types';

export default function DealerSalesPage() {
  const router = useRouter();
  const [profile, setProfile] = React.useState<DealerProfile | null>(null);
  const [sales, setSales] = React.useState<DealerSale[]>([]);
  const [links, setLinks] = React.useState<DealerLink[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;
    Promise.all([
      apiFetch<DealerProfile>('/dealer/me'),
      apiFetch<{ items?: DealerSale[]; data?: DealerSale[] } | DealerSale[]>(
        '/dealer/sales?limit=200',
      ),
      apiFetch<{ items?: DealerLink[]; data?: DealerLink[] } | DealerLink[]>(
        '/dealer/links?limit=100',
      ),
    ])
      .then(([profileRes, salesRes, linksRes]) => {
        if (cancelled) return;
        setProfile(profileRes);
        setSales(Array.isArray(salesRes) ? salesRes : (salesRes.items ?? salesRes.data ?? []));
        setLinks(Array.isArray(linksRes) ? linksRes : (linksRes.items ?? linksRes.data ?? []));
      })
      .catch(() => {
        if (!cancelled) router.replace('/dealer/register');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (loading || !profile) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <DealerSalesList
      profile={profile}
      initialSales={sales}
      links={links.map((l) => ({ id: l.id, code: l.code }))}
    />
  );
}

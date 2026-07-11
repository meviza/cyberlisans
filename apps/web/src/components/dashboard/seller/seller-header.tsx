'use client';

import * as React from 'react';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { Card, CardContent, Badge } from '@cyberlisans/ui/atoms';
import type { SellerInfo } from '@/lib/api-client';
import { SellerStatusBanner } from './seller-status-banner';

const STATUS_MAP: Record<
  SellerInfo['status'],
  { label: string; variant: 'success' | 'warning' | 'danger' }
> = {
  APPROVED: { label: 'Onaylı', variant: 'success' },
  PENDING: { label: 'Onay bekliyor', variant: 'warning' },
  SUSPENDED: { label: 'Askıda', variant: 'danger' },
  REJECTED: { label: 'Reddedildi', variant: 'danger' },
};

export interface SellerHeaderProps {
  seller: SellerInfo;
}

export function SellerHeader({ seller }: SellerHeaderProps) {
  const statusInfo = STATUS_MAP[seller.status];

  return (
    <>
      <Card className="overflow-hidden">
        <div
          className="relative h-32 sm:h-36"
          style={{
            background:
              'radial-gradient(ellipse 70% 80% at 15% 0%, rgba(0,87,255,0.3), transparent 50%), linear-gradient(135deg, #0B1220, #00001e)',
          }}
        >
          <div
            className="absolute inset-0 bg-grid-faint opacity-30"
            style={{ backgroundSize: '48px 48px' }}
          />
        </div>
        <CardContent className="relative -mt-10 p-6 sm:p-8">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm text-brand-muted">Mağaza</p>
              <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                {seller.companyName}
              </h1>
              <Link
                href={`/s/${seller.slug}`}
                className="mt-1 inline-flex items-center gap-1 text-sm text-brand-accent hover:underline"
              >
                /s/{seller.slug}
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
            <Badge variant={statusInfo.variant} size="lg">
              {statusInfo.label}
            </Badge>
          </div>
        </CardContent>
      </Card>
      <SellerStatusBanner status={seller.status} />
    </>
  );
}

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
  PENDING: { label: 'Onay Bekliyor', variant: 'warning' },
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
          className="relative h-32 sm:h-40"
          style={{
            background:
              'linear-gradient(135deg, rgba(0,240,255,0.2) 0%, rgba(139,92,246,0.2) 50%, rgba(255,0,200,0.2) 100%)',
          }}
        >
          <div className="absolute inset-0 bg-grid-pattern opacity-30" />
        </div>
        <CardContent className="relative -mt-10 p-6 sm:p-8">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm text-white/60">Mağaza</p>
              <h1 className="font-orbitron text-2xl font-black text-white sm:text-3xl">
                {seller.companyName}
              </h1>
              <Link
                href={`/s/${seller.slug}`}
                className="mt-1 inline-flex items-center gap-1 text-sm text-cyber-cyan hover:text-cyber-magenta"
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

'use client';

import * as React from 'react';
import { User, Star, ShoppingBag, ShieldCheck } from 'lucide-react';
import { Card, CardContent, Badge } from '@cyberlisans/ui/atoms';
import type { ProductSellerSummary } from '@/lib/api/admin-products';

export interface ProductSellerInfoProps {
  seller: ProductSellerSummary;
}

const KYC_MAP: Record<
  ProductSellerSummary['kycStatus'],
  { label: string; variant: 'success' | 'warning' | 'danger' }
> = {
  VERIFIED: { label: 'Doğrulandı', variant: 'success' },
  PENDING: { label: 'Beklemede', variant: 'warning' },
  REJECTED: { label: 'Reddedildi', variant: 'danger' },
};

export function ProductSellerInfo({ seller }: ProductSellerInfoProps) {
  const kyc = KYC_MAP[seller.kycStatus];
  const initials = seller.name
    .split(' ')
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();

  return (
    <Card>
      <CardContent className="space-y-4 p-6">
        <h3 className="font-orbitron text-sm font-bold uppercase tracking-wider text-white/70">
          Satıcı
        </h3>
        <div className="flex items-center gap-3">
          {seller.avatarUrl ? (
            <img
              src={seller.avatarUrl}
              alt={seller.name}
              className="h-12 w-12 rounded-full border border-cyber-cyan/30 object-cover"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-cyber-cyan/30 bg-cyber-darker font-orbitron text-sm font-bold text-cyber-cyan">
              {initials || <User className="h-5 w-5" />}
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate font-medium text-white">{seller.name}</p>
            <p className="font-mono text-xs text-white/40">{seller.id.slice(0, 10)}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 border-t border-cyber-cyan/20 pt-3">
          <div className="rounded-md border border-cyber-cyan/20 bg-cyber-darker/40 p-3">
            <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-white/50">
              <Star className="h-3.5 w-3.5 text-cyber-yellow" />
              Puan
            </div>
            <p className="mt-1 font-orbitron text-lg font-bold text-white">
              {seller.rating.toFixed(1)}
            </p>
          </div>
          <div className="rounded-md border border-cyber-cyan/20 bg-cyber-darker/40 p-3">
            <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-white/50">
              <ShoppingBag className="h-3.5 w-3.5" />
              Toplam Satış
            </div>
            <p className="mt-1 font-orbitron text-lg font-bold text-white">
              {seller.totalSales.toLocaleString('tr-TR')}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between border-t border-cyber-cyan/20 pt-3">
          <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-white/50">
            <ShieldCheck className="h-3.5 w-3.5" />
            KYC Durumu
          </div>
          <Badge variant={kyc.variant} size="sm">
            {kyc.label}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

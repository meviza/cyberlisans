import * as React from 'react';
import Link from 'next/link';
import { Star, Store, ExternalLink } from 'lucide-react';
import { Card, CardContent, Badge } from '@cyberlisans/ui/atoms';
import type { PublicSeller } from '@/app/s/[slug]/seller-types';

export interface SellerHeroProps {
  seller: PublicSeller;
}

export function SellerHero({ seller }: SellerHeroProps) {
  return (
    <Card className="overflow-hidden">
      <div
        className="relative h-40 sm:h-56"
        style={{
          background:
            'linear-gradient(135deg, rgba(0,240,255,0.25) 0%, rgba(139,92,246,0.25) 50%, rgba(255,0,200,0.25) 100%)',
        }}
      >
        <div className="absolute inset-0 bg-grid-pattern opacity-30" />
      </div>
      <CardContent className="relative -mt-14 p-6 sm:p-8">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-end gap-4">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 border-cyber-cyan/50 bg-cyber-darker shadow-[0_0_30px_rgba(0,240,255,0.3)]">
              {seller.logoUrl ? (
                <img
                  src={seller.logoUrl}
                  alt={seller.companyName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <Store className="h-10 w-10 text-cyber-cyan" />
              )}
            </div>
            <div>
              <h1 className="font-orbitron text-2xl font-black text-white sm:text-3xl">
                {seller.companyName}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge variant="success" size="sm">
                  <CheckBadge /> Doğrulanmış Satıcı
                </Badge>
                <span className="flex items-center gap-1 text-sm text-cyber-yellow">
                  <Star className="h-4 w-4 fill-current" />
                  {seller.rating.toFixed(1)}{' '}
                  <span className="text-white/50">({seller.ratingCount})</span>
                </span>
              </div>
            </div>
          </div>
          {seller.websiteUrl && (
            <a
              href={seller.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-cyber-cyan hover:text-cyber-magenta"
            >
              <ExternalLink className="inline h-3 w-3" /> Web Sitesi
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function CheckBadge() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M5 12l5 5L20 7"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

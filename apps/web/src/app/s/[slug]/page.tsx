import * as React from 'react';
import Link from 'next/link';
import { Store } from 'lucide-react';
import { Button } from '@cyberlisans/ui/atoms';
import { SellerHero } from '@/components/public-seller/seller-hero';
import { SellerProductsGrid } from '@/components/public-seller/seller-products-grid';
import { SellerFooter } from '@/components/public-seller/seller-footer';
import type { PublicSeller, FetchResult } from './seller-types';

const API_URL =
  process.env['NEXT_PUBLIC_API_URL'] ?? process.env['API_INTERNAL_URL'] ?? 'http://localhost:3001';

export const dynamic = 'force-dynamic';

async function fetchSeller(slug: string): Promise<FetchResult> {
  try {
    const res = await fetch(`${API_URL}/sellers/${encodeURIComponent(slug)}/public`, {
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) return { seller: null, error: res.status >= 500 };
    const data = (await res.json()) as PublicSeller;
    return { seller: data, error: false };
  } catch {
    return { seller: null, error: true };
  }
}

export default async function PublicSellerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  if (!slug || !/^[a-z0-9-]{3,40}$/.test(slug)) {
    return <NotFoundView slug={slug} reason="invalid" />;
  }

  const { seller, error } = await fetchSeller(slug);

  if (error) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <div className="rounded-md border border-cyber-magenta/40 bg-cyber-magenta/10 px-6 py-4 text-sm text-cyber-magenta">
          Mağaza bilgileri şu anda yüklenemiyor. Lütfen daha sonra tekrar deneyin.
        </div>
      </div>
    );
  }

  if (!seller || seller.status !== 'APPROVED') {
    return <NotFoundView slug={slug} reason="not-found" />;
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <SellerHero seller={seller} />
      <SellerFooter seller={seller} />
      <SellerProductsGrid />
    </div>
  );
}

function NotFoundView({ slug, reason }: { slug: string; reason: 'invalid' | 'not-found' }) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-white/20 bg-white/5 text-white/50">
        <Store className="h-8 w-8" />
      </div>
      <h1 className="font-orbitron text-2xl font-bold text-white">Mağaza Bulunamadı</h1>
      <p className="mt-2 text-sm text-white/60">
        {reason === 'invalid'
          ? 'Geçersiz mağaza adresi.'
          : `${slug} adresinde bir mağaza bulunamadı veya henüz onaylanmamış.`}
      </p>
      <Link href="/" className="mt-6 inline-block">
        <Button variant="outline">Ana Sayfaya Dön</Button>
      </Link>
    </div>
  );
}

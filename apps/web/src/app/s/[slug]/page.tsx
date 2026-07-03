import * as React from 'react';
import Link from 'next/link';
import { Star, Store, Calendar, ShoppingBag, ExternalLink } from 'lucide-react';
import { Card, CardContent, Badge, Button } from '@cyberlisans/ui/atoms';

const API_URL =
  process.env['NEXT_PUBLIC_API_URL'] ?? process.env['API_INTERNAL_URL'] ?? 'http://localhost:3001';

export const dynamic = 'force-dynamic';

interface PublicSeller {
  id: string;
  slug: string;
  companyName: string;
  bio: string | null;
  logoUrl: string | null;
  status: 'PENDING' | 'APPROVED' | 'SUSPENDED' | 'REJECTED';
  rating: number;
  ratingCount: number;
  totalSales: number;
  joinedAt: string;
  websiteUrl: string | null;
}

interface FetchResult {
  seller: PublicSeller | null;
  error: boolean;
}

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

  const joined = new Date(seller.joinedAt).toLocaleDateString('tr-TR', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            <h2 className="mb-3 font-orbitron text-lg font-bold text-white">Hakkında</h2>
            <p className="text-sm leading-relaxed text-white/80">
              {seller.bio || 'Bu satıcı henüz bir açıklama eklememiş.'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-3 p-6 text-sm">
            <Stat icon={ShoppingBag} label="Toplam Satış" value={`${seller.totalSales} adet`} />
            <Stat icon={Star} label="Ortalama Puan" value={`${seller.rating.toFixed(1)} / 5`} />
            <Stat icon={Calendar} label="Katılım" value={joined} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-6">
          <h2 className="mb-4 font-orbitron text-lg font-bold text-white">Mağaza Ürünleri</h2>
          <div className="rounded-md border border-dashed border-cyber-cyan/30 bg-cyber-darker/40 px-6 py-12 text-center">
            <Store className="mx-auto mb-3 h-10 w-10 text-white/40" />
            <p className="text-sm text-white/60">
              Bu satıcının ürünleri yakında burada listelenecek.
            </p>
          </div>
        </CardContent>
      </Card>
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

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-md border border-cyber-cyan/20 bg-cyber-cyan/5 px-3 py-2">
      <div className="flex items-center gap-2 text-white/70">
        <Icon className="h-4 w-4 text-cyber-cyan" />
        <span className="text-xs uppercase tracking-wider">{label}</span>
      </div>
      <span className="font-medium text-white">{value}</span>
    </div>
  );
}

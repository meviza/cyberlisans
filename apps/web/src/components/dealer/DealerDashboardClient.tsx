'use client';

import * as React from 'react';
import Link from 'next/link';
import { ShoppingBag, TrendingUp, Wallet, CreditCard, ArrowUpRight, Link2 } from 'lucide-react';
import { Card, CardContent, Badge, Button, Spinner } from '@cyberlisans/ui/atoms';
import { DealerStatCard } from '@/components/dealer/DealerStatCard';
import { DealerSalesTable } from '@/components/dealer/DealerSalesTable';
import { DealerCommissionsChart } from '@/components/dealer/DealerCommissionsChart';
import { DealerAccessGuard } from '@/components/dealer/DealerStatusBanner';
import type { DealerProfile, DealerStats } from '@/lib/dealer-types';
import { dealerStatusLabel, dealerStatusVariant } from '@/lib/dealer-utils';

interface DealerDashboardClientProps {
  initialProfile: DealerProfile;
  initialStats: DealerStats;
}

const fmtTRY = (n: number) =>
  new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 2,
  }).format(n);

export function DealerDashboardClient({
  initialProfile,
  initialStats,
}: DealerDashboardClientProps) {
  return (
    <DealerAccessGuard status={initialProfile.status}>
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-white/60">Hoş geldin,</p>
                <h1 className="font-orbitron text-3xl font-black text-white">
                  {initialProfile.companyName}
                </h1>
                <p className="mt-1 text-sm text-white/60">
                  Komisyon oranı:{' '}
                  <span className="text-cyber-cyan">%{initialProfile.commissionRate}</span>
                </p>
              </div>
              <div className="flex gap-2">
                <Badge variant={dealerStatusVariant(initialProfile.status)} size="lg">
                  {dealerStatusLabel(initialProfile.status)}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <DealerStatCard
            label="Toplam Satış"
            value={initialStats.totalSales}
            icon={ShoppingBag}
            hint="Tüm zamanlar"
            accent="cyan"
          />
          <DealerStatCard
            label="Toplam Brüt"
            value={fmtTRY(initialStats.totalGross)}
            icon={TrendingUp}
            hint="Tüm zamanlar"
            accent="magenta"
          />
          <DealerStatCard
            label="Toplam Komisyon"
            value={fmtTRY(initialStats.totalCommission)}
            icon={Wallet}
            hint="Tüm zamanlar"
            accent="lime"
          />
          <DealerStatCard
            label="Bakiye"
            value={fmtTRY(initialStats.balance)}
            icon={CreditCard}
            hint="Çekilebilir"
            accent="purple"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card>
            <CardContent className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-orbitron text-lg font-bold text-white">Satış Trendi</h2>
                <span className="text-xs text-white/50">Son 30 gün</span>
              </div>
              <DealerCommissionsChart
                data={initialStats.salesTrend.map((d) => d.amount)}
                labels={initialStats.salesTrend.map((d) => d.date)}
                color="#00F0FF"
                gradientFrom="rgba(0,240,255,0.4)"
                gradientTo="rgba(0,240,255,0)"
                height={180}
              />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-orbitron text-lg font-bold text-white">Komisyon Trendi</h2>
                <span className="text-xs text-white/50">Son 30 gün</span>
              </div>
              <DealerCommissionsChart
                data={initialStats.commissionTrend.map((d) => d.amount)}
                labels={initialStats.commissionTrend.map((d) => d.date)}
                color="#FF00C8"
                gradientFrom="rgba(255,0,200,0.4)"
                gradientTo="rgba(255,0,200,0)"
                height={180}
              />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-orbitron text-lg font-bold text-white">Son Satışlar</h2>
              <Link
                href="/dealer/sales"
                className="text-sm text-cyber-cyan hover:text-cyber-magenta"
              >
                Tümünü Gör →
              </Link>
            </div>
            <DealerSalesTable sales={initialStats.recentSales} compact />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card>
            <CardContent className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-orbitron text-lg font-bold text-white">En Çok Satan Ürünler</h2>
              </div>
              {initialStats.topProducts.length === 0 ? (
                <p className="text-sm text-white/50">Henüz satış yok.</p>
              ) : (
                <div className="space-y-2">
                  {initialStats.topProducts.map((p, i) => (
                    <div
                      key={p.productId}
                      className="flex items-center justify-between rounded-md border border-cyber-cyan/20 bg-cyber-darker/40 px-3 py-2"
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-cyber-cyan/20 font-mono text-xs text-cyber-cyan">
                          {i + 1}
                        </span>
                        <span className="truncate text-sm text-white">{p.productName}</span>
                      </div>
                      <div className="flex shrink-0 items-center gap-3 text-right">
                        <span className="text-xs text-white/60">{p.count} adet</span>
                        <span className="font-mono text-sm text-cyber-cyan">{fmtTRY(p.gross)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-orbitron text-lg font-bold text-white">Aktif Linkler</h2>
                <Link
                  href="/dealer/links"
                  className="text-sm text-cyber-cyan hover:text-cyber-magenta"
                >
                  Tümü →
                </Link>
              </div>
              {initialStats.activeLinks.length === 0 ? (
                <div className="flex flex-col items-center gap-2 rounded-md border border-dashed border-cyber-cyan/30 p-6 text-center">
                  <Link2 className="h-6 w-6 text-white/40" />
                  <p className="text-sm text-white/50">Henüz aktif link yok.</p>
                  <Link href="/dealer/links/new">
                    <Button size="sm">
                      <Link2 className="h-3.5 w-3.5" />
                      Yeni Link Oluştur
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {initialStats.activeLinks.slice(0, 5).map((l) => (
                    <Link
                      key={l.id}
                      href={`/dealer/links/${l.id}`}
                      className="flex items-center justify-between rounded-md border border-cyber-cyan/20 bg-cyber-darker/40 px-3 py-2 transition-colors hover:border-cyber-cyan/50"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-mono text-sm text-cyber-cyan">{l.code}</p>
                        <p className="truncate text-xs text-white/60">
                          {l.productName ?? 'Tüm ürünler'} • %{l.discountPercent}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2 text-right">
                        <span className="text-xs text-white/60">{l.currentUses} kullanım</span>
                        <ArrowUpRight className="h-3.5 w-3.5 text-white/40" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DealerAccessGuard>
  );
}

export function DealerDashboardLoading() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <Spinner size="lg" />
    </div>
  );
}

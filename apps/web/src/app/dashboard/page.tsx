'use client';

import * as React from 'react';
import Link from 'next/link';
import { CreditCard, ShoppingBag, Sparkles, Receipt, Wallet, ArrowUpRight, Shield, Mail, Clock } from 'lucide-react';
import { Card, CardContent, Badge, Button } from '@cyberlisans/ui/atoms';
import { useAuth } from '@/lib/auth-context';
import { StatCard } from '@/components/dashboard/stat-card';

interface RecentOrder {
  id: string;
  date: string;
  product: string;
  amount: number;
  status: 'paid' | 'pending' | 'fulfilled' | 'cancelled';
}

const MOCK_ORDERS: RecentOrder[] = [
  { id: 'ORD-2024-1842', date: '28 Haz 2026', product: 'Steam Cüzdan 50 TL', amount: 50, status: 'fulfilled' },
  { id: 'ORD-2024-1839', date: '27 Haz 2026', product: 'OpenAI API $10', amount: 320, status: 'fulfilled' },
  { id: 'ORD-2024-1835', date: '24 Haz 2026', product: 'Windows 11 Pro Key', amount: 1200, status: 'paid' },
  { id: 'ORD-2024-1821', date: '19 Haz 2026', product: 'Netflix Premium 1 Ay', amount: 250, status: 'fulfilled' },
  { id: 'ORD-2024-1810', date: '12 Haz 2026', product: 'Discord Nitro 1 Ay', amount: 200, status: 'cancelled' },
];

const STATUS_MAP: Record<RecentOrder['status'], { label: string; variant: 'success' | 'warning' | 'danger' | 'default' }> = {
  paid: { label: 'Ödendi', variant: 'warning' },
  pending: { label: 'Bekliyor', variant: 'warning' },
  fulfilled: { label: 'Teslim Edildi', variant: 'success' },
  cancelled: { label: 'İptal', variant: 'danger' },
};

export default function DashboardOverviewPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <div
          className="relative h-40 sm:h-48"
          style={{
            background:
              'linear-gradient(135deg, rgba(0,240,255,0.2) 0%, rgba(139,92,246,0.2) 50%, rgba(255,0,200,0.2) 100%)',
          }}
        >
          <div className="absolute inset-0 bg-grid-pattern opacity-30" />
        </div>
        <CardContent className="relative -mt-12 p-6 sm:p-8">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm text-white/60">Hoş geldin,</p>
              <h1 className="font-orbitron text-3xl font-black text-white">
                {user?.displayName ?? user?.username}
              </h1>
              <p className="mt-1 text-sm text-white/60">{user?.email}</p>
            </div>
            <div className="flex gap-2">
              <Badge variant="magenta" size="lg">{user?.role}</Badge>
              <Badge variant="default" size="lg">{user?.currency}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Toplam Harcama"
          value={`₺${(user?.wallet.balanceTry ?? 0).toLocaleString()}`}
          icon={CreditCard}
          trend={{ value: 12.4, positive: true }}
        />
        <StatCard
          label="Aktif Lisanslar"
          value="14"
          icon={ShoppingBag}
          hint="Son 30 günde +3"
        />
        <StatCard
          label="Sadakat Puanı"
          value="2.450"
          icon={Sparkles}
          hint="450 puana 550 puan kaldı"
        />
        <StatCard
          label="Son Sipariş"
          value="₺320"
          icon={Receipt}
          hint="28 Haz 2026"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-orbitron text-lg font-bold text-white">Hızlı Eylemler</h2>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Link href="/dashboard/wallet">
                <Button variant="primary" className="w-full">
                  <Wallet className="h-4 w-4" />
                  Cüzdan Yükle
                </Button>
              </Link>
              <Link href="/products">
                <Button variant="outline" className="w-full">
                  <ShoppingBag className="h-4 w-4" />
                  Ürünlere Göz At
                </Button>
              </Link>
              <Link href="/dashboard/settings">
                <Button variant="ghost" className="w-full">
                  <Shield className="h-4 w-4" />
                  Ayarlar
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h2 className="mb-4 font-orbitron text-lg font-bold text-white">Hesap Durumu</h2>
            <div className="space-y-3">
              <StatusRow
                icon={Mail}
                label="E-posta doğrulandı"
                status="success"
                detail={user?.email ?? ''}
              />
              <StatusRow
                icon={Shield}
                label="2FA"
                status={user?.twoFactorEnabled ? 'success' : 'warning'}
                detail={user?.twoFactorEnabled ? 'Aktif' : 'Pasif'}
              />
              <StatusRow
                icon={Clock}
                label="Son giriş"
                status="default"
                detail="Şimdi"
              />
            </div>
            <Link
              href="/dashboard/settings"
              className="mt-4 inline-flex items-center gap-1 text-sm text-cyber-cyan hover:text-cyber-magenta"
            >
              Güvenliği yönet
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-orbitron text-lg font-bold text-white">Son Siparişler</h2>
            <Link
              href="/dashboard/orders"
              className="text-sm text-cyber-cyan hover:text-cyber-magenta"
            >
              Tümünü Gör →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-cyber-cyan/20 text-left text-xs uppercase tracking-wider text-white/60">
                  <th className="py-3 pr-4">Sipariş No</th>
                  <th className="py-3 pr-4">Tarih</th>
                  <th className="py-3 pr-4">Ürün</th>
                  <th className="py-3 pr-4 text-right">Tutar</th>
                  <th className="py-3 pr-4">Durum</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_ORDERS.slice(0, 5).map((o) => {
                  const s = STATUS_MAP[o.status];
                  return (
                    <tr key={o.id} className="border-b border-cyber-cyan/10 transition-colors hover:bg-cyber-cyan/5">
                      <td className="py-3 pr-4 font-mono text-cyber-cyan">{o.id}</td>
                      <td className="py-3 pr-4 text-white/70">{o.date}</td>
                      <td className="py-3 pr-4 text-white">{o.product}</td>
                      <td className="py-3 pr-4 text-right font-medium text-white">₺{o.amount.toLocaleString()}</td>
                      <td className="py-3 pr-4">
                        <Badge variant={s.variant} size="sm">{s.label}</Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatusRow({
  icon: Icon,
  label,
  status,
  detail,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  status: 'success' | 'warning' | 'default';
  detail: string;
}) {
  const colors =
    status === 'success'
      ? 'text-cyber-lime border-cyber-lime/30 bg-cyber-lime/5'
      : status === 'warning'
      ? 'text-cyber-magenta border-cyber-magenta/30 bg-cyber-magenta/5'
      : 'text-white/70 border-white/20 bg-white/5';
  return (
    <div className={`flex items-center justify-between rounded-md border px-3 py-2 ${colors}`}>
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4" />
        <span className="text-sm">{label}</span>
      </div>
      <span className="text-xs font-medium">{detail}</span>
    </div>
  );
}
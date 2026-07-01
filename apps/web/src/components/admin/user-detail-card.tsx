import * as React from 'react';
import Link from 'next/link';
import { Avatar, AvatarFallback, Badge, Card, CardContent } from '@cyberlisans/ui/atoms';
import { MailCheck, MailX, Shield, ShieldCheck, Wallet, Calendar } from 'lucide-react';
import { formatCurrency, formatDateTime } from '@/lib/format';

export interface AdminUserDetail {
  id: string;
  email: string;
  emailVerified: boolean;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  locale: string;
  currency: string;
  role: 'CUSTOMER' | 'ADMIN' | 'SUPER_ADMIN';
  status: 'ACTIVE' | 'SUSPENDED' | 'BANNED' | 'PENDING_VERIFICATION';
  twoFactorEnabled: boolean;
  isAdult: boolean;
  marketingOptIn: boolean;
  referralCode: string;
  referredById: string | null;
  createdAt: Date | string;
  lastLoginAt: Date | string | null;
  wallet: {
    balanceTry: number;
    balanceUsd: number;
    balanceEur: number;
    balanceUsdt: number;
    loyaltyCoins: number;
  } | null;
  counts: { orders: number; payments: number; auditLogs: number };
}

const STATUS_LABEL = {
  ACTIVE: 'Aktif',
  SUSPENDED: 'Askıda',
  BANNED: 'Yasaklı',
  PENDING_VERIFICATION: 'Onay Bekliyor',
} as const;

const STATUS_VARIANT = {
  ACTIVE: 'success',
  SUSPENDED: 'warning',
  BANNED: 'danger',
  PENDING_VERIFICATION: 'default',
} as const;

const ROLE_LABEL = {
  CUSTOMER: 'Müşteri',
  ADMIN: 'Admin',
  SUPER_ADMIN: 'Süper Admin',
} as const;

export function UserDetailCard({ user }: { user: AdminUserDetail }) {
  return (
    <Card>
      <CardContent className="space-y-6 p-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16">
            {user.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.avatarUrl}
                alt={user.username}
                className="h-full w-full object-cover"
              />
            ) : null}
            <AvatarFallback className="bg-cyber-purple/20 text-base text-cyber-purple">
              {(user.displayName ?? user.username).slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate font-orbitron text-xl font-bold text-white">
                {user.displayName ?? user.username}
              </h2>
              <Badge variant={STATUS_VARIANT[user.status]} size="sm">
                {STATUS_LABEL[user.status]}
              </Badge>
              <Badge
                variant={
                  user.role === 'SUPER_ADMIN'
                    ? 'magenta'
                    : user.role === 'ADMIN'
                      ? 'cyan'
                      : 'default'
                }
                size="sm"
              >
                {ROLE_LABEL[user.role]}
              </Badge>
            </div>
            <p className="mt-1 font-mono text-sm text-white/70">{user.email}</p>
            <p className="text-xs text-white/50">@{user.username}</p>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-white/60">
              <span className="inline-flex items-center gap-1">
                {user.emailVerified ? (
                  <MailCheck className="h-3.5 w-3.5 text-cyber-lime" />
                ) : (
                  <MailX className="h-3.5 w-3.5 text-cyber-magenta" />
                )}
                {user.emailVerified ? 'E-posta doğrulandı' : 'E-posta doğrulanmadı'}
              </span>
              <span className="inline-flex items-center gap-1">
                {user.twoFactorEnabled ? (
                  <ShieldCheck className="h-3.5 w-3.5 text-cyber-lime" />
                ) : (
                  <Shield className="h-3.5 w-3.5 text-white/40" />
                )}
                {user.twoFactorEnabled ? '2FA açık' : '2FA kapalı'}
              </span>
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-white/40" />
                Kayıt: {formatDateTime(user.createdAt)}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 border-t border-cyber-cyan/20 pt-6 md:grid-cols-2">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-wider text-white/50">
              <Wallet className="h-3.5 w-3.5 text-cyber-cyan" />
              Cüzdan Bakiyesi
            </div>
            {user.wallet ? (
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="rounded border border-cyber-cyan/20 bg-cyber-darker/50 p-2">
                  <p className="text-[10px] uppercase text-white/40">TRY</p>
                  <p className="font-mono font-medium text-white">
                    {formatCurrency(user.wallet.balanceTry, 'TRY')}
                  </p>
                </div>
                <div className="rounded border border-cyber-cyan/20 bg-cyber-darker/50 p-2">
                  <p className="text-[10px] uppercase text-white/40">USD</p>
                  <p className="font-mono font-medium text-white">
                    {formatCurrency(user.wallet.balanceUsd, 'USD')}
                  </p>
                </div>
                <div className="rounded border border-cyber-cyan/20 bg-cyber-darker/50 p-2">
                  <p className="text-[10px] uppercase text-white/40">EUR</p>
                  <p className="font-mono font-medium text-white">
                    {formatCurrency(user.wallet.balanceEur, 'EUR')}
                  </p>
                </div>
                <div className="rounded border border-cyber-cyan/20 bg-cyber-darker/50 p-2">
                  <p className="text-[10px] uppercase text-white/40">USDT</p>
                  <p className="font-mono font-medium text-white">
                    {formatCurrency(user.wallet.balanceUsdt, 'USDT')}
                  </p>
                </div>
                <div className="col-span-2 rounded border border-cyber-purple/20 bg-cyber-purple/5 p-2 text-xs text-white/70">
                  Sadakat Puanı:{' '}
                  <span className="font-mono text-cyber-purple">{user.wallet.loyaltyCoins}</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-white/50">Cüzdan yok</p>
            )}
          </div>

          <div>
            <div className="mb-2 text-xs uppercase tracking-wider text-white/50">İstatistikler</div>
            <div className="grid grid-cols-3 gap-2">
              <Link
                href="#orders"
                className="rounded border border-cyber-cyan/20 bg-cyber-darker/50 p-2 text-center transition-colors hover:border-cyber-cyan/60"
              >
                <p className="font-orbitron text-lg font-bold text-cyber-cyan">
                  {user.counts.orders}
                </p>
                <p className="text-[10px] uppercase text-white/40">Sipariş</p>
              </Link>
              <Link
                href="#payments"
                className="rounded border border-cyber-magenta/20 bg-cyber-darker/50 p-2 text-center transition-colors hover:border-cyber-magenta/60"
              >
                <p className="font-orbitron text-lg font-bold text-cyber-magenta">
                  {user.counts.payments}
                </p>
                <p className="text-[10px] uppercase text-white/40">Ödeme</p>
              </Link>
              <Link
                href="#audit"
                className="rounded border border-cyber-purple/20 bg-cyber-darker/50 p-2 text-center transition-colors hover:border-cyber-purple/60"
              >
                <p className="font-orbitron text-lg font-bold text-cyber-purple">
                  {user.counts.auditLogs}
                </p>
                <p className="text-[10px] uppercase text-white/40">Audit</p>
              </Link>
            </div>

            <dl className="mt-4 space-y-2 text-xs">
              <div className="flex justify-between">
                <dt className="text-white/50">Son giriş</dt>
                <dd className="text-white/80">
                  {user.lastLoginAt ? formatDateTime(user.lastLoginAt) : '—'}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-white/50">Dil</dt>
                <dd className="font-mono text-white/80">{user.locale}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-white/50">Para Birimi</dt>
                <dd className="font-mono text-white/80">{user.currency}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-white/50">Referans</dt>
                <dd className="font-mono text-white/80">{user.referralCode}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-white/50">18+ onayı</dt>
                <dd className="text-white/80">{user.isAdult ? 'Evet' : 'Hayır'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-white/50">Pazarlama</dt>
                <dd className="text-white/80">{user.marketingOptIn ? 'Opt-in' : 'Opt-out'}</dd>
              </div>
            </dl>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

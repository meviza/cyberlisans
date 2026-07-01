'use client';

import * as React from 'react';
import Link from 'next/link';
import { Avatar, AvatarFallback, Badge, Spinner } from '@cyberlisans/ui/atoms';
import { Eye, Wallet, Ban, CheckCircle2, MoreHorizontal } from 'lucide-react';
import { apiFetch, ApiError } from '@/lib/api-client';
import { formatCurrency, formatDateTime } from '@/lib/format';
import { cn } from '@cyberlisans/ui/cn';
import { AdjustWalletModal } from './adjust-wallet-modal';
import { SuspendUserButton } from './suspend-user-button';

export type UserRole = 'CUSTOMER' | 'ADMIN' | 'SUPER_ADMIN';
export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'BANNED' | 'PENDING_VERIFICATION';

export interface AdminUserRow {
  id: string;
  email: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  role: UserRole;
  status: UserStatus;
  twoFactorEnabled: boolean;
  emailVerified: boolean;
  walletBalance: { TRY: number; USD: number; EUR: number; USDDT: number };
  lastLoginAt: string | null;
  createdAt: string;
}

const ROLE_LABEL: Record<UserRole, string> = {
  CUSTOMER: 'Müşteri',
  ADMIN: 'Admin',
  SUPER_ADMIN: 'Süper Admin',
};

const ROLE_VARIANT: Record<UserRole, 'default' | 'cyan' | 'magenta'> = {
  CUSTOMER: 'default',
  ADMIN: 'cyan',
  SUPER_ADMIN: 'magenta',
};

const STATUS_LABEL: Record<UserStatus, string> = {
  ACTIVE: 'Aktif',
  SUSPENDED: 'Askıda',
  BANNED: 'Yasaklı',
  PENDING_VERIFICATION: 'Onay Bekliyor',
};

const STATUS_VARIANT: Record<UserStatus, 'success' | 'warning' | 'danger' | 'default'> = {
  ACTIVE: 'success',
  SUSPENDED: 'warning',
  BANNED: 'danger',
  PENDING_VERIFICATION: 'default',
};

export interface UsersTableProps {
  filters: { search?: string; role?: string; status?: string; from?: string; to?: string };
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  refreshKey?: number;
  onMutated?: () => void;
}

export function UsersTable({
  filters,
  page,
  pageSize,
  onPageChange,
  refreshKey = 0,
  onMutated,
}: UsersTableProps) {
  const [data, setData] = React.useState<AdminUserRow[] | null>(null);
  const [total, setTotal] = React.useState(0);
  const [error, setError] = React.useState<string | null>(null);
  const [walletTarget, setWalletTarget] = React.useState<AdminUserRow | null>(null);

  const load = React.useCallback(async () => {
    setError(null);
    try {
      const qs = new URLSearchParams();
      qs.set('page', String(page));
      qs.set('limit', String(pageSize));
      if (filters.search) qs.set('search', filters.search);
      if (filters.role) qs.set('role', filters.role);
      if (filters.status) qs.set('status', filters.status);
      if (filters.from) qs.set('from', filters.from);
      if (filters.to) qs.set('to', filters.to);
      const res = await apiFetch<{ items: AdminUserRow[]; total: number; totalPages: number }>(
        `/api/admin/users?${qs.toString()}`,
      );
      setData(res.items);
      setTotal(res.total);
    } catch (e) {
      if (e instanceof ApiError) setError(e.message);
      else setError('Yüklenemedi');
      setData([]);
    }
  }, [filters.search, filters.role, filters.status, filters.from, filters.to, page, pageSize]);

  React.useEffect(() => {
    load();
  }, [load, refreshKey]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  if (!data && !error) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-cyber-cyan/20 bg-cyber-darker/40">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-lg border border-cyber-cyan/20 bg-cyber-darker/40">
        <div className="flex items-center justify-between border-b border-cyber-cyan/20 px-4 py-2 text-xs text-white/50">
          <span>{total} kullanıcı</span>
          <span>
            Sayfa {page} / {totalPages}
          </span>
        </div>

        {error && (
          <div className="border-b border-cyber-magenta/30 bg-cyber-magenta/5 p-4 text-sm text-cyber-magenta">
            {error}
          </div>
        )}

        {data && data.length === 0 && !error && (
          <p className="p-8 text-center text-sm text-white/50">Sonuç bulunamadı</p>
        )}

        {data && data.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-cyber-cyan/20 bg-cyber-darker/60">
                <tr className="text-left text-xs uppercase tracking-wider text-white/50">
                  <th className="px-4 py-3">Kullanıcı</th>
                  <th className="px-4 py-3">Rol</th>
                  <th className="px-4 py-3">Durum</th>
                  <th className="px-4 py-3 text-right">Cüzdan (₺)</th>
                  <th className="px-4 py-3">Son Giriş</th>
                  <th className="px-4 py-3">Kayıt</th>
                  <th className="px-4 py-3 text-right">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {data.map((u) => (
                  <tr
                    key={u.id}
                    className="border-b border-cyber-cyan/10 transition-colors hover:bg-cyber-cyan/5"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          {u.avatarUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={u.avatarUrl}
                              alt={u.username}
                              className="h-full w-full object-cover"
                            />
                          ) : null}
                          <AvatarFallback className="bg-cyber-purple/20 text-xs text-cyber-purple">
                            {(u.displayName ?? u.username).slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <Link
                            href={`/admin/users/${u.id}`}
                            className="block truncate font-medium text-white hover:text-cyber-cyan"
                          >
                            {u.displayName ?? u.username}
                          </Link>
                          <p className="truncate text-xs text-white/50">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={ROLE_VARIANT[u.role]} size="sm">
                        {ROLE_LABEL[u.role]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={STATUS_VARIANT[u.status]} size="sm">
                        {STATUS_LABEL[u.status]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-white">
                      {formatCurrency(u.walletBalance.TRY, 'TRY')}
                    </td>
                    <td className="px-4 py-3 text-xs text-white/60">
                      {u.lastLoginAt ? formatDateTime(u.lastLoginAt) : '—'}
                    </td>
                    <td className="px-4 py-3 text-xs text-white/60">
                      {formatDateTime(u.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/users/${u.id}`}
                          className="rounded p-1.5 text-white/60 transition-colors hover:bg-cyber-cyan/10 hover:text-cyber-cyan"
                          title="Detay"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => setWalletTarget(u)}
                          className="rounded p-1.5 text-white/60 transition-colors hover:bg-cyber-purple/10 hover:text-cyber-purple"
                          title="Cüzdan"
                        >
                          <Wallet className="h-4 w-4" />
                        </button>
                        <SuspendUserButton
                          userId={u.id}
                          currentStatus={u.status}
                          username={u.username}
                          onDone={() => {
                            load();
                            onMutated?.();
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-cyber-cyan/20 px-4 py-3 text-xs">
            <button
              type="button"
              onClick={() => onPageChange(Math.max(1, page - 1))}
              disabled={page <= 1}
              className={cn(
                'rounded border border-cyber-cyan/30 px-3 py-1 transition-colors',
                page <= 1 ? 'cursor-not-allowed opacity-40' : 'hover:bg-cyber-cyan/10',
              )}
            >
              Önceki
            </button>
            <span className="text-white/60">
              {page} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => onPageChange(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages}
              className={cn(
                'rounded border border-cyber-cyan/30 px-3 py-1 transition-colors',
                page >= totalPages ? 'cursor-not-allowed opacity-40' : 'hover:bg-cyber-cyan/10',
              )}
            >
              Sonraki
            </button>
          </div>
        )}
      </div>

      {walletTarget && (
        <AdjustWalletModal
          user={{ id: walletTarget.id, username: walletTarget.username }}
          open={!!walletTarget}
          onClose={() => setWalletTarget(null)}
          onSuccess={() => {
            setWalletTarget(null);
            load();
            onMutated?.();
          }}
        />
      )}
    </>
  );
}

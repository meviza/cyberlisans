'use client';

import * as React from 'react';
import { Ban, CheckCircle2, Loader2 } from 'lucide-react';
import { apiFetch, ApiError } from '@/lib/api-client';
import { cn } from '@cyberlisans/ui/cn';
import type { UserStatus } from './users-table';

export interface SuspendUserButtonProps {
  userId: string;
  currentStatus: UserStatus;
  username: string;
  onDone?: () => void;
  size?: 'sm' | 'md';
}

export function SuspendUserButton({
  userId,
  currentStatus,
  username,
  onDone,
  size = 'sm',
}: SuspendUserButtonProps) {
  const [busy, setBusy] = React.useState(false);
  const isSuspended = currentStatus === 'SUSPENDED' || currentStatus === 'BANNED';
  const label = isSuspended ? 'Aktif Et' : 'Askıya Al';

  const onClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (busy) return;
    if (
      !window.confirm(
        `${username} kullanıcısını ${isSuspended ? 'aktif' : 'askıya'} almak istediğinizden emin misiniz?`,
      )
    )
      return;
    setBusy(true);
    try {
      await apiFetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: isSuspended ? 'ACTIVE' : 'SUSPENDED' }),
      });
      onDone?.();
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'İşlem başarısız';
      window.alert(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      title={label}
      className={cn(
        'flex items-center gap-1 rounded p-1.5 transition-colors',
        isSuspended
          ? 'text-white/60 hover:bg-cyber-lime/10 hover:text-cyber-lime'
          : 'text-white/60 hover:bg-cyber-magenta/10 hover:text-cyber-magenta',
        size === 'sm' ? 'p-1.5' : 'px-2.5 py-1 text-xs',
      )}
    >
      {busy ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isSuspended ? (
        <CheckCircle2 className="h-4 w-4" />
      ) : (
        <Ban className="h-4 w-4" />
      )}
      {size === 'md' && <span>{label}</span>}
    </button>
  );
}

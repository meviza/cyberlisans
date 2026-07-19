'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ChevronDown,
  ExternalLink,
  LogOut,
  Menu,
  Settings,
  User as UserIcon,
} from 'lucide-react';
import { Avatar, AvatarFallback, Badge } from '@cyberlisans/ui/atoms';
import { useAuth } from '@/lib/auth-context';
import { cn } from '@cyberlisans/ui/cn';
import { type ShellVariant, VARIANT_HOME, VARIANT_LABEL } from './nav-config';

export function ShellTopbar({
  variant,
  onMenuClick,
}: {
  variant: ShellVariant;
  onMenuClick: () => void;
}) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const initials = (
    user?.displayName?.[0] ??
    user?.username?.[0] ??
    user?.email?.[0] ??
    '?'
  ).toUpperCase();

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

  const isAdminVariant = variant === 'admin';
  const roleBadge =
    user?.role === 'SUPER_ADMIN'
      ? 'SUPER ADMIN'
      : user?.role === 'ADMIN'
        ? 'ADMIN'
        : VARIANT_LABEL[variant];

  return (
    <header
      className={cn(
        'sticky top-0 z-50 border-b backdrop-blur-xl',
        isAdminVariant
          ? 'border-amber-500/20 bg-[#0c0a09]/90'
          : 'border-white/[0.08] bg-brand-bg/85',
      )}
    >
      {isAdminVariant && (
        <div className="h-0.5 w-full bg-gradient-to-r from-amber-600 via-amber-400 to-orange-500" />
      )}
      <div
        className={cn(
          'mx-auto flex h-14 items-center justify-between gap-3 px-4 sm:h-16 sm:px-6',
          isAdminVariant ? 'max-w-[1600px]' : 'max-w-7xl lg:px-8',
        )}
      >
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="rounded-lg border border-white/10 p-2 text-brand-text-secondary transition hover:border-white/20 hover:text-white md:hidden"
            aria-label="Menüyü aç"
          >
            <Menu className="h-4 w-4" />
          </button>

          <Link href={VARIANT_HOME[variant]} className="flex items-center gap-2.5">
            <span
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold text-white',
                isAdminVariant
                  ? 'bg-amber-500 text-black shadow-[0_0_20px_rgba(245,158,11,0.45)]'
                  : 'bg-brand-accent shadow-accent-glow',
              )}
            >
              {isAdminVariant ? 'SA' : 'CL'}
            </span>
            <span className="hidden text-[15px] font-semibold tracking-tight text-white sm:inline">
              {isAdminVariant ? (
                <>
                  Cyber<span className="text-amber-300/90">Admin</span>
                </>
              ) : (
                <>
                  Cyber<span className="text-brand-text-secondary">Lisans</span>
                </>
              )}
            </span>
            <Badge
              variant={isAdminVariant ? 'warning' : 'default'}
              size="sm"
              className={
                isAdminVariant ? 'border-amber-400/40 bg-amber-500/15 text-amber-200' : undefined
              }
            >
              {roleBadge}
            </Badge>
          </Link>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {isAdmin && variant !== 'admin' && (
            <Link
              href="/admin"
              className="hidden rounded-lg border border-white/10 px-2.5 py-1.5 text-xs font-medium text-brand-text-secondary transition hover:border-brand-accent/40 hover:text-white sm:inline-flex"
            >
              Admin
            </Link>
          )}

          <Link
            href="/products"
            className="hidden rounded-lg px-3 py-1.5 text-sm text-brand-text-secondary transition hover:text-white sm:block"
          >
            Lisanslar
          </Link>

          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-2 py-1.5 transition hover:border-white/20"
            >
              <Avatar className="h-7 w-7">
                <AvatarFallback className="bg-brand-accent/20 text-xs text-brand-accent">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="hidden max-w-[120px] truncate text-sm text-white sm:inline">
                {user?.displayName ?? user?.username}
              </span>
              <ChevronDown className="h-3 w-3 text-brand-muted" />
            </button>

            {open && (
              <div className="absolute right-0 mt-2 w-60 overflow-hidden rounded-xl border border-white/[0.08] bg-brand-elevated/95 shadow-card backdrop-blur-xl">
                <div className="border-b border-white/[0.06] p-3">
                  <p className="text-sm font-medium text-white">
                    {user?.displayName ?? user?.username}
                  </p>
                  <p className="truncate text-xs text-brand-muted">{user?.email}</p>
                </div>
                <div className="p-1">
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      router.push('/dashboard/settings');
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-brand-text-secondary transition hover:bg-white/[0.04] hover:text-white"
                  >
                    <UserIcon className="h-4 w-4" />
                    Profil
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      router.push(variant === 'admin' ? '/admin/settings' : '/dashboard/settings');
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-brand-text-secondary transition hover:bg-white/[0.04] hover:text-white"
                  >
                    <Settings className="h-4 w-4" />
                    Ayarlar
                  </button>
                  <Link
                    href="/"
                    onClick={() => setOpen(false)}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-brand-text-secondary transition hover:bg-white/[0.04] hover:text-white"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Ana sayfa
                  </Link>
                  <div className="my-1 h-px bg-white/[0.06]" />
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      void logout();
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-brand-text-secondary transition hover:bg-brand-danger/10 hover:text-brand-danger"
                  >
                    <LogOut className="h-4 w-4" />
                    Çıkış yap
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

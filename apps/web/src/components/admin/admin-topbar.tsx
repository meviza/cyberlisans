'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  Settings,
  User as UserIcon,
  ExternalLink,
} from 'lucide-react';
import { Avatar, AvatarFallback, Badge } from '@cyberlisans/ui/atoms';
import type { AuthUser } from '@/lib/auth-context';
import { cn } from '@cyberlisans/ui/cn';

interface AdminTopbarProps {
  user: AuthUser;
  onMenuClick: () => void;
  onLogout: () => Promise<void> | void;
}

export function AdminTopbar({ user, onMenuClick, onLogout }: AdminTopbarProps) {
  const router = useRouter();
  const [userMenu, setUserMenu] = React.useState(false);
  const [notifOpen, setNotifOpen] = React.useState(false);
  const userRef = React.useRef<HTMLDivElement>(null);
  const notifRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserMenu(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const initials = (
    user.displayName?.[0] ??
    user.username?.[0] ??
    user.email?.[0] ??
    'A'
  ).toUpperCase();

  const roleVariant = user.role === 'SUPER_ADMIN' ? 'magenta' : 'default';

  return (
    <header className="sticky top-0 z-50 border-b border-cyber-cyan/20 bg-cyber-darker/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between gap-3 px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="rounded-md border border-cyber-cyan/30 p-2 text-cyber-cyan transition-colors hover:bg-cyber-cyan/10 md:hidden"
            aria-label="Menüyü aç"
          >
            <Menu className="h-4 w-4" />
          </button>
          <Link href="/admin" className="hidden items-center gap-2 sm:flex">
            <span className="font-orbitron text-lg font-black text-white">
              CYBER<span className="text-cyber-cyan">LİSANS</span>
            </span>
            <span className="rounded border border-cyber-magenta/40 bg-cyber-magenta/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-cyber-magenta">
              Admin
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Badge variant={roleVariant} size="sm" className="hidden sm:inline-flex">
            {user.role === 'SUPER_ADMIN' ? 'Süper Admin' : 'Admin'}
          </Badge>

          <div className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={() => setNotifOpen((v) => !v)}
              className="relative rounded-md border border-cyber-cyan/30 p-2 text-white/70 transition-colors hover:border-cyber-cyan hover:text-cyber-cyan"
              aria-label="Bildirimler"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-cyber-magenta shadow-[0_0_6px_rgba(255,0,200,0.8)]" />
            </button>
            {notifOpen && (
              <div className="absolute right-0 mt-2 w-80 overflow-hidden rounded-md border border-cyber-cyan/30 bg-cyber-darker/95 shadow-[0_0_30px_rgba(0,240,255,0.2)] backdrop-blur-md">
                <div className="border-b border-cyber-cyan/20 p-3">
                  <p className="font-orbitron text-sm font-bold text-white">Bildirimler</p>
                </div>
                <div className="max-h-80 overflow-y-auto p-2">
                  <NotificationItem
                    title="Yeni sipariş"
                    detail="Sipariş #1842 oluşturuldu"
                    time="2 dakika önce"
                    color="cyan"
                  />
                  <NotificationItem
                    title="Düşük stok uyarısı"
                    detail="3 ürünün stoğu 10'un altında"
                    time="14 dakika önce"
                    color="magenta"
                  />
                  <NotificationItem
                    title="Ödeme alındı"
                    detail="PayTR üzerinden ₺1.250,00 tahsil edildi"
                    time="1 saat önce"
                    color="cyan"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="relative" ref={userRef}>
            <button
              type="button"
              onClick={() => setUserMenu((v) => !v)}
              className="flex items-center gap-2 rounded-md border border-cyber-cyan/30 bg-cyber-darker/60 px-2 py-1.5 transition-all hover:border-cyber-cyan/60"
            >
              <Avatar className="h-7 w-7">
                <AvatarFallback className="bg-cyber-cyan/20 text-xs text-cyber-cyan">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="hidden text-sm text-white sm:inline">
                {user.displayName ?? user.username}
              </span>
              <ChevronDown className="h-3 w-3 text-white/60" />
            </button>
            {userMenu && (
              <div className="absolute right-0 mt-2 w-60 overflow-hidden rounded-md border border-cyber-cyan/30 bg-cyber-darker/95 shadow-[0_0_30px_rgba(0,240,255,0.2)] backdrop-blur-md">
                <div className="border-b border-cyber-cyan/20 p-3">
                  <p className="text-sm font-medium text-white">
                    {user.displayName ?? user.username}
                  </p>
                  <p className="truncate text-xs text-white/60">{user.email}</p>
                  <Badge variant={roleVariant} size="sm" className="mt-2">
                    {user.role === 'SUPER_ADMIN' ? 'Süper Admin' : 'Admin'}
                  </Badge>
                </div>
                <div className="p-1">
                  <button
                    type="button"
                    onClick={() => {
                      setUserMenu(false);
                      router.push('/dashboard/settings');
                    }}
                    className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm text-white/80 transition-colors hover:bg-cyber-cyan/10 hover:text-cyber-cyan"
                  >
                    <UserIcon className="h-4 w-4" />
                    Profil
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setUserMenu(false);
                      router.push('/admin/settings');
                    }}
                    className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm text-white/80 transition-colors hover:bg-cyber-cyan/10 hover:text-cyber-cyan"
                  >
                    <Settings className="h-4 w-4" />
                    Ayarlar
                  </button>
                  <Link
                    href="/"
                    onClick={() => setUserMenu(false)}
                    className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm text-white/80 transition-colors hover:bg-cyber-cyan/10 hover:text-cyber-cyan"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Mağazaya Git
                  </Link>
                  <div className="my-1 h-px bg-cyber-cyan/20" />
                  <button
                    type="button"
                    onClick={() => {
                      setUserMenu(false);
                      onLogout();
                    }}
                    className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm text-white/80 transition-colors hover:bg-cyber-magenta/10 hover:text-cyber-magenta"
                  >
                    <LogOut className="h-4 w-4" />
                    Çıkış Yap
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

function NotificationItem({
  title,
  detail,
  time,
  color,
}: {
  title: string;
  detail: string;
  time: string;
  color: 'cyan' | 'magenta';
}) {
  return (
    <div
      className={cn(
        'mb-1 flex flex-col gap-0.5 rounded-md border p-2 text-sm',
        color === 'cyan'
          ? 'border-cyber-cyan/20 bg-cyber-cyan/5 text-white'
          : 'border-cyber-magenta/20 bg-cyber-magenta/5 text-white',
      )}
    >
      <div className="flex items-center justify-between">
        <p className="font-medium">{title}</p>
        <span className="text-[10px] text-white/50">{time}</span>
      </div>
      <p className="text-xs text-white/60">{detail}</p>
    </div>
  );
}

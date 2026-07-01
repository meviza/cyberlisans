'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronDown, LogOut, User as UserIcon, Settings, ExternalLink, Bell } from 'lucide-react';
import { Avatar, AvatarFallback, Badge } from '@cyberlisans/ui/atoms';
import type { AuthUser } from '@/lib/auth-context';

interface DealerTopbarProps {
  user: AuthUser;
  onLogout: () => Promise<void> | void;
}

export function DealerTopbar({ user, onLogout }: DealerTopbarProps) {
  const router = useRouter();
  const [userMenu, setUserMenu] = React.useState(false);
  const userRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserMenu(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const initials = (
    user.displayName?.[0] ??
    user.username?.[0] ??
    user.email?.[0] ??
    'D'
  ).toUpperCase();

  return (
    <header className="sticky top-0 z-40 border-b border-cyber-cyan/20 bg-cyber-darker/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <Link href="/dealer" className="flex items-center gap-2">
          <span className="font-orbitron text-lg font-black text-white">
            CYBER<span className="text-cyber-cyan">LİSANS</span>
          </span>
          <span className="rounded border border-cyber-cyan/40 bg-cyber-cyan/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-cyber-cyan">
            Bayi
          </span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <Badge variant="cyan" size="sm" className="hidden sm:inline-flex">
            DEALER
          </Badge>

          <button
            type="button"
            className="relative rounded-md border border-cyber-cyan/30 p-2 text-white/70 transition-colors hover:border-cyber-cyan hover:text-cyber-cyan"
            aria-label="Bildirimler"
          >
            <Bell className="h-4 w-4" />
          </button>

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
                  <Badge variant="cyan" size="sm" className="mt-2">
                    DEALER
                  </Badge>
                </div>
                <div className="p-1">
                  <button
                    type="button"
                    onClick={() => {
                      setUserMenu(false);
                      router.push('/dealer/profile');
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
                      router.push('/dealer/settings');
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
                    Mağazaya Dön
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

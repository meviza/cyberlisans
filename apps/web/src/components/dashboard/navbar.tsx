'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut, User as UserIcon, Settings, ChevronDown } from 'lucide-react';
import { Avatar, AvatarFallback } from '@cyberlisans/ui/atoms';
import { useAuth } from '@/lib/auth-context';

export function Navbar() {
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

  const initials =
    (user?.displayName?.[0] ?? user?.username?.[0] ?? user?.email?.[0] ?? '?').toUpperCase();

  return (
    <header className="sticky top-0 z-40 border-b border-cyber-cyan/20 bg-cyber-darker/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="font-orbitron text-lg font-black text-white">
            CYBER<span className="text-cyber-cyan">LİSANS</span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/products"
            className="hidden rounded-md px-3 py-1.5 text-sm text-white/70 transition-colors hover:text-cyber-cyan sm:block"
          >
            Ürünler
          </Link>

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setOpen((v) => !v)}
              className="flex items-center gap-2 rounded-md border border-cyber-cyan/30 bg-cyber-darker/60 px-2 py-1.5 transition-all hover:border-cyber-cyan/60"
            >
              <Avatar className="h-7 w-7">
                <AvatarFallback className="bg-cyber-cyan/20 text-xs text-cyber-cyan">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="hidden text-sm text-white sm:inline">
                {user?.displayName ?? user?.username}
              </span>
              <ChevronDown className="h-3 w-3 text-white/60" />
            </button>

            {open && (
              <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-md border border-cyber-cyan/30 bg-cyber-darker/95 shadow-[0_0_30px_rgba(0,240,255,0.2)] backdrop-blur-md">
                <div className="border-b border-cyber-cyan/20 p-3">
                  <p className="text-sm font-medium text-white">{user?.displayName ?? user?.username}</p>
                  <p className="truncate text-xs text-white/60">{user?.email}</p>
                </div>
                <div className="p-1">
                  <button
                    onClick={() => {
                      setOpen(false);
                      router.push('/dashboard/settings');
                    }}
                    className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm text-white/80 transition-colors hover:bg-cyber-cyan/10 hover:text-cyber-cyan"
                  >
                    <UserIcon className="h-4 w-4" />
                    Profil
                  </button>
                  <button
                    onClick={() => {
                      setOpen(false);
                      router.push('/dashboard/settings');
                    }}
                    className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm text-white/80 transition-colors hover:bg-cyber-cyan/10 hover:text-cyber-cyan"
                  >
                    <Settings className="h-4 w-4" />
                    Ayarlar
                  </button>
                  <button
                    onClick={() => {
                      setOpen(false);
                      logout();
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
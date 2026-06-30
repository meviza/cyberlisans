'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingCart, Menu, X, LogIn } from 'lucide-react';
import { Button, Avatar, AvatarFallback } from '@cyberlisans/ui/atoms';
import { CurrencySwitcher } from './currency-switcher';
import { useCart } from '@/lib/cart-store';
import { useAuth } from '@/lib/auth-context';

const NAV_LINKS = [
  { href: '/', label: 'Anasayfa' },
  { href: '/products', label: 'Mağaza' },
  { href: '/#ozellikler', label: 'Özellikler' },
  { href: '/#sss', label: 'SSS' },
];

export function StorefrontHeader() {
  const pathname = usePathname();
  const { getItemCount, hydrated } = useCart();
  const { user, isLoading } = useAuth();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  React.useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const initials = (
    user?.displayName?.[0] ??
    user?.username?.[0] ??
    user?.email?.[0] ??
    '?'
  ).toUpperCase();
  const badgeCount = hydrated ? getItemCount() : 0;

  return (
    <header className="sticky top-0 z-40 border-b border-cyber-cyan/20 bg-cyber-darker/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-orbitron text-lg font-black text-white">
            CYBER<span className="text-cyber-cyan text-glow-cyan">LİSANS</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={
                pathname === l.href
                  ? 'text-sm font-medium text-cyber-cyan'
                  : 'text-sm text-white/70 transition-colors hover:text-cyber-cyan'
              }
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden sm:block">
            <CurrencySwitcher />
          </div>

          <Link
            href="/cart"
            className="relative inline-flex h-9 items-center gap-1.5 rounded-md border border-cyber-cyan/30 bg-cyber-darker/60 px-2.5 text-sm text-white/80 transition-colors hover:border-cyber-cyan/60 hover:text-white"
            aria-label="Sepet"
          >
            <ShoppingCart className="h-4 w-4" />
            <span className="font-mono text-xs">Sepet</span>
            {badgeCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-cyber-magenta px-1 font-mono text-[10px] font-bold text-white shadow-glow-magenta">
                {badgeCount}
              </span>
            )}
          </Link>

          {isLoading ? (
            <div className="hidden h-9 w-20 sm:block" />
          ) : user ? (
            <Link
              href="/dashboard"
              className="hidden items-center gap-2 sm:flex"
              aria-label="Hesabım"
            >
              <Avatar className="h-9 w-9 border border-cyber-cyan/40">
                <AvatarFallback className="bg-cyber-cyan/20 text-sm text-cyber-cyan">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Link>
          ) : (
            <Link href="/login" className="hidden sm:block">
              <Button variant="outline" size="sm">
                <LogIn className="h-4 w-4" />
                Giriş
              </Button>
            </Link>
          )}

          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-cyber-cyan/30 text-white/70 hover:text-cyber-cyan md:hidden"
            aria-label="Menü"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-cyber-cyan/20 bg-cyber-darker/95 backdrop-blur-md md:hidden">
          <div className="space-y-1 px-4 py-4">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={
                  pathname === l.href
                    ? 'block rounded-md bg-cyber-cyan/10 px-3 py-2 text-sm font-medium text-cyber-cyan'
                    : 'block rounded-md px-3 py-2 text-sm text-white/80 hover:bg-white/5 hover:text-cyber-cyan'
                }
              >
                {l.label}
              </Link>
            ))}
            <div className="pt-2">
              <CurrencySwitcher />
            </div>
            {!user && (
              <Link href="/login" className="block pt-2">
                <Button variant="outline" className="w-full">
                  <LogIn className="h-4 w-4" />
                  Giriş Yap
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

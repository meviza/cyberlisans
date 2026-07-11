'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingCart, Menu, X, LogIn, Store, ShoppingBag, Shield } from 'lucide-react';
import { Button, Avatar, AvatarFallback } from '@cyberlisans/ui/atoms';
import { CurrencySwitcher } from './currency-switcher';
import { useCart } from '@/lib/cart-store';
import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/cn';

const NAV_LINKS = [
  { href: '/', label: 'Ana Sayfa' },
  { href: '/products', label: 'Mağaza' },
  { href: '/about', label: 'Hakkımızda' },
  { href: '/contact', label: 'İletişim' },
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
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
  const onSellerSide = pathname.startsWith('/seller') || pathname.startsWith('/dashboard/seller');

  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-brand-bg/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4 sm:h-16 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-accent text-sm font-bold text-white shadow-accent-glow">
            CL
          </span>
          <span className="text-[15px] font-semibold tracking-tight text-white">
            Cyber<span className="text-brand-text-secondary">Lisans</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  active
                    ? 'bg-white/[0.06] text-white'
                    : 'text-brand-text-secondary hover:bg-white/[0.04] hover:text-white',
                )}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* GamsGo-style Alıcı / Satıcı switch when logged in */}
          {user && !isAdmin && (
            <div className="hidden items-center rounded-lg border border-white/10 bg-white/[0.03] p-0.5 sm:flex">
              <Link
                href="/dashboard"
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition',
                  !onSellerSide
                    ? 'bg-brand-accent text-white shadow-sm'
                    : 'text-brand-text-secondary hover:text-white',
                )}
              >
                <ShoppingBag className="h-3.5 w-3.5" />
                Alıcı
              </Link>
              <Link
                href="/seller"
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition',
                  onSellerSide
                    ? 'bg-brand-accent text-white shadow-sm'
                    : 'text-brand-text-secondary hover:text-white',
                )}
              >
                <Store className="h-3.5 w-3.5" />
                Satıcı
              </Link>
            </div>
          )}

          {isAdmin && (
            <Link
              href="/admin"
              className="hidden items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-xs font-medium text-brand-text-secondary transition hover:border-brand-accent/40 hover:text-white sm:inline-flex"
            >
              <Shield className="h-3.5 w-3.5" />
              Admin
            </Link>
          )}

          <div className="hidden sm:block">
            <CurrencySwitcher />
          </div>

          <Link
            href="/cart"
            className="relative inline-flex h-9 items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 text-sm text-brand-text-secondary transition hover:border-white/20 hover:text-white"
            aria-label="Sepet"
          >
            <ShoppingCart className="h-4 w-4" />
            <span className="hidden font-medium sm:inline">Sepet</span>
            {badgeCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-brand-accent px-1 text-[10px] font-bold text-white">
                {badgeCount}
              </span>
            )}
          </Link>

          {isLoading ? (
            <div className="hidden h-9 w-20 sm:block" />
          ) : user ? (
            <Link href="/dashboard" aria-label="Hesabım" className="hidden sm:block">
              <Avatar className="h-9 w-9 border border-white/10">
                <AvatarFallback className="bg-brand-accent/15 text-sm font-medium text-brand-accent">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Link>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  <LogIn className="h-4 w-4" />
                  Giriş
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="primary" size="sm">
                  Kayıt Ol
                </Button>
              </Link>
            </div>
          )}

          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-brand-text-secondary hover:text-white md:hidden"
            aria-label="Menü"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-white/[0.08] bg-brand-bg/95 backdrop-blur-xl md:hidden">
          <div className="space-y-1 px-4 py-4">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  'block rounded-lg px-3 py-2.5 text-sm font-medium',
                  pathname === l.href
                    ? 'bg-white/[0.06] text-white'
                    : 'text-brand-text-secondary hover:bg-white/[0.04] hover:text-white',
                )}
              >
                {l.label}
              </Link>
            ))}
            {user && !isAdmin && (
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Link
                  href="/dashboard"
                  className="rounded-lg border border-white/10 px-3 py-2 text-center text-xs font-medium text-white"
                >
                  Alıcı paneli
                </Link>
                <Link
                  href="/seller"
                  className="rounded-lg border border-white/10 px-3 py-2 text-center text-xs font-medium text-white"
                >
                  Satıcı paneli
                </Link>
              </div>
            )}
            {isAdmin && (
              <Link
                href="/admin"
                className="mt-2 block rounded-lg border border-white/10 px-3 py-2 text-center text-xs font-medium text-white"
              >
                Admin paneli
              </Link>
            )}
            <div className="pt-2">
              <CurrencySwitcher />
            </div>
            {!user && (
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Link href="/login">
                  <Button variant="outline" className="w-full" size="sm">
                    Giriş
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="primary" className="w-full" size="sm">
                    Kayıt
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

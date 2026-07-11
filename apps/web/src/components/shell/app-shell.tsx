'use client';

import * as React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Spinner } from '@cyberlisans/ui/atoms';
import { useAuth } from '@/lib/auth-context';
import { cn } from '@cyberlisans/ui/cn';
import { ShellSidebar } from './shell-sidebar';
import { ShellTopbar } from './shell-topbar';
import type { ShellVariant } from './nav-config';

export function AppShell({
  variant,
  children,
  requireRoles,
}: {
  variant: ShellVariant;
  children: React.ReactNode;
  /** If set, users without these roles are redirected */
  requireRoles?: Array<'CUSTOMER' | 'DEALER' | 'ADMIN' | 'SUPER_ADMIN'>;
}) {
  const router = useRouter();
  const pathname = usePathname() ?? '/';
  const { user, isLoading } = useAuth();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  React.useEffect(() => {
    if (!isLoading && !user) {
      const next = encodeURIComponent(pathname);
      router.replace(`/login?next=${next}`);
    }
  }, [user, isLoading, router, pathname]);

  React.useEffect(() => {
    if (!isLoading && user && requireRoles && !requireRoles.includes(user.role)) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}&error=forbidden`);
    }
  }, [user, isLoading, router, pathname, requireRoles]);

  React.useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-bg">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) return null;
  if (requireRoles && !requireRoles.includes(user.role)) return null;

  const isAdminShell = variant === 'admin';

  return (
    <div
      className={cn(
        'min-h-screen',
        isAdminShell ? 'bg-[#0a0908] text-white [color-scheme:dark]' : 'bg-brand-bg',
      )}
      data-shell={variant}
    >
      {isAdminShell && (
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 -z-10"
          style={{
            background:
              'radial-gradient(ellipse 70% 45% at 10% 0%, rgba(245,158,11,0.12), transparent 50%), radial-gradient(ellipse 50% 40% at 100% 100%, rgba(120,53,15,0.18), transparent 45%), #0a0908',
          }}
        />
      )}
      <ShellTopbar variant={variant} onMenuClick={() => setMobileOpen((v) => !v)} />
      <div className={cn('mx-auto flex', isAdminShell ? 'max-w-[1600px]' : 'max-w-7xl')}>
        {/* Mobile overlay */}
        <div
          className={cn(
            'fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden',
            mobileOpen ? 'block' : 'hidden',
          )}
          onClick={() => setMobileOpen(false)}
          aria-hidden
        />

        <ShellSidebar
          variant={variant}
          onNavigate={() => setMobileOpen(false)}
          className={cn(
            'fixed left-0 top-14 z-40 h-[calc(100vh-3.5rem)] w-64 backdrop-blur-xl transition-transform sm:top-16 sm:h-[calc(100vh-4rem)] md:sticky md:top-16 md:translate-x-0 md:self-start',
            isAdminShell
              ? 'border-r border-amber-500/15 bg-[#0c0a09]/95'
              : 'border-r border-white/[0.08] bg-brand-bg/95',
            mobileOpen ? 'translate-x-0' : '-translate-x-full',
          )}
        />

        <main
          className={cn(
            'min-w-0 flex-1 p-4 sm:p-6 lg:p-8',
            isAdminShell && 'border-l border-amber-500/5',
          )}
        >
          {isAdminShell && (
            <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-amber-400/25 bg-amber-500/10 px-3 py-2 text-xs text-amber-100/90">
              <span className="rounded-md bg-amber-500/20 px-2 py-0.5 font-semibold uppercase tracking-wider text-amber-200">
                Super Admin
              </span>
              <span className="text-amber-100/70">
                Satıcı başvurularını onaylayan operatör paneli · müşteri mağazasından ayrıdır
              </span>
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}

/** Path-aware shell for /dashboard/* (customer vs seller) */
export function DashboardAppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? '';
  const variant: ShellVariant = pathname.startsWith('/dashboard/seller')
    ? 'seller'
    : pathname.startsWith('/dashboard/admin')
      ? 'admin'
      : 'customer';

  // Admin pages under /dashboard/admin should still require admin role
  if (variant === 'admin') {
    return (
      <AppShell variant="admin" requireRoles={['ADMIN', 'SUPER_ADMIN']}>
        {children}
      </AppShell>
    );
  }

  return <AppShell variant={variant}>{children}</AppShell>;
}

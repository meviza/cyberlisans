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

  return (
    <div className="min-h-screen bg-brand-bg">
      <ShellTopbar variant={variant} onMenuClick={() => setMobileOpen((v) => !v)} />
      <div className={cn('mx-auto flex', variant === 'admin' ? 'max-w-[1600px]' : 'max-w-7xl')}>
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
            'fixed left-0 top-14 z-40 h-[calc(100vh-3.5rem)] w-64 border-r border-white/[0.08] bg-brand-bg/95 backdrop-blur-xl transition-transform sm:top-16 sm:h-[calc(100vh-4rem)] md:sticky md:top-16 md:translate-x-0 md:self-start',
            mobileOpen ? 'translate-x-0' : '-translate-x-full',
          )}
        />

        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
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

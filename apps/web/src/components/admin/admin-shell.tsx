'use client';

import * as React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Spinner } from '@cyberlisans/ui/atoms';
import { useAuth, type AuthUser } from '@/lib/auth-context';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { AdminTopbar } from '@/components/admin/admin-topbar';
import { AdminBreadcrumb } from '@/components/admin/admin-breadcrumb';

export function AdminShell({
  user: initialUser,
  children,
}: {
  user?: AuthUser;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user: ctxUser, isLoading, logout } = useAuth();
  const user = ctxUser ?? initialUser ?? null;
  const [mobileOpen, setMobileOpen] = React.useState(false);

  React.useEffect(() => {
    if (!isLoading && !user) {
      const next = encodeURIComponent(pathname || '/admin');
      router.replace(`/login?next=${next}`);
    }
  }, [user, isLoading, router, pathname]);

  React.useEffect(() => {
    if (!isLoading && user && user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      const next = encodeURIComponent(pathname || '/admin');
      router.replace(`/login?next=${next}&error=forbidden`);
    }
  }, [user, isLoading, router, pathname]);

  React.useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cyber-darker">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) return null;
  if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') return null;

  return (
    <div className="min-h-screen bg-cyber-darker">
      <AdminTopbar user={user} onMenuClick={() => setMobileOpen((v) => !v)} onLogout={logout} />
      <div className="mx-auto flex max-w-[1600px]">
        <div
          className={`fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden ${mobileOpen ? 'block' : 'hidden'}`}
          onClick={() => setMobileOpen(false)}
        />
        <AdminSidebar
          className={`fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-64 transform border-r border-cyber-cyan/20 bg-cyber-darker/95 backdrop-blur-md transition-transform md:sticky md:top-16 md:translate-x-0 ${
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        />
        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
          <AdminBreadcrumb />
          <div className="mt-4">{children}</div>
        </main>
      </div>
    </div>
  );
}

'use client';

import * as React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Spinner } from '@cyberlisans/ui/atoms';
import { useAuth } from '@/lib/auth-context';
import { apiFetch } from '@/lib/api-client';
import { DealerSidebar } from '@/components/dealer/DealerSidebar';
import { DealerStatusBanner } from '@/components/dealer/DealerStatusBanner';
import { DealerTopbar } from '@/components/dealer/DealerTopbar';
import type { DealerProfile } from '@/lib/dealer-types';

export function DealerShellClient({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading, logout } = useAuth();
  const [profile, setProfile] = React.useState<DealerProfile | null>(null);
  const [checkedProfile, setCheckedProfile] = React.useState(false);

  React.useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }
    let cancelled = false;
    apiFetch<DealerProfile>('/dealer/me')
      .then((res) => {
        if (!cancelled) setProfile(res);
      })
      .catch(() => {
        if (!cancelled) setProfile(null);
      })
      .finally(() => {
        if (!cancelled) setCheckedProfile(true);
      });
    return () => {
      cancelled = true;
    };
  }, [isLoading, pathname, router, user]);

  React.useEffect(() => {
    if (!isLoading && user && checkedProfile && !profile && pathname !== '/dealer/register') {
      router.replace('/dealer/register');
    }
  }, [checkedProfile, isLoading, pathname, profile, router, user]);

  if (isLoading || !user || (!checkedProfile && pathname !== '/dealer/register')) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cyber-darker">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cyber-darker">
      <DealerTopbar user={user} onLogout={logout} />
      {profile && (
        <DealerStatusBanner status={profile.status} rejectionReason={profile.rejectionReason} />
      )}
      <div className="mx-auto flex max-w-7xl">
        {profile && <DealerSidebar />}
        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Spinner } from '@cyberlisans/ui/atoms';
import { useAuth } from '@/lib/auth-context';

export function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  React.useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace('/login?next=/admin');
      return;
    }
    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      router.replace('/login?next=/admin&error=forbidden');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cyber-darker">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
    return null;
  }

  return <>{children}</>;
}

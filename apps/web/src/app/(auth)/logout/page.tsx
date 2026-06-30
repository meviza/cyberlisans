'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Spinner } from '@cyberlisans/ui/atoms';
import { useAuth } from '@/lib/auth-context';

export default function LogoutPage() {
  const router = useRouter();
  const { logout } = useAuth();

  React.useEffect(() => {
    logout().then(() => router.push('/login'));
  }, [logout, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Spinner size="lg" />
        <p className="text-sm text-white/60">Çıkış yapılıyor...</p>
      </div>
    </div>
  );
}

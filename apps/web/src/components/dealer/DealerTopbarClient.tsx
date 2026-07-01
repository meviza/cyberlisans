'use client';

import * as React from 'react';
import { DealerTopbar } from './DealerTopbar';
import { useAuth } from '@/lib/auth-context';

export function DealerTopbarClient({ auth: _auth }: { auth: string }) {
  const { user, logout } = useAuth();
  if (!user) return null;
  return <DealerTopbar user={user} onLogout={logout} />;
}

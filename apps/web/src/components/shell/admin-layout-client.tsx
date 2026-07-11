'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { AdminShell } from './admin-shell';

/** Skip AdminShell (role guard + chrome) on /admin/login */
export function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? '';
  if (pathname === '/admin/login' || pathname.startsWith('/admin/login/')) {
    return <>{children}</>;
  }
  return <AdminShell>{children}</AdminShell>;
}

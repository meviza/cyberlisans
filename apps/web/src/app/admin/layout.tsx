import * as React from 'react';
import { AdminShell } from '@/components/shell/admin-shell';

export const metadata = {
  title: 'Admin Panel | CyberLisans',
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}

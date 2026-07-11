import * as React from 'react';
import { AdminLayoutClient } from '@/components/shell/admin-layout-client';

export const metadata = {
  title: 'Super Admin | CyberLisans',
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}

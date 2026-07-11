'use client';

import * as React from 'react';
import { DashboardAppShell } from '@/components/shell/app-shell';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardAppShell>{children}</DashboardAppShell>;
}

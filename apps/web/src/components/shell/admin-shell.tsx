'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { AppShell } from './app-shell';

const LABELS: Record<string, string> = {
  admin: 'Admin',
  products: 'Ürünler',
  'product-approvals': 'Ürün onayları',
  categories: 'Kategoriler',
  brands: 'Markalar',
  orders: 'Siparişler',
  payments: 'Ödemeler',
  users: 'Kullanıcılar',
  wallet: 'Cüzdan',
  audit: 'Audit log',
  privacy: 'KVKK / GDPR',
  settings: 'Ayarlar',
  escrow: 'Ödemeler (eski)',
  disputes: 'İtirazlar',
  new: 'Yeni',
  edit: 'Düzenle',
};

function humanize(segment: string): string {
  if (LABELS[segment]) return LABELS[segment];
  if (/^[0-9a-f-]{8,}$/i.test(segment)) return 'Detay';
  return segment
    .split('-')
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(' ');
}

function AdminBreadcrumb() {
  const pathname = usePathname() ?? '/admin';
  const segments = pathname.split('?')[0]?.split('/').filter(Boolean) ?? [];

  const crumbs: { href: string; label: string }[] = [];
  let acc = '';
  for (const seg of segments) {
    acc += `/${seg}`;
    crumbs.push({ href: acc, label: humanize(seg) });
  }

  return (
    <nav
      aria-label="breadcrumb"
      className="mb-4 flex flex-wrap items-center gap-1 text-sm text-brand-muted"
    >
      <Link href="/admin" className="inline-flex items-center gap-1 hover:text-white">
        <Home className="h-3.5 w-3.5" />
        <span className="sr-only">Admin</span>
      </Link>
      {crumbs.map((c, i) => {
        const last = i === crumbs.length - 1;
        return (
          <React.Fragment key={c.href}>
            <ChevronRight className="h-3.5 w-3.5 text-white/20" />
            {last ? (
              <span className="font-medium text-white">{c.label}</span>
            ) : (
              <Link href={c.href} className="hover:text-white">
                {c.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <AppShell variant="admin" requireRoles={['ADMIN', 'SUPER_ADMIN']}>
      <AdminBreadcrumb />
      {children}
    </AppShell>
  );
}

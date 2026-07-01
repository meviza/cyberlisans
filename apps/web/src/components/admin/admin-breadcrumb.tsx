'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';

const LABELS: Record<string, string> = {
  admin: 'Admin',
  products: 'Ürünler',
  categories: 'Kategoriler',
  brands: 'Markalar',
  orders: 'Siparişler',
  payments: 'Ödemeler',
  users: 'Kullanıcılar',
  wallet: 'Cüzdan',
  'audit-log': 'Audit Log',
  audit: 'Audit Log',
  privacy: 'KVKK / GDPR',
  settings: 'Ayarlar',
  new: 'Yeni',
  edit: 'Düzenle',
};

function humanize(segment: string): string {
  if (LABELS[segment]) return LABELS[segment];
  if (segment.startsWith('[') && segment.endsWith(']')) return 'Detay';
  return segment
    .split('-')
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(' ');
}

export function AdminBreadcrumb() {
  const pathname = usePathname() ?? '/admin';
  const segments = pathname.split('?')[0]?.split('/').filter(Boolean) ?? [];

  const crumbs: { href: string; label: string }[] = [];
  let acc = '';
  for (const seg of segments) {
    acc += `/${seg}`;
    crumbs.push({ href: acc, label: humanize(seg) });
  }

  if (crumbs.length === 0) {
    return (
      <nav aria-label="breadcrumb" className="flex items-center gap-1 text-sm text-white/60">
        <Home className="h-3.5 w-3.5" />
        <span className="text-white">Admin</span>
      </nav>
    );
  }

  return (
    <nav
      aria-label="breadcrumb"
      className="flex flex-wrap items-center gap-1 text-sm text-white/60"
    >
      <Link
        href="/admin"
        className="flex items-center gap-1 transition-colors hover:text-cyber-cyan"
      >
        <Home className="h-3.5 w-3.5" />
        <span>Admin</span>
      </Link>
      {crumbs.slice(1).map((c, i) => {
        const last = i === crumbs.length - 2;
        return (
          <React.Fragment key={c.href}>
            <ChevronRight className="h-3.5 w-3.5 text-white/30" />
            {last ? (
              <span className="font-medium text-white">{c.label}</span>
            ) : (
              <Link href={c.href} className="transition-colors hover:text-cyber-cyan">
                {c.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}

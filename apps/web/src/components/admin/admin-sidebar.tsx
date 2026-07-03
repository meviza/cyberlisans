'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Tags,
  Award,
  ShoppingCart,
  CreditCard,
  Users,
  ScrollText,
  Settings,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '@cyberlisans/ui/cn';
import type { LucideIcon } from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  group: 'genel' | 'katalog' | 'operasyon' | 'sistem';
}

const NAV_ITEMS: NavItem[] = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, group: 'genel' },
  { href: '/admin/products', label: 'Ürünler', icon: Package, group: 'katalog' },
  { href: '/admin/categories', label: 'Kategoriler', icon: Tags, group: 'katalog' },
  { href: '/admin/brands', label: 'Markalar', icon: Award, group: 'katalog' },
  { href: '/admin/orders', label: 'Siparişler', icon: ShoppingCart, group: 'operasyon' },
  { href: '/admin/payments', label: 'Ödemeler', icon: CreditCard, group: 'operasyon' },
  { href: '/admin/users', label: 'Kullanıcılar', icon: Users, group: 'operasyon' },
  { href: '/admin/audit', label: 'Audit Log', icon: ScrollText, group: 'sistem' },
  { href: '/admin/privacy', label: 'KVKK / GDPR', icon: ShieldCheck, group: 'sistem' },
  { href: '/admin/settings', label: 'Ayarlar', icon: Settings, group: 'sistem' },
];

const GROUP_LABELS: Record<NavItem['group'], string> = {
  genel: 'Genel',
  katalog: 'Katalog',
  operasyon: 'Operasyon',
  sistem: 'Sistem',
};

export function AdminSidebar({ className }: { className?: string }) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const groups = (['genel', 'katalog', 'operasyon', 'sistem'] as const).map((g) => ({
    key: g,
    label: GROUP_LABELS[g],
    items: NAV_ITEMS.filter((i) => i.group === g),
  }));

  return (
    <aside className={cn('flex flex-col gap-6 overflow-y-auto p-4', className)}>
      <Link
        href="/admin"
        className="flex items-center gap-2 rounded-md border border-cyber-cyan/20 bg-cyber-cyan/5 px-3 py-2"
      >
        <ShieldCheck className="h-4 w-4 text-cyber-cyan" />
        <div>
          <p className="font-orbitron text-sm font-black text-white">
            CYBER<span className="text-cyber-cyan">ADMIN</span>
          </p>
          <p className="text-[10px] uppercase tracking-wider text-white/50">Yönetim Paneli</p>
        </div>
      </Link>

      {groups.map((group) => (
        <div key={group.key} className="space-y-1">
          <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-white/40">
            {group.label}
          </p>
          <nav className="flex flex-col gap-1">
            {group.items.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'group flex items-center gap-3 rounded-md border border-transparent px-3 py-2 text-sm transition-all',
                    active
                      ? 'border-cyber-cyan/40 bg-cyber-cyan/10 text-cyber-cyan shadow-[0_0_20px_rgba(0,240,255,0.15)]'
                      : 'text-white/70 hover:border-cyber-cyan/20 hover:bg-cyber-cyan/5 hover:text-white',
                  )}
                >
                  <Icon className={cn('h-4 w-4', active && 'text-cyber-cyan')} />
                  <span className="font-medium">{item.label}</span>
                  {active && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-cyber-cyan shadow-[0_0_8px_rgba(0,240,255,0.8)]" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      ))}
    </aside>
  );
}

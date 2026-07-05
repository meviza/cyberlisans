'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Wallet,
  Receipt,
  Settings,
  Store,
  Gavel,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '@cyberlisans/ui/cn';
import { useAuth } from '@/lib/auth-context';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
  roles?: Array<'CUSTOMER' | 'DEALER' | 'ADMIN' | 'SUPER_ADMIN'>;
}

const ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'Genel Bakış', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/products', label: 'Ürünlerim', icon: Package },
  { href: '/dashboard/seller', label: 'Satıcı Mağazam', icon: Store },
  { href: '/dashboard/wallet', label: 'Cüzdan', icon: Wallet },
  {
    href: '/dashboard/orders',
    label: 'Siparişlerim',
    icon: Receipt,
    roles: ['CUSTOMER', 'DEALER', 'ADMIN', 'SUPER_ADMIN'],
  },
  {
    href: '/dashboard/seller/payouts',
    label: 'Payoutlar',
    icon: Wallet,
    roles: ['DEALER', 'ADMIN', 'SUPER_ADMIN'],
  },
  {
    href: '/dashboard/admin/disputes',
    label: 'Disputes',
    icon: Gavel,
    roles: ['ADMIN', 'SUPER_ADMIN'],
  },
  {
    href: '/dashboard/admin/escrow',
    label: 'Escrow',
    icon: ShieldCheck,
    roles: ['ADMIN', 'SUPER_ADMIN'],
  },
  { href: '/dashboard/settings', label: 'Ayarlar', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const role = user?.role;

  const visible = ITEMS.filter((item) => !item.roles || (role && item.roles.includes(role)));

  return (
    <aside className="hidden w-64 shrink-0 border-r border-cyber-cyan/20 bg-cyber-darker/60 backdrop-blur-sm md:block">
      <nav className="sticky top-20 flex flex-col gap-1 p-4">
        {visible.map((item) => {
          const Icon = item.icon;
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group flex items-center gap-3 rounded-md border border-transparent px-3 py-2.5 text-sm transition-all',
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
    </aside>
  );
}

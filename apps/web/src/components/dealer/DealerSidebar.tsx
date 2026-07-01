'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  User as UserIcon,
  Package,
  Link2,
  ShoppingBag,
  Wallet,
  CreditCard,
  Settings,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '@cyberlisans/ui/cn';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
}

const ITEMS: NavItem[] = [
  { href: '/dealer', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/dealer/profile', label: 'Profil', icon: UserIcon },
  { href: '/dealer/links', label: 'Linklerim', icon: Link2 },
  { href: '/dealer/sales', label: 'Satışlar', icon: ShoppingBag },
  { href: '/dealer/commissions', label: 'Komisyonlar', icon: Wallet },
  { href: '/dealer/payouts', label: 'Ödemeler', icon: CreditCard },
  { href: '/dealer/settings', label: 'Ayarlar', icon: Settings },
];

export function DealerSidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden w-64 shrink-0 border-r border-cyber-cyan/20 bg-cyber-darker/60 backdrop-blur-sm md:block">
      <nav className="sticky top-20 flex flex-col gap-1 p-4">
        <div className="mb-3 flex items-center gap-2 rounded-md border border-cyber-cyan/20 bg-cyber-cyan/5 px-3 py-2">
          <ShieldCheck className="h-4 w-4 text-cyber-cyan" />
          <div>
            <p className="font-orbitron text-sm font-black text-white">
              CYBER<span className="text-cyber-cyan">BAYİ</span>
            </p>
            <p className="text-[10px] uppercase tracking-wider text-white/50">Bayi Paneli</p>
          </div>
        </div>
        {ITEMS.map((item) => {
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
        <div className="mt-4 rounded-md border border-cyber-cyan/15 bg-cyber-darker/40 p-3 text-xs text-white/60">
          <div className="mb-1 flex items-center gap-1.5 text-white">
            <Package className="h-3.5 w-3.5 text-cyber-cyan" />
            <span className="font-medium">İpucu</span>
          </div>
          <p>Yeni link oluşturarak daha fazla satış elde edebilirsin.</p>
        </div>
      </nav>
    </aside>
  );
}

export const DEALER_NAV_ITEMS = ITEMS;

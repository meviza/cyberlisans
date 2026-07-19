'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@cyberlisans/ui/cn';
import {
  isNavActive,
  navForVariant,
  type ShellNavItem,
  type ShellVariant,
  VARIANT_HOME,
  VARIANT_LABEL,
} from './nav-config';

function NavLink({
  item,
  onNavigate,
  admin,
}: {
  item: ShellNavItem;
  onNavigate?: () => void;
  admin?: boolean;
}) {
  const pathname = usePathname() ?? '';
  const active = isNavActive(pathname, item);
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={cn(
        'group flex items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 text-sm transition-all',
        active
          ? admin
            ? 'border-amber-400/35 bg-amber-500/15 text-white shadow-[0_0_24px_rgba(245,158,11,0.12)]'
            : 'border-brand-accent/30 bg-brand-accent/10 text-white shadow-accent-glow'
          : 'text-brand-text-secondary hover:border-white/10 hover:bg-white/[0.04] hover:text-white',
      )}
    >
      <Icon
        className={cn(
          'h-4 w-4 shrink-0',
          active ? (admin ? 'text-amber-300' : 'text-brand-accent') : 'text-brand-muted',
        )}
      />
      <span className="font-medium">{item.label}</span>
      {active && (
        <span
          className={cn(
            'ml-auto h-1.5 w-1.5 rounded-full',
            admin ? 'bg-amber-400' : 'bg-brand-accent',
          )}
        />
      )}
    </Link>
  );
}

export function ShellSidebar({
  variant,
  className,
  onNavigate,
}: {
  variant: ShellVariant;
  className?: string;
  onNavigate?: () => void;
}) {
  const items = navForVariant(variant);

  if (variant === 'admin') {
    const groups = Array.from(
      items.reduce((map, item) => {
        const g = item.group ?? 'Genel';
        if (!map.has(g)) map.set(g, []);
        map.get(g)!.push(item);
        return map;
      }, new Map<string, ShellNavItem[]>()),
    );

    return (
      <aside className={cn('flex flex-col gap-5 overflow-y-auto p-4', className)}>
        <Link
          href={VARIANT_HOME.admin}
          onClick={onNavigate}
          className="flex items-center gap-2.5 rounded-xl border border-amber-400/25 bg-amber-500/10 px-3 py-2.5"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500 text-xs font-bold text-black">
            SA
          </span>
          <div>
            <p className="text-sm font-semibold text-white">Super Admin</p>
            <p className="text-[10px] uppercase tracking-wider text-amber-200/70">
              Katalog · operasyon
            </p>
          </div>
        </Link>

        {groups.map(([label, groupItems]) => (
          <div key={label} className="space-y-1">
            <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-amber-200/40">
              {label}
            </p>
            <nav className="flex flex-col gap-0.5">
              {groupItems.map((item) => (
                <NavLink key={item.href} item={item} onNavigate={onNavigate} admin />
              ))}
            </nav>
          </div>
        ))}
      </aside>
    );
  }

  return (
    <aside className={cn('flex flex-col gap-4 overflow-y-auto p-4', className)}>
      <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2.5">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-brand-muted">Panel</p>
        <p className="text-sm font-semibold text-white">{VARIANT_LABEL[variant]}</p>
      </div>
      <nav className="flex flex-col gap-0.5">
        {items.map((item) => (
          <NavLink key={item.href} item={item} onNavigate={onNavigate} />
        ))}
      </nav>
    </aside>
  );
}

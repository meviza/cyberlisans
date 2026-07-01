import * as React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

export interface PageHeaderProps {
  title: string;
  description?: string;
  crumbs?: Array<{ href: string; label: string }>;
  actions?: React.ReactNode;
}

export function PageHeader({ title, description, crumbs, actions }: PageHeaderProps) {
  return (
    <div className="space-y-3">
      {crumbs && crumbs.length > 0 && (
        <nav
          aria-label="breadcrumb"
          className="flex flex-wrap items-center gap-1 text-xs text-white/60"
        >
          <Link href="/admin" className="flex items-center gap-1 hover:text-cyber-cyan">
            <Home className="h-3 w-3" />
            Admin
          </Link>
          {crumbs.map((c, i) => {
            const last = i === crumbs.length - 1;
            return (
              <React.Fragment key={c.href}>
                <ChevronRight className="h-3 w-3 text-white/30" />
                {last ? (
                  <span className="font-medium text-white">{c.label}</span>
                ) : (
                  <Link href={c.href} className="hover:text-cyber-cyan">
                    {c.label}
                  </Link>
                )}
              </React.Fragment>
            );
          })}
        </nav>
      )}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-orbitron text-2xl font-black text-white sm:text-3xl">{title}</h1>
          {description && <p className="mt-1 text-sm text-white/60">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}

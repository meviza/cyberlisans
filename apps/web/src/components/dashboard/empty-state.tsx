import * as React from 'react';
import Link from 'next/link';
import { Button } from '@cyberlisans/ui/atoms';
import type { LucideIcon } from 'lucide-react';

export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  ctaLabel?: string;
  ctaHref?: string;
}

export function EmptyState({ icon: Icon, title, description, ctaLabel, ctaHref }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-white/[0.02] px-6 py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-brand-accent/10 text-brand-accent">
        <Icon className="h-7 w-7" />
      </div>
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      {description && (
        <p className="mt-2 max-w-md text-sm text-brand-text-secondary">{description}</p>
      )}
      {ctaLabel && ctaHref && (
        <Link href={ctaHref} className="mt-6">
          <Button>{ctaLabel}</Button>
        </Link>
      )}
    </div>
  );
}

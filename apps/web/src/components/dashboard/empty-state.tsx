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
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-cyber-cyan/30 bg-cyber-darker/40 px-6 py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-cyber-cyan/30 bg-cyber-cyan/10 text-cyber-cyan">
        <Icon className="h-8 w-8" />
      </div>
      <h3 className="font-orbitron text-lg font-bold text-white">{title}</h3>
      {description && <p className="mt-2 max-w-md text-sm text-white/60">{description}</p>}
      {ctaLabel && ctaHref && (
        <Link href={ctaHref} className="mt-6">
          <Button>{ctaLabel}</Button>
        </Link>
      )}
    </div>
  );
}
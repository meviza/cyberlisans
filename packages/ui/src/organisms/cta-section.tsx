'use client';

import * as React from 'react';
import { Button } from '../atoms';
import { cn } from '../utils/cn';

export interface CtaSectionProps {
  title: string;
  subtitle?: string;
  ctaLabel: string;
  ctaHref?: string;
  onCtaClick?: () => void;
  children?: React.ReactNode;
  className?: string;
}

function CtaSection({
  title,
  subtitle,
  ctaLabel,
  ctaHref,
  onCtaClick,
  children,
  className,
}: CtaSectionProps) {
  return (
    <section
      className={cn(
        'relative overflow-hidden border-y border-cyber-cyan/20 bg-gradient-to-br from-cyber-cyan/10 via-cyber-bg to-cyber-magenta/10 py-20',
        className,
      )}
    >
      <div className="absolute inset-0 bg-grid-pattern opacity-20" />
      {children && <div className="absolute inset-0 pointer-events-none">{children}</div>}
      <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="font-orbitron text-3xl font-black uppercase tracking-tight text-cyber-text sm:text-5xl">
          <span className="bg-gradient-to-r from-cyber-cyan to-cyber-magenta bg-clip-text text-transparent text-glow-cyan">
            {title}
          </span>
        </h2>
        {subtitle && (
          <p className="mx-auto mt-4 max-w-2xl text-base text-cyber-text-dim sm:text-lg">
            {subtitle}
          </p>
        )}
        <div className="mt-8">
          <Button asChild size="lg" variant="gradient">
            <a href={ctaHref} onClick={onCtaClick}>
              {ctaLabel}
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}

export { CtaSection };

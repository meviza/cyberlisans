'use client';

import * as React from 'react';
import { Button } from '../atoms';
import { cn } from '../utils/cn';

export interface HeroSectionProps {
  title: string;
  subtitle?: string;
  primaryCta?: { label: string; href: string; onClick?: () => void };
  secondaryCta?: { label: string; href: string; onClick?: () => void };
  children?: React.ReactNode;
  className?: string;
}

function HeroSection({
  title,
  subtitle,
  primaryCta,
  secondaryCta,
  children,
  className,
}: HeroSectionProps) {
  return (
    <section className={cn('relative overflow-hidden', className)}>
      <div className="absolute inset-0 -z-10 bg-cyber-bg">
        <div className="absolute inset-0 bg-gradient-to-br from-cyber-cyan/10 via-transparent to-cyber-magenta/10" />
        <div className="absolute inset-0 bg-grid-pattern opacity-20" />
        <div className="absolute -top-1/2 left-1/2 h-[800px] w-[800px] -translate-x-1/2 rounded-full bg-cyber-cyan/10 blur-[120px] animate-pulse" />
        <div className="absolute -bottom-1/4 right-0 h-[400px] w-[400px] rounded-full bg-cyber-magenta/10 blur-[100px] animate-pulse" />
      </div>

      {children && <div className="absolute inset-0 -z-0 pointer-events-none">{children}</div>}

      <div className="relative mx-auto flex min-h-[80vh] max-w-7xl flex-col items-center justify-center px-4 py-20 text-center sm:px-6 lg:px-8">
        <h1 className="font-orbitron text-4xl font-black uppercase tracking-tight text-cyber-text sm:text-6xl lg:text-7xl">
          <span className="bg-gradient-to-r from-cyber-cyan via-white to-cyber-magenta bg-clip-text text-transparent text-glow-cyan">
            {title}
          </span>
        </h1>
        {subtitle && (
          <p className="mt-6 max-w-2xl text-base text-cyber-text-dim sm:text-lg lg:text-xl">
            {subtitle}
          </p>
        )}
        {(primaryCta || secondaryCta) && (
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:gap-4">
            {primaryCta && (
              <Button asChild size="lg" variant="gradient">
                <a href={primaryCta.href} onClick={primaryCta.onClick}>
                  {primaryCta.label}
                </a>
              </Button>
            )}
            {secondaryCta && (
              <Button asChild size="lg" variant="outline">
                <a href={secondaryCta.href} onClick={secondaryCta.onClick}>
                  {secondaryCta.label}
                </a>
              </Button>
            )}
          </div>
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyber-cyan to-transparent" />
    </section>
  );
}

export { HeroSection };

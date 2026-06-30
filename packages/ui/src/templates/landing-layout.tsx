'use client';

import * as React from 'react';
import { Navbar, Footer, type NavLink } from '../organisms';
import type { Language } from '../molecules/language-switch';
import { cn } from '../utils/cn';

export interface LandingLayoutProps {
  children: React.ReactNode;
  user?: { name: string; avatar?: string } | null;
  wallet?: { balance: number; currency: 'TRY' | 'USD' | 'EUR' };
  language?: Language;
  onLanguageChange?: (lang: Language) => void;
  onLogout?: () => void;
  links?: NavLink[];
  className?: string;
}

function LandingLayout({
  children,
  user,
  wallet,
  language = 'TR',
  onLanguageChange,
  onLogout,
  links,
  className,
}: LandingLayoutProps) {
  return (
    <div
      className={cn('relative min-h-screen flex flex-col bg-cyber-bg text-cyber-text', className)}
    >
      <div className="pointer-events-none fixed inset-0 z-0 bg-grid-pattern opacity-30" />
      <div className="pointer-events-none fixed inset-0 z-0 bg-gradient-to-br from-cyber-cyan/5 via-transparent to-cyber-magenta/5" />
      <div className="relative z-10 flex min-h-screen flex-col">
        <Navbar
          {...(user !== undefined && { user })}
          {...(wallet !== undefined && { wallet })}
          language={language}
          {...(onLanguageChange !== undefined && { onLanguageChange })}
          {...(onLogout !== undefined && { onLogout })}
          {...(links !== undefined && { links })}
        />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </div>
  );
}

export { LandingLayout };

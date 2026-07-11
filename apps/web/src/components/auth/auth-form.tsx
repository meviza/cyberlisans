import * as React from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@cyberlisans/ui/atoms';

export interface AuthFormProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function AuthForm({ title, subtitle, children, footer }: AuthFormProps) {
  return (
    <div className="w-full max-w-md">
      <Link href="/" className="mb-6 flex items-center justify-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-accent text-sm font-bold text-white shadow-accent-glow">
          CL
        </span>
        <span className="text-xl font-semibold tracking-tight text-white">
          Cyber<span className="text-brand-text-secondary">Lisans</span>
        </span>
      </Link>
      <Card>
        <CardContent className="p-8">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-white">{title}</h1>
            {subtitle && <p className="mt-2 text-sm text-brand-text-secondary">{subtitle}</p>}
          </div>
          {children}
        </CardContent>
      </Card>
      {footer && <div className="mt-6 text-center text-sm text-brand-text-secondary">{footer}</div>}
    </div>
  );
}

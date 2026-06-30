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
      <Link href="/" className="mb-6 flex items-center justify-center gap-2">
        <span className="font-orbitron text-2xl font-black text-white">
          CYBER<span className="text-cyber-cyan text-glow-cyan">LİSANS</span>
        </span>
      </Link>
      <Card className="border-cyber-cyan/30 bg-cyber-darker/80 backdrop-blur-md">
        <CardContent className="p-8">
          <div className="mb-6 text-center">
            <h1 className="font-orbitron text-2xl font-bold text-white">{title}</h1>
            {subtitle && <p className="mt-2 text-sm text-white/60">{subtitle}</p>}
          </div>
          {children}
        </CardContent>
      </Card>
      {footer && <div className="mt-6 text-center text-sm text-white/70">{footer}</div>}
    </div>
  );
}

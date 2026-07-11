import * as React from 'react';
import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@cyberlisans/ui/atoms';

export interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: { value: number; positive: boolean };
  hint?: string;
}

export function StatCard({ label, value, icon: Icon, trend, hint }: StatCardProps) {
  return (
    <Card className="group relative overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: 'radial-gradient(circle at top right, rgba(0,87,255,0.12), transparent 60%)',
        }}
      />
      <CardContent className="relative p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wider text-brand-muted">{label}</p>
            <p className="text-2xl font-semibold tracking-tight text-white">{value}</p>
            {hint && <p className="text-xs text-brand-muted">{hint}</p>}
            {trend && (
              <p
                className={
                  trend.positive
                    ? 'text-xs font-medium text-brand-success'
                    : 'text-xs font-medium text-brand-danger'
                }
              >
                {trend.positive ? '↑' : '↓'} {Math.abs(trend.value)}%
              </p>
            )}
          </div>
          <div className="rounded-xl border border-white/10 bg-brand-accent/10 p-2.5 text-brand-accent transition group-hover:border-brand-accent/40">
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

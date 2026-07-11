import * as React from 'react';
import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@cyberlisans/ui/atoms';

export interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: { value: number; positive: boolean };
  hint?: string;
  accent?: 'cyan' | 'magenta' | 'purple' | 'lime';
}

const ACCENT_MAP: Record<
  NonNullable<StatCardProps['accent']>,
  { border: string; bg: string; text: string }
> = {
  cyan: {
    border: 'border-brand-accent/30',
    bg: 'bg-brand-accent/10',
    text: 'text-brand-accent',
  },
  magenta: {
    border: 'border-[#6B7CFF]/30',
    bg: 'bg-[#6B7CFF]/10',
    text: 'text-[#6B7CFF]',
  },
  purple: {
    border: 'border-white/15',
    bg: 'bg-white/[0.04]',
    text: 'text-brand-text-secondary',
  },
  lime: {
    border: 'border-brand-success/30',
    bg: 'bg-brand-success/10',
    text: 'text-brand-success',
  },
};

export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  hint,
  accent = 'cyan',
}: StatCardProps) {
  const a = ACCENT_MAP[accent];
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
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 space-y-2">
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
          <div className={`rounded-xl border p-2.5 transition ${a.border} ${a.bg} ${a.text}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

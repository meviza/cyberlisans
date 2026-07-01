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
  { border: string; bg: string; text: string; glow: string }
> = {
  cyan: {
    border: 'border-cyber-cyan/30',
    bg: 'bg-cyber-cyan/10',
    text: 'text-cyber-cyan',
    glow: 'rgba(0,240,255,0.5)',
  },
  magenta: {
    border: 'border-cyber-magenta/30',
    bg: 'bg-cyber-magenta/10',
    text: 'text-cyber-magenta',
    glow: 'rgba(255,0,200,0.5)',
  },
  purple: {
    border: 'border-cyber-purple/30',
    bg: 'bg-cyber-purple/10',
    text: 'text-cyber-purple',
    glow: 'rgba(139,92,246,0.5)',
  },
  lime: {
    border: 'border-cyber-lime/30',
    bg: 'bg-cyber-lime/10',
    text: 'text-cyber-lime',
    glow: 'rgba(190,242,100,0.5)',
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
          background: `radial-gradient(circle at top right, ${a.glow.replace('0.5', '0.12')}, transparent 60%)`,
        }}
      />
      <CardContent className="relative p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 space-y-2">
            <p className="text-xs font-medium uppercase tracking-wider text-white/60">{label}</p>
            <p className="font-orbitron text-2xl font-bold text-white">{value}</p>
            {hint && <p className="text-xs text-white/50">{hint}</p>}
            {trend && (
              <p
                className={
                  trend.positive
                    ? 'text-xs font-medium text-cyber-lime'
                    : 'text-xs font-medium text-cyber-magenta'
                }
              >
                {trend.positive ? '↑' : '↓'} {Math.abs(trend.value)}%
              </p>
            )}
          </div>
          <div
            className={`rounded-md border ${a.border} ${a.bg} p-2.5 ${a.text} transition-all group-hover:shadow-[0_0_20px_${a.glow}]`}
          >
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

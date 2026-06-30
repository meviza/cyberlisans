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
          background:
            'radial-gradient(circle at top right, rgba(0,240,255,0.1), transparent 60%)',
        }}
      />
      <CardContent className="relative p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
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
          <div className="rounded-md border border-cyber-cyan/30 bg-cyber-cyan/10 p-2.5 text-cyber-cyan transition-all group-hover:border-cyber-cyan group-hover:shadow-[0_0_20px_rgba(0,240,255,0.5)]">
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
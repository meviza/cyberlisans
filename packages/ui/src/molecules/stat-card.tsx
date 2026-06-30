'use client';

import * as React from 'react';
import { TrendingUp, TrendingDown, type LucideIcon } from 'lucide-react';
import { Card, CardContent } from '../atoms';
import { cn } from '../utils/cn';

export interface StatCardProps {
  title: string;
  value: string | number;
  trend?: number;
  icon?: LucideIcon;
  className?: string;
}

function StatCard({ title, value, trend, icon: IconComponent, className }: StatCardProps) {
  const isUp = trend !== undefined && trend >= 0;

  return (
    <Card
      className={cn(
        'group relative overflow-hidden transition-all duration-300',
        'hover:border-transparent hover:shadow-card-hover',
        className,
      )}
    >
      <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-cyber-cyan via-cyber-magenta to-cyber-cyan opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="absolute inset-[1px] rounded-lg bg-cyber-bg-elevated" />
      <CardContent className="relative p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wider text-cyber-text-dim">
              {title}
            </p>
            <p className="font-orbitron text-2xl font-bold text-cyber-text group-hover:text-cyber-cyan transition-colors">
              {value}
            </p>
            {trend !== undefined && (
              <div
                className={cn(
                  'flex items-center gap-1 text-xs font-medium',
                  isUp ? 'text-cyber-lime' : 'text-cyber-pink',
                )}
              >
                {isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                <span>
                  {isUp ? '+' : ''}
                  {trend.toFixed(1)}%
                </span>
              </div>
            )}
          </div>
          {IconComponent && (
            <div className="rounded-md border border-cyber-cyan/30 bg-cyber-cyan/10 p-2 text-cyber-cyan group-hover:border-cyber-cyan group-hover:shadow-neon-cyan transition-all">
              <IconComponent className="h-5 w-5" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export { StatCard };

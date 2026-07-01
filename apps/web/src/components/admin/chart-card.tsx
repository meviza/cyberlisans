import * as React from 'react';
import { Card, CardContent } from '@cyberlisans/ui/atoms';

export interface ChartCardProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function ChartCard({ title, description, action, children, className }: ChartCardProps) {
  return (
    <Card className={className}>
      <CardContent className="p-5">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="font-orbitron text-sm font-bold uppercase tracking-wider text-white">
              {title}
            </h3>
            {description && <p className="mt-1 text-xs text-white/50">{description}</p>}
          </div>
          {action}
        </div>
        {children}
      </CardContent>
    </Card>
  );
}

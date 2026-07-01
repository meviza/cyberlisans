import * as React from 'react';
import { Card, CardContent } from '@cyberlisans/ui/atoms';
import { CheckCircle2, Circle } from 'lucide-react';
import { formatDateTime } from '@/lib/format';

export interface TimelineEntry {
  label: string;
  date: Date | string | null;
}

export function OrderTimeline({ timeline }: { timeline: TimelineEntry[] }) {
  return (
    <Card>
      <CardContent className="p-5">
        <h3 className="mb-4 font-orbitron text-sm font-bold uppercase tracking-wider text-white">
          Süreç
        </h3>
        <ol className="relative space-y-4">
          {timeline.map((t, i) => {
            const done = t.date !== null && t.date !== undefined;
            return (
              <li key={`${t.label}-${i}`} className="flex gap-3">
                <div className="flex flex-col items-center">
                  {done ? (
                    <CheckCircle2 className="h-5 w-5 text-cyber-lime" />
                  ) : (
                    <Circle className="h-5 w-5 text-white/30" />
                  )}
                  {i < timeline.length - 1 && (
                    <span
                      aria-hidden
                      className={`mt-1 h-full w-px ${done ? 'bg-cyber-lime/30' : 'bg-white/10'}`}
                    />
                  )}
                </div>
                <div className="flex-1 pb-2">
                  <p className={`text-sm ${done ? 'text-white' : 'text-white/50'}`}>{t.label}</p>
                  <p className="text-xs text-white/40">
                    {done && t.date ? formatDateTime(t.date) : 'Bekliyor'}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </CardContent>
    </Card>
  );
}

'use client';

import * as React from 'react';
import { CheckCircle2, Circle, AlertTriangle, Unlock, Clock } from 'lucide-react';
import { Card, CardContent } from '@cyberlisans/ui/atoms';
import { cn } from '@cyberlisans/ui/cn';
import type { OrderStatus } from './order-header';

export interface OrderStatusTimelineProps {
  status: OrderStatus;
  paidAt?: string | null;
  escrowHeldAt?: string | null;
  releaseEta?: string | null;
  releasedAt?: string | null;
}

interface Step {
  key: 'PENDING' | 'PAID' | 'ESCROW_HELD' | 'RELEASED' | 'DISPUTED';
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  when?: string | null;
}

export function OrderStatusTimeline({
  status,
  paidAt,
  escrowHeldAt,
  releaseEta,
  releasedAt,
}: OrderStatusTimelineProps) {
  const steps: Step[] = [
    { key: 'PENDING', label: 'Sipariş Oluşturuldu', icon: CheckCircle2 },
    { key: 'PAID', label: 'Ödendi', icon: CheckCircle2, when: paidAt },
    { key: 'ESCROW_HELD', label: 'İşleniyor', icon: Clock, when: escrowHeldAt },
  ];
  if (status === 'RELEASED') {
    steps.push({ key: 'RELEASED', label: 'Tamamlandı', icon: Unlock, when: releasedAt });
  }
  if (status === 'DISPUTED') {
    steps.push({ key: 'DISPUTED', label: 'İtiraz Açıldı', icon: AlertTriangle });
  }

  const isActive = (k: Step['key']) => {
    const order: Step['key'][] = ['PENDING', 'PAID', 'ESCROW_HELD', 'RELEASED'];
    if (status === 'DISPUTED') {
      return k === 'PENDING' || k === 'PAID' || k === 'ESCROW_HELD' || k === 'DISPUTED';
    }
    if (status === 'REFUNDED' || status === 'CANCELLED') {
      return k === 'PENDING' || k === 'PAID' || k === 'ESCROW_HELD';
    }
    const idx = order.indexOf(status);
    const cur = order.indexOf(k);
    return cur <= idx;
  };

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="mb-4 font-orbitron text-base font-bold text-white">Sipariş Süreci</h2>
        <ol className="space-y-3">
          {steps.map((s, i) => {
            const active = isActive(s.key);
            const Icon = s.icon;
            return (
              <li key={s.key} className="flex items-start gap-3">
                <div
                  className={cn(
                    'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border',
                    active
                      ? 'border-cyber-cyan bg-cyber-cyan/10 text-cyber-cyan'
                      : 'border-white/10 bg-white/5 text-white/30',
                  )}
                >
                  {active ? <Icon className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                </div>
                <div>
                  <p className={cn('font-medium', active ? 'text-white' : 'text-white/40')}>
                    {s.label}
                  </p>
                  {s.when && (
                    <p className="text-xs text-white/50">
                      {new Date(s.when).toLocaleString('tr-TR')}
                    </p>
                  )}
                  {s.key === 'ESCROW_HELD' && status === 'ESCROW_HELD' && releaseEta && (
                    <p className="text-xs text-cyber-cyan">
                      Tahmini tamamlanma: {new Date(releaseEta).toLocaleDateString('tr-TR')}
                    </p>
                  )}
                  {i < steps.length - 1 && (
                    <div
                      className={cn(
                        'ml-3 mt-1 h-3 w-px',
                        active ? 'bg-cyber-cyan/40' : 'bg-white/10',
                      )}
                    />
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </CardContent>
    </Card>
  );
}

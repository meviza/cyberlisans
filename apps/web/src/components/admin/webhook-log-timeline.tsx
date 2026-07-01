import * as React from 'react';
import { Card, CardContent, Badge } from '@cyberlisans/ui/atoms';
import { formatDateTime } from '@/lib/format';

export interface WebhookEntry {
  id: string;
  action: string;
  payload: unknown;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

const ACTION_VARIANT: Record<
  string,
  'success' | 'warning' | 'danger' | 'cyan' | 'magenta' | 'purple' | 'default'
> = {
  CREATE: 'success',
  UPDATE: 'cyan',
  DELETE: 'danger',
  STATUS_CHANGE: 'warning',
  BALANCE_CHANGE: 'purple',
};

function classify(entry: WebhookEntry): {
  label: string;
  variant: 'success' | 'danger' | 'cyan' | 'warning' | 'default';
} {
  const action = entry.action.toUpperCase();
  if (action === 'CREATE') return { label: 'Webhook Alındı', variant: 'success' };
  if (action === 'STATUS_CHANGE') {
    const payload = entry.payload as { to?: string } | null;
    if (payload?.to === 'SUCCEEDED') return { label: 'Ödeme Başarılı', variant: 'success' };
    if (payload?.to === 'FAILED') return { label: 'Ödeme Başarısız', variant: 'danger' };
    return { label: 'Durum Değişti', variant: 'cyan' };
  }
  if (action === 'UPDATE') return { label: 'Güncellendi', variant: 'cyan' };
  if (action === 'DELETE') return { label: 'Silindi', variant: 'danger' };
  return { label: entry.action, variant: 'default' };
}

export function WebhookLogTimeline({ entries }: { entries: WebhookEntry[] }) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-orbitron text-sm font-bold uppercase tracking-wider text-white">
            Webhook & Olay Zaman Çizelgesi
          </h3>
          <span className="text-xs text-white/50">{entries.length} kayıt</span>
        </div>

        {entries.length === 0 ? (
          <p className="rounded border border-dashed border-cyber-cyan/20 p-6 text-center text-sm text-white/50">
            Henüz webhook olayı yok
          </p>
        ) : (
          <ol className="relative space-y-4 border-l border-cyber-cyan/20 pl-5">
            {entries.map((e) => {
              const cls = classify(e);
              return (
                <li key={e.id} className="relative">
                  <span className="absolute -left-[26px] top-1.5 h-3 w-3 rounded-full border-2 border-cyber-darker bg-cyber-cyan shadow-[0_0_8px_rgba(0,240,255,0.6)]" />
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={cls.variant} size="sm">
                      {cls.label}
                    </Badge>
                    <span className="text-xs text-white/40">{formatDateTime(e.createdAt)}</span>
                    <span className="ml-auto font-mono text-[10px] text-white/40">
                      {ACTION_VARIANT[e.action] ? null : null}
                      {e.ipAddress ? `IP: ${e.ipAddress}` : ''}
                    </span>
                  </div>
                  {e.payload !== null && typeof e.payload === 'object' ? (
                    <pre className="mt-2 overflow-x-auto rounded bg-cyber-darker/60 p-2 text-[10px] text-white/70">
                      {JSON.stringify(e.payload, null, 2)}
                    </pre>
                  ) : null}
                </li>
              );
            })}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}

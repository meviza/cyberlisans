import * as React from 'react';
import { Card, CardContent, Badge } from '@cyberlisans/ui/atoms';
import { formatDateTime } from '@/lib/format';

export interface AuditLogRow {
  id: string;
  action: string;
  actor: { id: string; username: string; email: string; role: string } | null;
  targetType: string | null;
  targetId: string | null;
  payload: unknown;
  ipAddress: string | null;
  createdAt: Date | string;
}

const ACTION_VARIANT: Record<
  string,
  'cyan' | 'magenta' | 'purple' | 'success' | 'warning' | 'danger' | 'default'
> = {
  CREATE: 'success',
  UPDATE: 'cyan',
  DELETE: 'danger',
  STATUS_CHANGE: 'warning',
  ROLE_CHANGE: 'magenta',
  BALANCE_CHANGE: 'purple',
  SETTINGS_CHANGE: 'cyan',
  LOGIN: 'default',
};

export function UserAuditLogList({ logs }: { logs: AuditLogRow[] }) {
  return (
    <Card id="audit">
      <CardContent className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-orbitron text-sm font-bold uppercase tracking-wider text-white">
            Audit Log
          </h3>
          <span className="text-xs text-white/50">{logs.length} kayıt</span>
        </div>
        {logs.length === 0 ? (
          <p className="rounded border border-dashed border-cyber-cyan/20 p-6 text-center text-sm text-white/50">
            Henüz kayıt yok
          </p>
        ) : (
          <ul className="space-y-3">
            {logs.map((l) => (
              <li
                key={l.id}
                className="flex flex-col gap-2 rounded border border-cyber-cyan/10 bg-cyber-darker/30 p-3 sm:flex-row sm:items-start"
              >
                <div className="flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={ACTION_VARIANT[l.action] ?? 'default'} size="sm">
                      {l.action}
                    </Badge>
                    {l.targetType && (
                      <span className="text-xs text-white/60">
                        {l.targetType}
                        {l.targetId ? `:${l.targetId.slice(0, 8)}` : ''}
                      </span>
                    )}
                  </div>
                  {l.payload !== null && typeof l.payload === 'object' && (
                    <pre className="overflow-x-auto rounded bg-cyber-darker/60 p-2 text-[10px] text-white/60">
                      {JSON.stringify(l.payload, null, 2)}
                    </pre>
                  )}
                  <div className="flex flex-wrap gap-3 text-[10px] text-white/40">
                    <span>{formatDateTime(l.createdAt)}</span>
                    {l.actor && <span>@{l.actor.username}</span>}
                    {l.ipAddress && <span>IP: {l.ipAddress}</span>}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

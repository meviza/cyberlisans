'use client';

import * as React from 'react';
import { Badge, Spinner, Checkbox } from '@cyberlisans/ui/atoms';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { formatDateTime } from '@/lib/format';
import { cn } from '@cyberlisans/ui/cn';

export interface AdminAuditRow {
  id: string;
  actor: { id: string; email: string; username: string; role: string } | null;
  targetUser: { id: string; email: string; username: string } | null;
  action: string;
  targetType: string | null;
  targetId: string | null;
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
  ROLE_CHANGE: 'magenta',
  BALANCE_CHANGE: 'purple',
  SETTINGS_CHANGE: 'cyan',
  LOGIN: 'default',
};

export interface AuditLogTableProps {
  rows: AdminAuditRow[] | null;
  total: number;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
  error?: string | null;
}

export function AuditLogTable({
  rows,
  total,
  page,
  totalPages,
  onPageChange,
  loading,
  error,
}: AuditLogTableProps) {
  const [expanded, setExpanded] = React.useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setExpanded((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs text-white/50">
        <span>{total} kayıt</span>
        <span>
          Sayfa {page} / {totalPages}
        </span>
      </div>

      <div className="overflow-hidden rounded-lg border border-cyber-cyan/20 bg-cyber-darker/40">
        {loading && !rows && (
          <div className="flex h-64 items-center justify-center">
            <Spinner size="lg" />
          </div>
        )}

        {error && (
          <div className="border-b border-cyber-magenta/30 bg-cyber-magenta/5 p-4 text-sm text-cyber-magenta">
            {error}
          </div>
        )}

        {rows && rows.length === 0 && !error && (
          <p className="p-8 text-center text-sm text-white/50">Kayıt bulunamadı</p>
        )}

        {rows && rows.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-cyber-cyan/20 bg-cyber-darker/60">
                <tr className="text-left text-xs uppercase tracking-wider text-white/50">
                  <th className="w-10 px-4 py-3"></th>
                  <th className="px-4 py-3">Tarih</th>
                  <th className="px-4 py-3">Aktör</th>
                  <th className="px-4 py-3">Aksiyon</th>
                  <th className="px-4 py-3">Hedef</th>
                  <th className="px-4 py-3">IP</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const isOpen = expanded.has(r.id);
                  return (
                    <React.Fragment key={r.id}>
                      <tr
                        className={cn(
                          'cursor-pointer border-b border-cyber-cyan/10 transition-colors hover:bg-cyber-cyan/5',
                          isOpen && 'bg-cyber-cyan/5',
                        )}
                        onClick={() => toggle(r.id)}
                      >
                        <td className="px-4 py-3">
                          {isOpen ? (
                            <ChevronDown className="h-4 w-4 text-cyber-cyan" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-white/40" />
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs text-white/60">
                          {formatDateTime(r.createdAt)}
                        </td>
                        <td className="px-4 py-3 text-white/80">
                          {r.actor ? (
                            <span>
                              {r.actor.username}
                              <span className="ml-1 text-[10px] text-white/40">{r.actor.role}</span>
                            </span>
                          ) : (
                            <span className="text-white/40">system</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={ACTION_VARIANT[r.action] ?? 'default'} size="sm">
                            {r.action}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-xs text-white/70">
                          {r.targetType ?? '—'}
                          {r.targetId ? (
                            <span className="ml-1 font-mono text-white/40">
                              :{r.targetId.slice(0, 8)}
                            </span>
                          ) : null}
                        </td>
                        <td className="px-4 py-3 text-xs text-white/60">{r.ipAddress ?? '—'}</td>
                      </tr>
                      {isOpen ? (
                        <tr className="border-b border-cyber-cyan/10 bg-cyber-darker/60">
                          <td colSpan={6} className="px-4 py-3">
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                              <div>
                                <p className="mb-1 text-[10px] uppercase tracking-wider text-white/40">
                                  Metadata
                                </p>
                                <pre className="overflow-x-auto rounded bg-cyber-darker p-2 text-[10px] text-white/70">
                                  {JSON.stringify(r.payload ?? {}, null, 2)}
                                </pre>
                              </div>
                              <div className="space-y-1 text-xs text-white/60">
                                {r.actor ? (
                                  <p>
                                    <span className="text-white/40">Aktör Email:</span>{' '}
                                    {r.actor.email}
                                  </p>
                                ) : null}
                                {r.targetUser ? (
                                  <p>
                                    <span className="text-white/40">Hedef Kullanıcı:</span>{' '}
                                    {r.targetUser.username}{' '}
                                    <span className="text-white/30">({r.targetUser.email})</span>
                                  </p>
                                ) : null}
                                {r.userAgent ? (
                                  <p>
                                    <span className="text-white/40">User Agent:</span> {r.userAgent}
                                  </p>
                                ) : null}
                                <p>
                                  <span className="text-white/40">ID:</span>{' '}
                                  <span className="font-mono">{r.id}</span>
                                </p>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ) : null}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-cyber-cyan/20 px-4 py-3 text-xs">
            <button
              type="button"
              onClick={() => onPageChange(Math.max(1, page - 1))}
              disabled={page <= 1}
              className={cn(
                'rounded border border-cyber-cyan/30 px-3 py-1 transition-colors',
                page <= 1 ? 'cursor-not-allowed opacity-40' : 'hover:bg-cyber-cyan/10',
              )}
            >
              Önceki
            </button>
            <span className="text-white/60">
              {page} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => onPageChange(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages}
              className={cn(
                'rounded border border-cyber-cyan/30 px-3 py-1 transition-colors',
                page >= totalPages ? 'cursor-not-allowed opacity-40' : 'hover:bg-cyber-cyan/10',
              )}
            >
              Sonraki
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

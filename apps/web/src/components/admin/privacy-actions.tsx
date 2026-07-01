'use client';

import * as React from 'react';
import { ShieldCheck, Database, Trash2, Download } from 'lucide-react';
import { Card, CardContent, Spinner, Badge } from '@cyberlisans/ui/atoms';
import { apiFetch, ApiError } from '@/lib/api-client';
import { ManualExportModal } from './manual-export-modal';
import { ManualDeleteModal } from './manual-delete-modal';

export interface PrivacyOverview {
  totalConsents: number;
  totalUsers: number;
  breakdown: Record<string, { granted: number; denied: number; total: number }>;
}

export interface PrivacyRequestRow {
  id: string;
  actor: { id: string; email: string; username: string; role: string } | null;
  action: string;
  targetType: string;
  targetId: string | null;
  payload: unknown;
  ipAddress: string | null;
  createdAt: string;
}

export interface AuditExportRow {
  id: string;
  actor: { id: string; email: string; username: string; role: string } | null;
  action: string;
  targetType: string;
  targetId: string | null;
  payload: unknown;
  createdAt: string;
}

const ACTION_LABEL: Record<string, string> = {
  CREATE: 'Veri Dışa Aktarma',
  DELETE: 'Hesap Silme',
};

const ACTION_VARIANT: Record<string, 'cyan' | 'danger' | 'default'> = {
  CREATE: 'cyan',
  DELETE: 'danger',
};

export function PrivacyActions() {
  const [overview, setOverview] = React.useState<PrivacyOverview | null>(null);
  const [exports, setExports] = React.useState<PrivacyRequestRow[]>([]);
  const [deletes, setDeletes] = React.useState<PrivacyRequestRow[]>([]);
  const [pending, setPending] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [exportOpen, setExportOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [ov, ex, dl] = await Promise.all([
        apiFetch<PrivacyOverview>('/api/admin/privacy/overview'),
        apiFetch<{ items: PrivacyRequestRow[] }>(
          '/api/admin/audit?targetType=privacy_export&limit=50',
        ),
        apiFetch<{ items: PrivacyRequestRow[] }>(
          '/api/admin/audit?action=DELETE&targetType=user&limit=50',
        ),
      ]);
      setOverview(ov);
      setExports(ex.items ?? []);
      setDeletes(dl.items ?? []);
      const pend =
        (ex.items ?? []).filter((r) => {
          const p = r.payload as { kind?: string; status?: string } | null;
          return p?.status === 'PENDING' || p?.status === 'pending';
        }).length +
        (dl.items ?? []).filter((r) => {
          const p = r.payload as { kind?: string; status?: string } | null;
          return p?.status === 'PENDING' || p?.status === 'pending';
        }).length;
      setPending(pend);
    } catch (e) {
      if (e instanceof ApiError) setError(e.message);
      else setError('Yüklenemedi');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  if (loading && !overview) {
    return (
      <div className="flex h-[40vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Toplam Onay"
          value={overview?.totalConsents ?? 0}
          icon={ShieldCheck}
          accent="cyan"
        />
        <Stat
          label="Toplam Kullanıcı"
          value={overview?.totalUsers ?? 0}
          icon={Database}
          accent="purple"
        />
        <Stat
          label="Veri Dışa Aktarma Talepleri"
          value={exports.length}
          icon={Download}
          accent="cyan"
        />
        <Stat label="Hesap Silme Talepleri" value={deletes.length} icon={Trash2} accent="magenta" />
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-cyber-cyan/20 bg-cyber-darker/50 p-4">
        <span className="text-xs text-white/50">Bekleyen KVKK talebi:</span>
        <Badge variant={pending > 0 ? 'warning' : 'default'} size="md">
          {pending}
        </Badge>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setExportOpen(true)}
            className="inline-flex items-center gap-1 rounded-md border border-cyber-cyan/40 bg-cyber-cyan/10 px-3 py-1.5 text-xs text-cyber-cyan transition-colors hover:bg-cyber-cyan/20"
          >
            <Download className="h-3.5 w-3.5" />
            Manuel Dışa Aktar
          </button>
          <button
            type="button"
            onClick={() => setDeleteOpen(true)}
            className="inline-flex items-center gap-1 rounded-md border border-cyber-magenta/40 bg-cyber-magenta/10 px-3 py-1.5 text-xs text-cyber-magenta transition-colors hover:bg-cyber-magenta/20"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Manuel Sil (KVKK)
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-cyber-magenta/30 bg-cyber-magenta/5 p-4 text-sm text-cyber-magenta">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ConsentBreakdown breakdown={overview?.breakdown ?? {}} />
        <RequestList title="Veri Dışa Aktarma Talepleri" rows={exports} />
        <RequestList title="Hesap Silme Talepleri" rows={deletes} />
      </div>

      <ManualExportModal
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        onDone={() => {
          setExportOpen(false);
          load();
        }}
      />
      <ManualDeleteModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onDone={() => {
          setDeleteOpen(false);
          load();
        }}
      />
    </div>
  );
}

function Stat({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  accent: 'cyan' | 'magenta' | 'purple' | 'lime';
}) {
  const accentMap: Record<typeof accent, string> = {
    cyan: 'border-cyber-cyan/30 text-cyber-cyan',
    magenta: 'border-cyber-magenta/30 text-cyber-magenta',
    purple: 'border-cyber-purple/30 text-cyber-purple',
    lime: 'border-cyber-lime/30 text-cyber-lime',
  };
  return (
    <div className={`rounded-lg border ${accentMap[accent]} bg-cyber-darker/50 p-4`}>
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-medium uppercase tracking-wider text-white/50">{label}</p>
        <Icon className={`h-4 w-4 ${accentMap[accent].split(' ')[1]}`} />
      </div>
      <p className="mt-2 font-orbitron text-2xl font-bold text-white">{value}</p>
    </div>
  );
}

function ConsentBreakdown({ breakdown }: { breakdown: PrivacyOverview['breakdown'] }) {
  const entries = Object.entries(breakdown);
  if (entries.length === 0) {
    return (
      <Card>
        <CardContent className="p-5">
          <h3 className="mb-3 font-orbitron text-sm font-bold uppercase tracking-wider text-white">
            Onay İstatistikleri
          </h3>
          <p className="rounded border border-dashed border-cyber-cyan/20 p-6 text-center text-sm text-white/50">
            Henüz onay kaydı yok
          </p>
        </CardContent>
      </Card>
    );
  }
  return (
    <Card>
      <CardContent className="p-5">
        <h3 className="mb-3 font-orbitron text-sm font-bold uppercase tracking-wider text-white">
          Onay İstatistikleri
        </h3>
        <ul className="space-y-2">
          {entries.map(([type, b]) => {
            const total = Math.max(1, b.total);
            const grantedPct = Math.round((b.granted / total) * 100);
            return (
              <li key={type} className="rounded border border-cyber-cyan/10 bg-cyber-darker/30 p-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-white">{type}</span>
                  <span className="text-white/50">
                    {b.granted} ✓ / {b.denied} ✗ (toplam {b.total})
                  </span>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded bg-cyber-darker">
                  <div className="h-full bg-cyber-cyan" style={{ width: `${grantedPct}%` }} />
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}

function RequestList({ title, rows }: { title: string; rows: PrivacyRequestRow[] }) {
  return (
    <Card>
      <CardContent className="p-5">
        <h3 className="mb-3 font-orbitron text-sm font-bold uppercase tracking-wider text-white">
          {title}
        </h3>
        {rows.length === 0 ? (
          <p className="rounded border border-dashed border-cyber-cyan/20 p-6 text-center text-sm text-white/50">
            Henüz talep yok
          </p>
        ) : (
          <ul className="space-y-2">
            {rows.map((r) => (
              <li
                key={r.id}
                className="flex flex-wrap items-center gap-2 rounded border border-cyber-cyan/10 bg-cyber-darker/30 p-3 text-xs"
              >
                <Badge variant={ACTION_VARIANT[r.action] ?? 'default'} size="sm">
                  {ACTION_LABEL[r.action] ?? r.action}
                </Badge>
                {r.actor ? (
                  <span className="text-white/80">@{r.actor.username}</span>
                ) : (
                  <span className="text-white/40">system</span>
                )}
                {r.targetId ? (
                  <span className="font-mono text-white/50">→ {r.targetId.slice(0, 8)}</span>
                ) : null}
                <span className="ml-auto text-white/40">
                  {new Date(r.createdAt).toLocaleString('tr-TR')}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

'use client';

import * as React from 'react';
import { PageHeader } from '@/components/admin/page-header';
import { AuditLogFilters } from '@/components/admin/audit-log-filters';
import { AuditLogTable, type AdminAuditRow } from '@/components/admin/audit-log-table';
import { ExportAuditCsvButton } from '@/components/admin/export-audit-csv-button';
import { apiFetch, ApiError } from '@/lib/api-client';

export default function AdminAuditPage() {
  const [filters, setFilters] = React.useState<{
    search?: string;
    action?: string;
    targetType?: string;
    actorId?: string;
    from?: string;
    to?: string;
  }>({});
  const [page, setPage] = React.useState(1);
  const [rows, setRows] = React.useState<AdminAuditRow[] | null>(null);
  const [total, setTotal] = React.useState(0);
  const [totalPages, setTotalPages] = React.useState(1);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const qs = new URLSearchParams();
      qs.set('page', String(page));
      qs.set('limit', '30');
      if (filters.search) qs.set('search', filters.search);
      if (filters.action) qs.set('action', filters.action);
      if (filters.targetType) qs.set('targetType', filters.targetType);
      if (filters.actorId) qs.set('actorId', filters.actorId);
      if (filters.from) qs.set('from', filters.from);
      if (filters.to) qs.set('to', filters.to);
      const res = await apiFetch<{ items: AdminAuditRow[]; total: number; totalPages: number }>(
        `/api/admin/audit?${qs.toString()}`,
      );
      setRows(res.items);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch (e) {
      if (e instanceof ApiError) setError(e.message);
      else setError('Yüklenemedi');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  React.useEffect(() => {
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, [load]);

  React.useEffect(() => {
    setPage(1);
  }, [filters]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit Log"
        description="Sistem aksiyonları ve kullanıcı hareketleri (30sn'de bir yenilenir)"
        crumbs={[{ href: '/admin/audit', label: 'Audit Log' }]}
        actions={
          <ExportAuditCsvButton
            filters={{
              search: filters.search,
              action: filters.action,
              targetType: filters.targetType,
              actorId: filters.actorId,
              from: filters.from,
              to: filters.to,
            }}
          />
        }
      />

      <AuditLogFilters
        value={filters}
        onChange={(next) => setFilters((f) => ({ ...f, ...next }))}
        onReset={() => setFilters({})}
      />

      <AuditLogTable
        rows={rows}
        total={total}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        loading={loading}
        error={error}
      />
    </div>
  );
}

'use client';

import * as React from 'react';
import { Users, Plus, Download } from 'lucide-react';
import { Button } from '@cyberlisans/ui/atoms';
import { UsersTable } from '@/components/admin/users-table';
import { FilterBar, type FilterValue } from '@/components/admin/filter-bar';
import { ExportCsvButton } from '@/components/admin/export-csv-button';

const ROLE_OPTIONS = [
  { value: 'CUSTOMER', label: 'Müşteri' },
  { value: 'ADMIN', label: 'Admin' },
  { value: 'SUPER_ADMIN', label: 'Süper Admin' },
];

const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Aktif' },
  { value: 'SUSPENDED', label: 'Askıda' },
  { value: 'BANNED', label: 'Yasaklı' },
  { value: 'PENDING_VERIFICATION', label: 'Onay Bekliyor' },
];

export default function AdminUsersPage() {
  const [filters, setFilters] = React.useState<FilterValue>({});
  const [page, setPage] = React.useState(1);
  const [refreshKey, setRefreshKey] = React.useState(0);

  React.useEffect(() => {
    setPage(1);
  }, [filters]);

  const fromStr = filters.from;
  const toStr = filters.to;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-orbitron text-2xl font-black text-white sm:text-3xl">Kullanıcılar</h1>
          <p className="mt-1 text-sm text-white/60">Tüm kayıtlı kullanıcıları yönet</p>
        </div>
      </div>

      <FilterBar
        fields={[
          {
            key: 'search',
            label: 'Ara',
            type: 'search',
            placeholder: 'E-posta veya kullanıcı adı',
          },
          { key: 'role', label: 'Rol', type: 'select', options: ROLE_OPTIONS },
          { key: 'status', label: 'Durum', type: 'select', options: STATUS_OPTIONS },
        ]}
        value={filters}
        onChange={(next) => setFilters(next)}
        onReset={() => setFilters({})}
      />

      <DateRangeFields value={filters} onChange={setFilters} />

      <UsersTable
        filters={{
          search: filters.search,
          role: filters.role,
          status: filters.status,
          from: fromStr,
          to: toStr,
        }}
        page={page}
        pageSize={20}
        onPageChange={setPage}
        refreshKey={refreshKey}
        onMutated={() => setRefreshKey((k) => k + 1)}
      />
    </div>
  );
}

function DateRangeFields({
  value,
  onChange,
}: {
  value: FilterValue;
  onChange: (next: FilterValue) => void;
}) {
  return (
    <div className="flex flex-wrap items-end gap-3 rounded-lg border border-cyber-cyan/20 bg-cyber-darker/50 p-4">
      <div>
        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/60">
          Kayıt Tarihi (Başlangıç)
        </label>
        <input
          type="date"
          value={value.from?.slice(0, 10) ?? ''}
          onChange={(e) =>
            onChange({
              ...value,
              from: e.target.value ? `${e.target.value}T00:00:00.000Z` : undefined,
            })
          }
          className="h-10 rounded-md border border-cyber-cyan/30 bg-cyber-darker px-3 text-sm text-white"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/60">
          Kayıt Tarihi (Bitiş)
        </label>
        <input
          type="date"
          value={value.to?.slice(0, 10) ?? ''}
          onChange={(e) =>
            onChange({
              ...value,
              to: e.target.value ? `${e.target.value}T23:59:59.999Z` : undefined,
            })
          }
          className="h-10 rounded-md border border-cyber-cyan/30 bg-cyber-darker px-3 text-sm text-white"
        />
      </div>
    </div>
  );
}

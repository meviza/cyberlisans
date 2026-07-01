'use client';

import * as React from 'react';
import { PageHeader } from '@/components/admin/page-header';
import { FilterBar, type FilterValue } from '@/components/admin/filter-bar';
import { PaymentsTable } from '@/components/admin/payments-table';
import { ExportAuditCsvButton } from '@/components/admin/export-audit-csv-button';

const PROVIDER_OPTIONS = [
  { value: 'PAYTR', label: 'PayTR' },
  { value: 'PAPARA', label: 'Papara' },
  { value: 'STRIPE', label: 'Stripe' },
  { value: 'NOWPAYMENTS', label: 'Kripto' },
  { value: 'BANK_TRANSFER', label: 'Havale' },
  { value: 'WALLET', label: 'Cüzdan' },
];

const STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Bekliyor' },
  { value: 'PROCESSING', label: 'İşleniyor' },
  { value: 'SUCCEEDED', label: 'Başarılı' },
  { value: 'FAILED', label: 'Başarısız' },
  { value: 'REFUNDED', label: 'İade' },
  { value: 'EXPIRED', label: 'Süresi Doldu' },
];

const CURRENCY_OPTIONS = [
  { value: 'TRY', label: '₺ TRY' },
  { value: 'USD', label: '$ USD' },
  { value: 'EUR', label: '€ EUR' },
  { value: 'USDT', label: '₮ USDT' },
];

export default function AdminPaymentsPage() {
  const [filters, setFilters] = React.useState<FilterValue>({});
  const [page, setPage] = React.useState(1);
  const [refreshKey, setRefreshKey] = React.useState(0);

  React.useEffect(() => {
    setPage(1);
  }, [filters]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ödemeler"
        description="Tüm ödeme kayıtlarını yönet"
        crumbs={[{ href: '/admin/payments', label: 'Ödemeler' }]}
        actions={
          <ExportAuditCsvButton
            filters={{
              search: filters['search'],
              action: 'BALANCE_CHANGE',
              targetType: 'payment',
            }}
          />
        }
      />

      <FilterBar
        fields={[
          {
            key: 'search',
            label: 'Ara',
            type: 'search',
            placeholder: 'paymentId, orderId, email, provider txId',
          },
          { key: 'provider', label: 'Sağlayıcı', type: 'select', options: PROVIDER_OPTIONS },
          { key: 'status', label: 'Durum', type: 'select', options: STATUS_OPTIONS },
          { key: 'currency', label: 'Para Birimi', type: 'select', options: CURRENCY_OPTIONS },
        ]}
        value={filters}
        onChange={setFilters}
        onReset={() => setFilters({})}
      />

      <div className="flex flex-wrap items-end gap-3 rounded-lg border border-cyber-cyan/20 bg-cyber-darker/50 p-4">
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/60">
            Tarih (Başlangıç)
          </label>
          <input
            type="date"
            value={(filters['from'] as string | undefined)?.slice(0, 10) ?? ''}
            onChange={(e) =>
              setFilters((f) => ({
                ...f,
                from: e.target.value ? `${e.target.value}T00:00:00.000Z` : undefined,
              }))
            }
            className="h-10 rounded-md border border-cyber-cyan/30 bg-cyber-darker px-3 text-sm text-white"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/60">
            Tarih (Bitiş)
          </label>
          <input
            type="date"
            value={(filters['to'] as string | undefined)?.slice(0, 10) ?? ''}
            onChange={(e) =>
              setFilters((f) => ({
                ...f,
                to: e.target.value ? `${e.target.value}T23:59:59.999Z` : undefined,
              }))
            }
            className="h-10 rounded-md border border-cyber-cyan/30 bg-cyber-darker px-3 text-sm text-white"
          />
        </div>
      </div>

      <PaymentsTable
        filters={{
          search: filters['search'],
          provider: filters['provider'],
          status: filters['status'],
          currency: filters['currency'],
          from: filters['from'],
          to: filters['to'],
        }}
        page={page}
        pageSize={20}
        onPageChange={setPage}
        refreshKey={refreshKey}
      />
    </div>
  );
}

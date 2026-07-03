'use client';

import * as React from 'react';
import { PageHeader } from '@/components/admin/page-header';
import { FilterBar, type FilterValue } from '@/components/admin/filter-bar';
import { OrdersTable } from '@/components/admin/orders-table';

const ORDER_STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Bekliyor' },
  { value: 'PAID', label: 'Ödendi' },
  { value: 'FULFILLED', label: 'Teslim Edildi' },
  { value: 'CANCELLED', label: 'İptal' },
  { value: 'REFUNDED', label: 'İade' },
  { value: 'FAILED', label: 'Başarısız' },
];

const PAYMENT_STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Bekliyor' },
  { value: 'PROCESSING', label: 'İşleniyor' },
  { value: 'SUCCEEDED', label: 'Başarılı' },
  { value: 'FAILED', label: 'Başarısız' },
  { value: 'REFUNDED', label: 'İade' },
  { value: 'EXPIRED', label: 'Süresi Doldu' },
];

const PAYMENT_METHOD_OPTIONS = [
  { value: 'PAYTR', label: 'PayTR' },
  { value: 'PAPARA', label: 'Papara' },
  { value: 'NOWPAYMENTS', label: 'Kripto' },
  { value: 'STRIPE', label: 'Stripe' },
  { value: 'BANK_TRANSFER', label: 'Havale' },
  { value: 'WALLET', label: 'Cüzdan' },
];

export default function AdminOrdersPage() {
  const [filters, setFilters] = React.useState<FilterValue>({});
  const [page, setPage] = React.useState(1);

  React.useEffect(() => {
    setPage(1);
  }, [filters]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Siparişler"
        description="Sipariş durumlarını, teslimat akışını ve toplu operasyonları yönet"
        crumbs={[{ href: '/admin/orders', label: 'Siparişler' }]}
      />

      <FilterBar
        fields={[
          {
            key: 'search',
            label: 'Ara',
            type: 'search',
            placeholder: 'Sipariş no, ID veya e-posta',
          },
          { key: 'status', label: 'Sipariş Durumu', type: 'select', options: ORDER_STATUS_OPTIONS },
          {
            key: 'paymentStatus',
            label: 'Ödeme Durumu',
            type: 'select',
            options: PAYMENT_STATUS_OPTIONS,
          },
          {
            key: 'paymentMethod',
            label: 'Ödeme Yöntemi',
            type: 'select',
            options: PAYMENT_METHOD_OPTIONS,
          },
        ]}
        value={filters}
        onChange={setFilters}
        onReset={() => setFilters({})}
      />

      <DateRangeFields value={filters} onChange={setFilters} />

      <OrdersTable
        filters={{
          search: filters.search,
          status: filters.status,
          paymentStatus: filters.paymentStatus,
          paymentMethod: filters.paymentMethod,
          from: filters.from,
          to: filters.to,
        }}
        page={page}
        pageSize={20}
        onPageChange={setPage}
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
          Başlangıç
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
          Bitiş
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

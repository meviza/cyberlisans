'use client';

import * as React from 'react';
import { FilterBar, type FilterValue } from '@/components/admin/filter-bar';

export interface AuditLogFiltersProps {
  value: FilterValue & { from?: string; to?: string };
  onChange: (next: FilterValue & { from?: string; to?: string }) => void;
  onReset: () => void;
}

const ACTION_OPTIONS = [
  { value: 'CREATE', label: 'CREATE' },
  { value: 'UPDATE', label: 'UPDATE' },
  { value: 'DELETE', label: 'DELETE' },
  { value: 'STATUS_CHANGE', label: 'STATUS_CHANGE' },
  { value: 'BALANCE_CHANGE', label: 'BALANCE_CHANGE' },
  { value: 'ROLE_CHANGE', label: 'ROLE_CHANGE' },
  { value: 'SETTINGS_CHANGE', label: 'SETTINGS_CHANGE' },
  { value: 'LOGIN', label: 'LOGIN' },
];

const TARGET_OPTIONS = [
  { value: 'user', label: 'user' },
  { value: 'order', label: 'order' },
  { value: 'payment', label: 'payment' },
  { value: 'product', label: 'product' },
  { value: 'wallet', label: 'wallet' },
  { value: 'settings', label: 'settings' },
  { value: 'privacy_export', label: 'privacy_export' },
];

export function AuditLogFilters({ value, onChange, onReset }: AuditLogFiltersProps) {
  return (
    <div className="space-y-3">
      <FilterBar
        fields={[
          { key: 'search', label: 'Ara', type: 'search', placeholder: 'userId, action, target' },
          { key: 'action', label: 'Aksiyon', type: 'select', options: ACTION_OPTIONS },
          { key: 'targetType', label: 'Hedef Tip', type: 'select', options: TARGET_OPTIONS },
          { key: 'actorId', label: 'Aktör', type: 'search', placeholder: 'userId' },
        ]}
        value={value}
        onChange={onChange}
        onReset={onReset}
      />
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
    </div>
  );
}

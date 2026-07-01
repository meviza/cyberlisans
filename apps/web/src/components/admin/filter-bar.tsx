'use client';

import * as React from 'react';
import { Search, X } from 'lucide-react';
import { Button, Input, Select } from '@cyberlisans/ui/atoms';
import { cn } from '@cyberlisans/ui/cn';

export interface FilterField {
  key: string;
  label: string;
  type: 'search' | 'select';
  options?: Array<{ value: string; label: string }>;
  placeholder?: string;
}

export interface FilterValue {
  search?: string;
  [key: string]: string | undefined;
}

export interface FilterBarProps {
  fields: FilterField[];
  value: FilterValue;
  onChange: (next: FilterValue) => void;
  onReset?: () => void;
  className?: string;
}

export function FilterBar({ fields, value, onChange, onReset, className }: FilterBarProps) {
  const update = (key: string, v: string) => {
    onChange({ ...value, [key]: v || undefined });
  };

  const hasValue = Object.values(value).some((v) => v && v.length > 0);

  return (
    <div
      className={cn(
        'flex flex-wrap items-end gap-3 rounded-lg border border-cyber-cyan/20 bg-cyber-darker/50 p-4',
        className,
      )}
    >
      {fields.map((f) => {
        if (f.type === 'search') {
          return (
            <div key={f.key} className="min-w-[220px] flex-1">
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/60">
                {f.label}
              </label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cyber-cyan/60" />
                <Input
                  type="search"
                  value={value[f.key] ?? ''}
                  onChange={(e) => update(f.key, e.target.value)}
                  placeholder={f.placeholder}
                  className="pl-9"
                />
              </div>
            </div>
          );
        }
        return (
          <div key={f.key} className="min-w-[160px]">
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/60">
              {f.label}
            </label>
            <Select
              value={value[f.key] ?? ''}
              onChange={(e) => update(f.key, e.target.value)}
              options={[{ value: '', label: 'Tümü' }, ...(f.options ?? [])]}
            />
          </div>
        );
      })}
      {onReset && hasValue && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onReset}
          className="gap-1 text-white/70 hover:text-white"
        >
          <X className="h-3.5 w-3.5" />
          Temizle
        </Button>
      )}
    </div>
  );
}

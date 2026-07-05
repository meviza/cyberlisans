'use client';

import * as React from 'react';
import { Plus, X } from 'lucide-react';
import { Input, Button } from '@cyberlisans/ui/atoms';

export interface ProductImagesInputProps {
  value: string[];
  disabled: boolean;
  onChange: (v: string[]) => void;
}

export function ProductImagesInput({ value, disabled, onChange }: ProductImagesInputProps) {
  const [draft, setDraft] = React.useState('');
  const add = () => {
    const url = draft.trim();
    if (!url) return;
    onChange([...value, url]);
    setDraft('');
  };
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          type="url"
          placeholder="https://..."
          value={draft}
          disabled={disabled}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              add();
            }
          }}
        />
        <Button type="button" variant="outline" onClick={add} disabled={disabled || !draft.trim()}>
          <Plus className="h-4 w-4" /> Ekle
        </Button>
      </div>
      {value.length > 0 && (
        <ul className="space-y-1.5">
          {value.map((url, i) => (
            <li
              key={i}
              className="flex items-center gap-2 rounded-md border border-cyber-cyan/20 bg-cyber-darker/40 px-2 py-1.5 text-xs"
            >
              <span className="flex-1 truncate font-mono text-white/70">{url}</span>
              <button
                type="button"
                onClick={() => onChange(value.filter((_, idx) => idx !== i))}
                disabled={disabled}
                className="text-cyber-magenta hover:text-white"
                aria-label="Kaldır"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

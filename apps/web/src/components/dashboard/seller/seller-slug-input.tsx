import * as React from 'react';
import { Label } from '@cyberlisans/ui/atoms';

export interface SellerSlugInputProps {
  slug: string;
  suggestion: string;
  disabled: boolean;
  onSlugChange: (v: string) => void;
  onAcceptSuggestion: () => void;
}

export function SellerSlugInput({
  slug,
  suggestion,
  disabled,
  onSlugChange,
  onAcceptSuggestion,
}: SellerSlugInputProps) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor="slug">Mağaza URL</Label>
      <div className="flex items-center gap-2 rounded-md border border-cyber-cyan/30 bg-cyber-bg/50 px-3 py-2 text-sm">
        <span className="text-white/50">/s/</span>
        <input
          id="slug"
          value={slug}
          onChange={(e) => onSlugChange(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
          disabled={disabled}
          className="flex-1 bg-transparent text-cyber-text outline-none"
          maxLength={40}
        />
      </div>
      {suggestion && suggestion !== slug && (
        <button
          type="button"
          onClick={onAcceptSuggestion}
          className="text-xs text-cyber-cyan hover:underline"
        >
          Öneri: {suggestion}
        </button>
      )}
    </div>
  );
}

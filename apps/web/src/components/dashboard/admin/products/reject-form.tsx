'use client';

import * as React from 'react';
import { X, Loader2, AlertCircle } from 'lucide-react';
import { Button, Label } from '@cyberlisans/ui/atoms';

export interface RejectFormProps {
  submitting: boolean;
  error: string | null;
  onSubmit: (reason: string) => void;
}

export function RejectForm({ submitting, error, onSubmit }: RejectFormProps) {
  const [reason, setReason] = React.useState('');
  const valid = reason.trim().length >= 5;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    onSubmit(reason.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-1">
        <Label htmlFor="reject-reason">Red Sebebi</Label>
        <textarea
          id="reject-reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={4}
          minLength={5}
          required
          placeholder="Satıcıya iletilecek gerekçe (en az 5 karakter)"
          className="w-full rounded-md border border-cyber-magenta/30 bg-cyber-darker/60 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-cyber-magenta focus:outline-none focus:ring-1 focus:ring-cyber-magenta"
        />
      </div>
      {error && (
        <div className="flex items-center gap-1.5 text-xs text-cyber-magenta">
          <AlertCircle className="h-3.5 w-3.5" />
          {error}
        </div>
      )}
      <Button
        type="submit"
        disabled={submitting || !valid}
        className="w-full bg-cyber-magenta text-white hover:bg-cyber-magenta/90"
      >
        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
        {submitting ? 'Reddediliyor...' : 'Reddet'}
      </Button>
    </form>
  );
}

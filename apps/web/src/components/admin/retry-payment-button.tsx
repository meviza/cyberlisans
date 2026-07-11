'use client';

import * as React from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import { apiFetch, ApiError } from '@/lib/api-client';
import { cn } from '@cyberlisans/ui/cn';

export interface RetryPaymentButtonProps {
  paymentId: string;
  onDone?: () => void;
  className?: string;
}

export function RetryPaymentButton({ paymentId, onDone, className }: RetryPaymentButtonProps) {
  const [busy, setBusy] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  const onClick = async () => {
    if (busy) return;
    setBusy(true);
    setErr(null);
    try {
      await apiFetch(`/admin/payments/${paymentId}/retry`, { method: 'POST' });
      onDone?.();
    } catch (e) {
      if (e instanceof ApiError) setErr(e.message);
      else setErr('Yeniden denenemedi');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={cn('inline-flex items-center gap-2', className)}>
      <button
        type="button"
        onClick={onClick}
        disabled={busy}
        className="inline-flex items-center gap-1 rounded-md border border-cyber-cyan/40 bg-cyber-cyan/10 px-3 py-1.5 text-xs text-cyber-cyan transition-colors hover:bg-cyber-cyan/20 disabled:opacity-50"
      >
        {busy ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <RefreshCw className="h-3.5 w-3.5" />
        )}
        Yeniden Dene
      </button>
      {err ? <span className="text-xs text-cyber-magenta">{err}</span> : null}
    </div>
  );
}

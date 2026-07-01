'use client';

import * as React from 'react';
import { Download, Loader2 } from 'lucide-react';
import { Button } from '@cyberlisans/ui/atoms';
import { getAccessToken, ApiError } from '@/lib/api-client';
import { cn } from '@cyberlisans/ui/cn';

export interface ExportCsvButtonProps {
  filters: Record<string, string | undefined>;
  className?: string;
}

export function ExportCsvButton({ filters, className }: ExportCsvButtonProps) {
  const [busy, setBusy] = React.useState(false);

  const onClick = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const qs = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => {
        if (v) qs.set(k, v);
      });
      const token = getAccessToken();
      const res = await fetch(`/api/admin/orders/export?${qs.toString()}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        cache: 'no-store',
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'İndirilemedi');
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'CSV indirilemedi';
      window.alert(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={onClick}
      disabled={busy}
      className={cn('gap-2', className)}
    >
      {busy ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Download className="h-3.5 w-3.5" />
      )}
      CSV İndir
    </Button>
  );
}

'use client';

import * as React from 'react';
import { CheckCircle2, XCircle, Loader2, MoreHorizontal, Send } from 'lucide-react';
import { apiFetch, ApiError } from '@/lib/api-client';
import { cn } from '@cyberlisans/ui/cn';
import type { OrderStatus } from './orders-table';

export interface OrderActionButtonsProps {
  mode: 'inline' | 'bulk';
  orderId?: string;
  orderIds?: string[];
  currentStatus?: OrderStatus;
  onDone?: () => void;
}

export function OrderActionButtons({
  mode,
  orderId,
  orderIds,
  currentStatus,
  onDone,
}: OrderActionButtonsProps) {
  const [busy, setBusy] = React.useState<null | 'fulfill' | 'cancel' | 'paid'>(null);

  const markablePaid = mode === 'inline' && currentStatus === 'PENDING';
  const fulfillable = mode === 'inline' && currentStatus === 'PAID';
  const cancellable =
    mode === 'inline' && (currentStatus === 'PENDING' || currentStatus === 'PAID');

  const markPaid = async () => {
    if (!orderId || busy) return;
    setBusy('paid');
    try {
      // api-client prefixes /api
      await apiFetch(`/admin/orders/${orderId}/mark-paid`, { method: 'POST' });
      onDone?.();
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'İşlem başarısız';
      window.alert(msg);
    } finally {
      setBusy(null);
    }
  };

  const fulfill = async () => {
    if (!orderId || busy) return;
    setBusy('fulfill');
    try {
      await apiFetch(`/admin/orders/${orderId}/fulfill`, { method: 'POST' });
      onDone?.();
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'İşlem başarısız';
      window.alert(msg);
    } finally {
      setBusy(null);
    }
  };

  const cancel = async () => {
    if (!orderId || busy) return;
    const reason = window.prompt('İptal sebebi (en az 5 karakter):');
    if (!reason || reason.trim().length < 5) return;
    setBusy('cancel');
    try {
      await apiFetch(`/admin/orders/${orderId}/cancel`, {
        method: 'POST',
        body: JSON.stringify({ reason: reason.trim(), restoreKeys: true }),
      });
      onDone?.();
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'İşlem başarısız';
      window.alert(msg);
    } finally {
      setBusy(null);
    }
  };

  if (mode === 'bulk' && orderIds && orderIds.length > 0) {
    const bulkFulfill = async () => {
      if (busy) return;
      if (!window.confirm(`${orderIds.length} siparişi "teslim edildi" olarak işaretle?`)) return;
      setBusy('fulfill');
      let ok = 0;
      for (const id of orderIds) {
        try {
          await apiFetch(`/admin/orders/${id}/fulfill`, { method: 'POST' });
          ok++;
        } catch {
          /* swallow */
        }
      }
      setBusy(null);
      window.alert(`${ok}/${orderIds.length} sipariş güncellendi`);
      onDone?.();
    };

    const bulkCancel = async () => {
      if (busy) return;
      const reason = window.prompt('İptal sebebi (en az 5 karakter):');
      if (!reason || reason.trim().length < 5) return;
      setBusy('cancel');
      let ok = 0;
      for (const id of orderIds) {
        try {
          await apiFetch(`/admin/orders/${id}/cancel`, {
            method: 'POST',
            body: JSON.stringify({ reason: reason.trim(), restoreKeys: true }),
          });
          ok++;
        } catch {
          /* swallow */
        }
      }
      setBusy(null);
      window.alert(`${ok}/${orderIds.length} sipariş iptal edildi`);
      onDone?.();
    };

    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-cyber-cyan">{orderIds.length} seçili</span>
        <button
          type="button"
          onClick={bulkFulfill}
          disabled={busy !== null}
          className="rounded border border-cyber-lime/30 bg-cyber-lime/10 px-2 py-1 text-xs text-cyber-lime hover:bg-cyber-lime/20"
        >
          {busy === 'fulfill' ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <CheckCircle2 className="h-3 w-3" />
          )}{' '}
          Teslim Et
        </button>
        <button
          type="button"
          onClick={bulkCancel}
          disabled={busy !== null}
          className="rounded border border-cyber-magenta/30 bg-cyber-magenta/10 px-2 py-1 text-xs text-cyber-magenta hover:bg-cyber-magenta/20"
        >
          {busy === 'cancel' ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <XCircle className="h-3 w-3" />
          )}{' '}
          İptal
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      {markablePaid && (
        <button
          type="button"
          onClick={markPaid}
          disabled={busy !== null}
          title="Ödendi işaretle (manuel)"
          className="rounded p-1.5 text-brand-accent/80 transition-colors hover:bg-brand-accent/10 hover:text-brand-accent disabled:opacity-40"
        >
          {busy === 'paid' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </button>
      )}
      {fulfillable && (
        <button
          type="button"
          onClick={fulfill}
          disabled={busy !== null}
          title="Teslim Et"
          className="rounded p-1.5 text-cyber-lime/80 transition-colors hover:bg-cyber-lime/10 hover:text-cyber-lime disabled:opacity-40"
        >
          {busy === 'fulfill' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle2 className="h-4 w-4" />
          )}
        </button>
      )}
      {cancellable && (
        <button
          type="button"
          onClick={cancel}
          disabled={busy !== null}
          title="İptal Et"
          className="rounded p-1.5 text-cyber-magenta/80 transition-colors hover:bg-cyber-magenta/10 hover:text-cyber-magenta disabled:opacity-40"
        >
          {busy === 'cancel' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <XCircle className="h-4 w-4" />
          )}
        </button>
      )}
      {!fulfillable && !cancellable && (
        <span className="text-white/30">
          <MoreHorizontal className="h-4 w-4" />
        </span>
      )}
    </div>
  );
}

'use client';

import * as React from 'react';
import { Loader2, RefreshCw, Undo2 } from 'lucide-react';
import { apiFetch, ApiError } from '@/lib/api-client';
import { cn } from '@cyberlisans/ui/cn';
import { RefundPaymentModal } from './refund-payment-modal';
import { RetryPaymentButton } from './retry-payment-button';

export interface PaymentActionButtonsProps {
  payment: {
    id: string;
    status: 'PENDING' | 'PROCESSING' | 'SUCCEEDED' | 'FAILED' | 'REFUNDED' | 'EXPIRED';
    amount: number;
    currency: 'TRY' | 'USD' | 'EUR' | 'USDT';
  };
  onDone?: () => void;
}

export function PaymentActionButtons({ payment, onDone }: PaymentActionButtonsProps) {
  const [refundOpen, setRefundOpen] = React.useState(false);
  const [refundMode, setRefundMode] = React.useState<'full' | 'partial'>('full');

  const canRetry =
    payment.status === 'PENDING' || payment.status === 'FAILED' || payment.status === 'EXPIRED';
  const canRefund = payment.status === 'SUCCEEDED';

  return (
    <div className="flex flex-wrap items-center gap-2">
      {canRetry ? <RetryPaymentButton paymentId={payment.id} onDone={onDone} /> : null}

      {canRefund ? (
        <>
          <button
            type="button"
            onClick={() => {
              setRefundMode('full');
              setRefundOpen(true);
            }}
            className="inline-flex items-center gap-1 rounded-md border border-cyber-magenta/40 bg-cyber-magenta/10 px-3 py-1.5 text-xs text-cyber-magenta transition-colors hover:bg-cyber-magenta/20"
          >
            <Undo2 className="h-3.5 w-3.5" />
            Tam İade
          </button>
          <button
            type="button"
            onClick={() => {
              setRefundMode('partial');
              setRefundOpen(true);
            }}
            className="inline-flex items-center gap-1 rounded-md border border-cyber-purple/40 bg-cyber-purple/10 px-3 py-1.5 text-xs text-cyber-purple transition-colors hover:bg-cyber-purple/20"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Kısmi İade
          </button>
        </>
      ) : null}

      {refundOpen ? (
        <RefundPaymentModal
          paymentId={payment.id}
          mode={refundMode}
          maxAmount={payment.amount}
          currency={payment.currency}
          open={refundOpen}
          onClose={() => setRefundOpen(false)}
          onSuccess={() => {
            setRefundOpen(false);
            onDone?.();
          }}
        />
      ) : null}
    </div>
  );
}

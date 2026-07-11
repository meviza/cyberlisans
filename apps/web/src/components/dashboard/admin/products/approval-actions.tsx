'use client';

import * as React from 'react';
import Link from 'next/link';
import { Check, X, Loader2 } from 'lucide-react';
import { Button } from '@cyberlisans/ui/atoms';
import { useApproveProduct, useRejectProduct } from '@/lib/hooks/use-admin-products';
import { RejectProductDialog } from './reject-product-dialog';

export interface ApprovalActionsProps {
  productId: string;
  productName: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  onComplete?: () => void;
}

export function ApprovalActions({
  productId,
  productName,
  status,
  onComplete,
}: ApprovalActionsProps) {
  const { approve, loading: approving, error: approveError } = useApproveProduct(productId);
  const { reject, loading: rejecting, error: rejectError } = useRejectProduct(productId);
  const [rejectOpen, setRejectOpen] = React.useState(false);

  const handleApprove = async () => {
    const ok = await approve();
    if (ok) onComplete?.();
  };

  const handleReject = async (reason: string) => {
    const ok = await reject(reason);
    if (ok) {
      setRejectOpen(false);
      onComplete?.();
    }
  };

  if (status !== 'PENDING') {
    return (
      <span className="text-xs text-white/50">
        {status === 'APPROVED' ? 'Onaylandı' : 'Reddedildi'}
      </span>
    );
  }

  return (
    <>
      <div className="flex items-center justify-end gap-2">
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={handleApprove}
          disabled={approving || rejecting}
          className="text-cyber-lime hover:bg-cyber-lime/10 hover:text-cyber-lime"
        >
          {approving ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Check className="h-3.5 w-3.5" />
          )}
          Onayla
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => setRejectOpen(true)}
          disabled={approving || rejecting}
          className="text-cyber-magenta hover:bg-cyber-magenta/10 hover:text-cyber-magenta"
        >
          <X className="h-3.5 w-3.5" />
          Reddet
        </Button>
        <Link
          href={`/admin/product-approvals/${productId}`}
          className="rounded-md border border-cyber-cyan/40 px-2 py-1 text-xs text-cyber-cyan hover:bg-cyber-cyan/10"
        >
          İncele →
        </Link>
      </div>
      <RejectProductDialog
        open={rejectOpen}
        productName={productName}
        submitting={rejecting}
        error={rejectError ?? approveError}
        onOpenChange={setRejectOpen}
        onSubmit={handleReject}
      />
    </>
  );
}

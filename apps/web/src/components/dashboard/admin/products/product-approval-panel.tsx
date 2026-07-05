'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Check, Loader2 } from 'lucide-react';
import { Card, CardContent, Button } from '@cyberlisans/ui/atoms';
import { useApproveProduct, useRejectProduct } from '@/lib/hooks/use-admin-products';
import type { ProductReviewStatus } from '@/lib/api/admin-products';
import { ApprovalSuccessCard } from './approval-success-card';
import { RejectForm } from './reject-form';

export interface ProductApprovalPanelProps {
  productId: string;
  status: ProductReviewStatus;
}

export function ProductApprovalPanel({ productId, status }: ProductApprovalPanelProps) {
  const router = useRouter();
  const { approve, loading: approving, error: approveError } = useApproveProduct(productId);
  const { reject, loading: rejecting, error: rejectError } = useRejectProduct(productId);
  const [success, setSuccess] = React.useState<'APPROVED' | 'REJECTED' | null>(null);

  const handleApprove = async () => {
    const ok = await approve();
    if (ok) {
      setSuccess('APPROVED');
      setTimeout(() => router.push('/dashboard/admin/products'), 800);
    }
  };

  const handleReject = async (reason: string) => {
    const ok = await reject(reason);
    if (ok) {
      setSuccess('REJECTED');
      setTimeout(() => router.push('/dashboard/admin/products'), 800);
    }
  };

  if (status !== 'PENDING') {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-sm text-white">
            Bu ürün zaten {status === 'APPROVED' ? 'onaylanmış' : 'reddedilmiş'}.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (success) return <ApprovalSuccessCard kind={success} />;

  return (
    <Card>
      <CardContent className="space-y-5 p-6">
        <div>
          <h3 className="font-orbitron text-base font-bold text-white">Onay / Red</h3>
          <p className="mt-1 text-xs text-white/50">
            Ürünü yayına alın ya da sebep belirterek reddedin.
          </p>
        </div>

        <Button
          type="button"
          onClick={handleApprove}
          disabled={approving || rejecting}
          className="w-full bg-cyber-lime text-cyber-bg hover:bg-cyber-lime/90"
        >
          {approving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
          {approving ? 'Onaylanıyor...' : 'Onayla'}
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center" aria-hidden>
            <div className="w-full border-t border-cyber-cyan/20" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-cyber-dark px-2 text-[10px] uppercase tracking-wider text-white/40">
              veya
            </span>
          </div>
        </div>

        <RejectForm
          submitting={rejecting}
          error={approveError || rejectError}
          onSubmit={handleReject}
        />
      </CardContent>
    </Card>
  );
}

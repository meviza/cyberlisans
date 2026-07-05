'use client';

import * as React from 'react';
import { Loader2 } from 'lucide-react';
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@cyberlisans/ui/atoms';
import { useDeleteProduct } from '@/lib/hooks/use-seller-product-mutations';
import type { SellerProduct } from '@/lib/api/seller-products';

export interface ProductDeleteDialogProps {
  product: SellerProduct | null;
  onClose: () => void;
}

export function ProductDeleteDialog({ product, onClose }: ProductDeleteDialogProps) {
  const open = Boolean(product);
  const { run, submitting: deleting, error } = useDeleteProduct();
  const handleConfirm = async () => {
    if (!product) return;
    await run(product.id);
    onClose();
  };
  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) onClose();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ürünü silmek istediğine emin misin?</DialogTitle>
          <DialogDescription>
            Bu işlem geri alınamaz. “{product?.title}” kalıcı olarak silinir.
          </DialogDescription>
        </DialogHeader>
        {error && (
          <div className="rounded-md border border-cyber-magenta/40 bg-cyber-magenta/10 px-3 py-2 text-xs text-cyber-magenta">
            {error}
          </div>
        )}
        <div className="flex justify-end gap-2">
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={deleting}>
              İptal
            </Button>
          </DialogClose>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={deleting}
            className="bg-cyber-magenta text-white hover:bg-cyber-magenta/80"
          >
            {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Evet, Sil
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

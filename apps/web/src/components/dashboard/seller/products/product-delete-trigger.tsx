'use client';

import * as React from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogClose,
} from '@cyberlisans/ui/atoms';
import { useDeleteProduct } from '@/lib/hooks/use-seller-product-mutations';

export interface ProductDeleteTriggerProps {
  productId: string;
  productTitle: string;
  onDeleted: () => void;
  disabled?: boolean;
}

export function ProductDeleteTrigger({
  productId,
  productTitle,
  onDeleted,
  disabled,
}: ProductDeleteTriggerProps) {
  const [open, setOpen] = React.useState(false);
  const { run, submitting: deleting, error } = useDeleteProduct();
  const handleConfirm = async () => {
    await run(productId);
    setOpen(false);
    onDeleted();
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="border-cyber-magenta/40 bg-cyber-magenta/10 text-cyber-magenta hover:border-cyber-magenta"
          disabled={disabled}
        >
          <Trash2 className="h-4 w-4" /> Ürünü Sil
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ürünü silmek istediğine emin misin?</DialogTitle>
          <DialogDescription>
            Bu işlem geri alınamaz. “{productTitle}” kalıcı olarak silinir.
          </DialogDescription>
        </DialogHeader>
        {error && (
          <div className="flex items-start gap-2 rounded-md border border-cyber-magenta/40 bg-cyber-magenta/10 px-3 py-2 text-xs text-cyber-magenta">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
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
            Evet, Sil
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

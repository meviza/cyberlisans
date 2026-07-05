'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@cyberlisans/ui/atoms';
import { ProductForm } from '@/components/dashboard/seller/products/product-form';

export default function NewSellerProductPage() {
  const router = useRouter();
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-orbitron text-2xl font-black text-white">Yeni Ürün</h1>
          <p className="text-sm text-white/60">
            Yeni ürün oluştur; admin onayından sonra satışa açılır.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/dashboard/seller/products')}
        >
          <ArrowLeft className="h-4 w-4" /> Geri
        </Button>
      </div>
      <ProductForm submitLabel="Ürünü Kaydet ve Onaya Gönder" />
    </div>
  );
}

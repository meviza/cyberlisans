import * as React from 'react';
import { Card, CardContent } from '@cyberlisans/ui/atoms';
import { Store } from 'lucide-react';

export function SellerProductsGrid() {
  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="mb-4 text-lg font-bold text-white">Mağaza Ürünleri</h2>
        <div className="rounded-md border border-dashed border-brand-accent/30 bg-brand-bg/40 px-6 py-12 text-center">
          <Store className="mx-auto mb-3 h-10 w-10 text-white/40" />
          <p className="text-sm text-white/60">
            Bu satıcının ürünleri yakında burada listelenecek.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

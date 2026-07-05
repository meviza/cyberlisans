'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Save, Loader2, AlertTriangle } from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@cyberlisans/ui/atoms';
import { useUpdateProduct } from '@/lib/hooks/use-seller-product-mutations';
import type { CreateSellerProductInput, SellerProduct } from '@/lib/api/seller-products';
import { FormAlert } from '@/components/dashboard/seller/form-alert';
import { ProductFormFields } from './product-form-fields';
import { ProductImagesInput } from './product-images-input';
import { ProductKeysInput } from './product-keys-input';
import { ProductStatusBadge } from './product-status-badge';
import { ProductDeleteTrigger } from './product-delete-trigger';
import {
  DEFAULT_CATEGORIES,
  DEFAULT_BRANDS,
  slugify,
  type CategoryOption,
} from './product-options';

export interface ProductEditFormProps {
  product: SellerProduct;
  categories?: CategoryOption[];
  brands?: CategoryOption[];
}

export function ProductEditForm({ product, categories, brands }: ProductEditFormProps) {
  const router = useRouter();
  const { run, submitting, error } = useUpdateProduct(product.id);
  const [title, setTitle] = React.useState(product.title);
  const [slug, setSlug] = React.useState(product.slug);
  const [description, setDescription] = React.useState(product.description);
  const [price, setPrice] = React.useState(String(product.price));
  const [category, setCategory] = React.useState(product.category);
  const [brand, setBrand] = React.useState(product.brand);
  const [images, setImages] = React.useState<string[]>(product.images ?? []);
  const [stockKeys, setStockKeys] = React.useState('');
  const [validation, setValidation] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidation(null);
    const numPrice = Number(price);
    if (!title || !slug || !category || !brand)
      return setValidation('Tüm zorunlu alanları doldur.');
    if (!Number.isFinite(numPrice) || numPrice <= 0) return setValidation('Geçerli bir fiyat gir.');
    const keys = stockKeys
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    const payload: Partial<CreateSellerProductInput> = {
      title,
      slug,
      description,
      price: numPrice,
      currency: 'TRY',
      category,
      brand,
      images,
      ...(keys.length > 0 ? { stockKeys: keys } : {}),
    };
    await run(payload);
  };

  const cats = categories ?? DEFAULT_CATEGORIES;
  const bs = brands ?? DEFAULT_BRANDS;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="text-base text-white">{product.title}</CardTitle>
            <ProductStatusBadge status={product.status} />
          </div>
          {product.rejectionReason && product.status === 'REJECTED' && (
            <div className="mt-2 flex items-start gap-2 rounded-md border border-cyber-magenta/40 bg-cyber-magenta/10 px-3 py-2 text-xs text-cyber-magenta">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>{product.rejectionReason}</span>
            </div>
          )}
        </CardHeader>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        <FormAlert error={error ?? validation} success={null} />
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-white">Ürün Bilgileri</CardTitle>
          </CardHeader>
          <CardContent>
            <ProductFormFields
              title={title}
              slug={slug}
              description={description}
              price={price}
              category={category}
              brand={brand}
              disabled={submitting}
              categories={cats}
              brands={bs}
              onTitleChange={(v) => {
                setTitle(v);
                if (slug === slugify(product.title)) setSlug(slugify(v));
              }}
              onSlugChange={setSlug}
              onDescriptionChange={setDescription}
              onPriceChange={setPrice}
              onCategoryChange={setCategory}
              onBrandChange={setBrand}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-white">Görseller</CardTitle>
          </CardHeader>
          <CardContent>
            <ProductImagesInput value={images} disabled={submitting} onChange={setImages} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-white">Stok Ekle (opsiyonel)</CardTitle>
          </CardHeader>
          <CardContent>
            <ProductKeysInput
              value={stockKeys}
              disabled={submitting}
              onChange={setStockKeys}
              hint="Boş bırakırsan mevcut stok değişmez. Yeni anahtar eklemek için doldur."
            />
          </CardContent>
        </Card>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <ProductDeleteTrigger
            productId={product.id}
            productTitle={product.title}
            disabled={submitting}
            onDeleted={() => router.push('/dashboard/seller/products')}
          />
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={submitting}
            >
              Geri
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {submitting ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

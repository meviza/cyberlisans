'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Save, Loader2, Package, Image as ImageIcon, KeyRound } from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@cyberlisans/ui/atoms';
import { useCreateProduct } from '@/lib/hooks/use-seller-product-mutations';
import type { CreateSellerProductInput } from '@/lib/api/seller-products';
import { FormAlert } from '@/components/dashboard/seller/form-alert';
import { ProductFormFields } from './product-form-fields';
import { ProductImagesInput } from './product-images-input';
import { ProductKeysInput } from './product-keys-input';
import {
  DEFAULT_CATEGORIES,
  DEFAULT_BRANDS,
  slugify,
  type CategoryOption,
} from './product-options';

export interface ProductFormProps {
  categories?: CategoryOption[];
  brands?: CategoryOption[];
  initial?: Partial<CreateSellerProductInput>;
  onSubmit?: (data: CreateSellerProductInput) => Promise<void>;
  submitLabel?: string;
  redirectTo?: string;
}

export function ProductForm({
  categories = DEFAULT_CATEGORIES,
  brands = DEFAULT_BRANDS,
  initial,
  onSubmit,
  submitLabel = 'Ürünü Kaydet',
  redirectTo = '/dashboard/seller/products',
}: ProductFormProps) {
  const router = useRouter();
  const { run, submitting, error } = useCreateProduct();
  const [title, setTitle] = React.useState(initial?.title ?? '');
  const [slug, setSlug] = React.useState(initial?.slug ?? '');
  const [slugTouched, setSlugTouched] = React.useState(Boolean(initial?.slug));
  const [description, setDescription] = React.useState(initial?.description ?? '');
  const [price, setPrice] = React.useState(initial?.price != null ? String(initial.price) : '');
  const [category, setCategory] = React.useState(initial?.category ?? '');
  const [brand, setBrand] = React.useState(initial?.brand ?? '');
  const [images, setImages] = React.useState<string[]>(initial?.images ?? []);
  const [stockKeys, setStockKeys] = React.useState((initial?.stockKeys ?? []).join('\n'));
  const [validation, setValidation] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!slugTouched && title) setSlug(slugify(title));
  }, [title, slugTouched]);

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
    if (keys.length === 0) return setValidation('En az bir stok anahtarı ekle.');
    const payload: CreateSellerProductInput = {
      title,
      slug,
      description,
      price: numPrice,
      currency: 'TRY',
      category,
      brand,
      images,
      stockKeys: keys,
    };
    if (onSubmit) await onSubmit(payload);
    else {
      await run(payload);
      router.push(redirectTo);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FormAlert error={error ?? validation} success={null} />
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base text-white">
            <Package className="h-4 w-4 text-cyber-cyan" /> Ürün Bilgileri
          </CardTitle>
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
            categories={categories}
            brands={brands}
            onTitleChange={setTitle}
            onSlugChange={(v) => {
              setSlugTouched(true);
              setSlug(v);
            }}
            onDescriptionChange={setDescription}
            onPriceChange={setPrice}
            onCategoryChange={setCategory}
            onBrandChange={setBrand}
          />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base text-white">
            <ImageIcon className="h-4 w-4 text-cyber-cyan" /> Görseller
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ProductImagesInput value={images} disabled={submitting} onChange={setImages} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base text-white">
            <KeyRound className="h-4 w-4 text-cyber-cyan" /> Stok Anahtarları
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ProductKeysInput
            value={stockKeys}
            disabled={submitting}
            onChange={setStockKeys}
            hint="Her satıra bir anahtar. Admin onayından sonra satışa açılır."
          />
        </CardContent>
      </Card>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={submitting}>
          İptal
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {submitting ? 'Kaydediliyor...' : submitLabel}
        </Button>
      </div>
    </form>
  );
}

'use client';

import * as React from 'react';
import { Input, Label, Select } from '@cyberlisans/ui/atoms';
import type { CategoryOption } from './product-options';

export type { CategoryOption };

export interface ProductFormFieldsProps {
  title: string;
  slug: string;
  description: string;
  price: string;
  category: string;
  brand: string;
  disabled: boolean;
  categories: CategoryOption[];
  brands: CategoryOption[];
  onTitleChange: (v: string) => void;
  onSlugChange: (v: string) => void;
  onDescriptionChange: (v: string) => void;
  onPriceChange: (v: string) => void;
  onCategoryChange: (v: string) => void;
  onBrandChange: (v: string) => void;
}

export function ProductFormFields(props: ProductFormFieldsProps) {
  const {
    title,
    slug,
    description,
    price,
    category,
    brand,
    disabled,
    categories,
    brands,
    onTitleChange,
    onSlugChange,
    onDescriptionChange,
    onPriceChange,
    onCategoryChange,
    onBrandChange,
  } = props;
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="space-y-1.5 sm:col-span-2">
        <Label htmlFor="title">Ürün Adı</Label>
        <Input
          id="title"
          value={title}
          disabled={disabled}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Steam Cüzdan 50 TL"
          required
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="slug">Slug (URL)</Label>
        <Input
          id="slug"
          value={slug}
          disabled={disabled}
          onChange={(e) => onSlugChange(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
          placeholder="steam-cuzdan-50-tl"
          required
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="price">Fiyat (TRY)</Label>
        <Input
          id="price"
          type="number"
          min="0"
          step="0.01"
          value={price}
          disabled={disabled}
          onChange={(e) => onPriceChange(e.target.value)}
          placeholder="299.90"
          required
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="category">Kategori</Label>
        <Select
          id="category"
          value={category}
          disabled={disabled}
          onChange={(e) => onCategoryChange(e.target.value)}
          options={[{ value: '', label: 'Seç...' }, ...categories]}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="brand">Marka</Label>
        <Select
          id="brand"
          value={brand}
          disabled={disabled}
          onChange={(e) => onBrandChange(e.target.value)}
          options={[{ value: '', label: 'Seç...' }, ...brands]}
        />
      </div>
      <div className="space-y-1.5 sm:col-span-2">
        <Label htmlFor="description">Açıklama</Label>
        <textarea
          id="description"
          rows={4}
          disabled={disabled}
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Ürün detayları, teslimat süresi, bölge bilgisi..."
          className="flex w-full rounded-md border border-cyber-cyan/30 bg-cyber-bg/50 px-3 py-2 text-sm text-cyber-text placeholder:text-cyber-text-dim focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyber-cyan/50 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>
    </div>
  );
}

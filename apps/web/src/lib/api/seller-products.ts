import { apiFetch } from '@/lib/api-client';

export type SellerProductStatus = 'DRAFT' | 'PENDING_REVIEW' | 'ACTIVE' | 'REJECTED' | 'ARCHIVED';

export interface SellerProduct {
  id: string;
  slug: string;
  title: string;
  description: string;
  price: number;
  currency: 'TRY';
  category: string;
  brand: string;
  images: string[];
  stock: number;
  status: SellerProductStatus;
  rejectionReason?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SellerProductFilters {
  status?: SellerProductStatus | 'ALL';
}

export interface CreateSellerProductInput {
  title: string;
  slug: string;
  description: string;
  price: number;
  currency: 'TRY';
  category: string;
  brand: string;
  images: string[];
  stockKeys: string[];
}

export type UpdateSellerProductInput = Partial<CreateSellerProductInput>;

export interface SellerProductsResponse {
  items: SellerProduct[];
  totals: {
    total: number;
    active: number;
    pending: number;
    rejected: number;
  };
}

export async function listSellerProducts(
  filters: SellerProductFilters = {},
): Promise<SellerProductsResponse> {
  const params = new URLSearchParams();
  if (filters.status && filters.status !== 'ALL') params.set('status', filters.status);
  const qs = params.toString();
  return apiFetch<SellerProductsResponse>(`/seller/products${qs ? `?${qs}` : ''}`);
}

export async function getSellerProduct(id: string): Promise<SellerProduct> {
  return apiFetch<SellerProduct>(`/seller/products/${id}`);
}

export async function createProduct(input: CreateSellerProductInput): Promise<SellerProduct> {
  return apiFetch<SellerProduct>('/seller/products', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function updateProduct(
  id: string,
  input: UpdateSellerProductInput,
): Promise<SellerProduct> {
  return apiFetch<SellerProduct>(`/seller/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  });
}

export async function deleteProduct(id: string): Promise<{ ok: true }> {
  return apiFetch<{ ok: true }>(`/seller/products/${id}`, { method: 'DELETE' });
}

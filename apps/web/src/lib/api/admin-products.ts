export type ProductReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface ProductSellerSummary {
  id: string;
  name: string;
  avatarUrl: string | null;
  rating: number;
  totalSales: number;
  kycStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
}

export interface PendingProduct {
  id: string;
  name: string;
  imageUrl: string;
  price: number;
  currency: 'TRY' | 'USD' | 'EUR' | 'USDT';
  stock: number;
  submittedAt: string;
  status: ProductReviewStatus;
  seller: ProductSellerSummary;
}

export interface ProductDetail extends PendingProduct {
  description: string;
  images: string[];
  category: string;
  brand: string;
  rejectionReason: string | null;
  reviewedAt: string | null;
  reviewedBy: string | null;
}

export interface PendingProductsResponse {
  items: PendingProduct[];
  totals: {
    pending: number;
    approvedToday: number;
    rejectedToday: number;
  };
}

export interface ProductFilters {
  status?: 'ALL' | ProductReviewStatus;
}

const INTERNAL = '/api/admin/products';

export async function listPendingProducts(
  filters: ProductFilters = {},
): Promise<PendingProductsResponse> {
  const params = new URLSearchParams();
  if (filters.status && filters.status !== 'ALL') params.set('status', filters.status);
  const qs = params.toString();
  const res = await fetch(`${INTERNAL}${qs ? `?${qs}` : ''}`, { credentials: 'include' });
  if (!res.ok) throw new Error(`Failed to load products (${res.status})`);
  return res.json();
}

export async function getProductForReview(id: string): Promise<ProductDetail> {
  const res = await fetch(`${INTERNAL}/${id}`, { credentials: 'include' });
  if (!res.ok) throw new Error(`Failed to load product (${res.status})`);
  return res.json();
}

export async function approveProduct(id: string): Promise<{ id: string; status: 'APPROVED' }> {
  const res = await fetch(`${INTERNAL}/${id}/approve`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  if (!res.ok) throw new Error(`Approve failed (${res.status})`);
  return res.json();
}

export async function rejectProduct(
  id: string,
  reason: string,
): Promise<{ id: string; status: 'REJECTED'; reason: string }> {
  const res = await fetch(`${INTERNAL}/${id}/reject`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reason }),
  });
  if (!res.ok) throw new Error(`Reject failed (${res.status})`);
  return res.json();
}

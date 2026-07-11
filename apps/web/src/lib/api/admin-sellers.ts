import { apiFetch } from '@/lib/api-client';

export type AdminSellerStatus = 'PENDING' | 'APPROVED' | 'SUSPENDED' | 'REJECTED';

export interface AdminSellerUser {
  id: string;
  email: string;
  username: string | null;
  displayName?: string | null;
}

export interface AdminSeller {
  id: string;
  userId: string;
  slug: string;
  companyName: string;
  taxId: string;
  taxOffice?: string | null;
  address?: string | null;
  phone?: string | null;
  websiteUrl?: string | null;
  logoUrl?: string | null;
  bio?: string | null;
  commissionRate: number;
  balance: number;
  status: AdminSellerStatus;
  kycStatus: string;
  approvedById?: string | null;
  approvedAt?: string | null;
  rejectionReason?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt?: string;
  user?: AdminSellerUser | null;
}

export interface AdminSellerStatusCounts {
  PENDING: number;
  APPROVED: number;
  SUSPENDED: number;
  REJECTED: number;
  total: number;
}

export interface ListAdminSellersParams {
  status?: AdminSellerStatus | 'ALL';
  search?: string;
  page?: number;
  limit?: number;
}

export async function fetchSellerStatusCounts(): Promise<AdminSellerStatusCounts> {
  return apiFetch<AdminSellerStatusCounts>('/admin/sellers/stats');
}

export async function fetchAdminSellers(
  params: ListAdminSellersParams = {},
): Promise<{ items: AdminSeller[]; total: number }> {
  const q = new URLSearchParams();
  q.set('page', String(params.page ?? 1));
  q.set('limit', String(params.limit ?? 50));
  if (params.status && params.status !== 'ALL') q.set('status', params.status);
  if (params.search?.trim()) q.set('search', params.search.trim());
  return apiFetch<{ items: AdminSeller[]; total: number }>(`/admin/sellers?${q.toString()}`);
}

export async function fetchAdminSeller(id: string): Promise<AdminSeller> {
  return apiFetch<AdminSeller>(`/admin/sellers/${id}`);
}

export async function approveSeller(id: string, notes?: string): Promise<AdminSeller> {
  return apiFetch<AdminSeller>(`/admin/sellers/${id}/approve`, {
    method: 'POST',
    body: JSON.stringify({ notes: notes?.trim() || undefined }),
  });
}

export async function rejectSeller(id: string, reason: string): Promise<AdminSeller> {
  return apiFetch<AdminSeller>(`/admin/sellers/${id}/reject`, {
    method: 'POST',
    body: JSON.stringify({ reason: reason.trim() }),
  });
}

export async function suspendSeller(id: string, reason: string): Promise<AdminSeller> {
  return apiFetch<AdminSeller>(`/admin/sellers/${id}/suspend`, {
    method: 'POST',
    body: JSON.stringify({ reason: reason.trim() }),
  });
}

export async function reactivateSeller(id: string): Promise<AdminSeller> {
  return apiFetch<AdminSeller>(`/admin/sellers/${id}/reactivate`, {
    method: 'POST',
    body: JSON.stringify({}),
  });
}

export const SELLER_STATUS_LABEL: Record<AdminSellerStatus, string> = {
  PENDING: 'Bekliyor',
  APPROVED: 'Onaylı',
  SUSPENDED: 'Askıda',
  REJECTED: 'Reddedildi',
};

export const SELLER_STATUS_VARIANT: Record<
  AdminSellerStatus,
  'warning' | 'success' | 'danger' | 'default'
> = {
  PENDING: 'warning',
  APPROVED: 'success',
  SUSPENDED: 'danger',
  REJECTED: 'default',
};

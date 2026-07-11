import type { RequestMeta } from './auth';

export type SellerStatus = 'PENDING' | 'APPROVED' | 'SUSPENDED' | 'REJECTED';
export type KycStatus = 'PENDING' | 'VERIFIED' | 'REJECTED' | 'EXPIRED';

export interface SellerEntity {
  id: string;
  userId: string;
  slug: string;
  companyName: string;
  taxId: string;
  taxOffice: string | null;
  address: string | null;
  phone: string | null;
  websiteUrl: string | null;
  logoUrl: string | null;
  bio: string | null;
  commissionRate: number;
  balance: number;
  status: SellerStatus;
  kycStatus: KycStatus;
  approvedById: string | null;
  approvedAt: Date | null;
  rejectionReason: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApplySellerInput {
  userId: string;
  companyName: string;
  taxId: string;
  taxOffice?: string | null;
  address?: string | null;
  phone?: string | null;
  websiteUrl?: string | null;
  bio?: string | null;
  slug: string;
  logoUrl?: string | null;
}

export interface ApproveSellerInput {
  sellerId: string;
  adminId: string;
  notes?: string | null;
  meta: RequestMeta;
}

export interface RejectSellerInput {
  sellerId: string;
  adminId: string;
  reason: string;
  meta: RequestMeta;
}

export interface SuspendSellerInput {
  sellerId: string;
  adminId: string;
  reason: string;
  meta: RequestMeta;
}

export interface ReactivateSellerInput {
  sellerId: string;
  adminId: string;
  meta: RequestMeta;
}

export interface ListSellersFilter {
  status?: SellerStatus;
  kycStatus?: KycStatus;
  search?: string;
  page: number;
  limit: number;
}

export interface SellerUserSummary {
  id: string;
  email: string;
  username: string | null;
  displayName?: string | null;
}

export interface SellerOutput {
  id: string;
  userId: string;
  slug: string;
  companyName: string;
  taxId: string;
  taxOffice: string | null;
  address: string | null;
  phone: string | null;
  websiteUrl: string | null;
  logoUrl: string | null;
  bio: string | null;
  commissionRate: number;
  balance: number;
  status: SellerStatus;
  kycStatus: KycStatus;
  approvedById: string | null;
  approvedAt: Date | null;
  rejectionReason: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  /** Populated on admin list/detail when available */
  user?: SellerUserSummary | null;
}

export interface SellerStatusCounts {
  PENDING: number;
  APPROVED: number;
  SUSPENDED: number;
  REJECTED: number;
  total: number;
}

export interface SellerRepositoryPort {
  findByUserId(userId: string): Promise<SellerEntity | null>;
  findById(id: string): Promise<SellerEntity | null>;
  findBySlug(slug: string): Promise<SellerEntity | null>;
  create(
    data: ApplySellerInput & { status: SellerStatus; kycStatus: KycStatus },
  ): Promise<SellerEntity>;
  update(id: string, data: Partial<SellerEntity>): Promise<SellerEntity>;
  list(filter: ListSellersFilter): Promise<{ items: SellerEntity[]; total: number }>;
  countByStatus(): Promise<SellerStatusCounts>;
  approve(id: string, adminId: string, notes?: string | null): Promise<SellerEntity>;
  reject(id: string, adminId: string, reason: string): Promise<SellerEntity>;
  suspend(id: string, adminId: string, reason: string): Promise<SellerEntity>;
  reactivate(id: string, adminId: string): Promise<SellerEntity>;
}

export interface ApplySellerDeps {
  sellers: SellerRepositoryPort;
  audit: import('./repositories').IAuditRepository;
}

export interface ApproveSellerDeps {
  sellers: SellerRepositoryPort;
  audit: import('./repositories').IAuditRepository;
}

export interface RejectSellerDeps {
  sellers: SellerRepositoryPort;
  audit: import('./repositories').IAuditRepository;
}

export interface SuspendSellerDeps {
  sellers: SellerRepositoryPort;
  audit: import('./repositories').IAuditRepository;
}

export interface ReactivateSellerDeps {
  sellers: SellerRepositoryPort;
  audit: import('./repositories').IAuditRepository;
}

export interface ListPendingSellersDeps {
  sellers: SellerRepositoryPort;
  audit: import('./repositories').IAuditRepository;
}

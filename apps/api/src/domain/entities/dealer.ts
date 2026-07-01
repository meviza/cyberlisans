export type DealerStatus = 'PENDING' | 'APPROVED' | 'SUSPENDED' | 'REJECTED';
export type DealerSaleStatus = 'PENDING' | 'SETTLED' | 'REFUNDED';
export type DealerPayoutStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'REJECTED';

export interface DealerProfileEntity {
  id: string;
  userId: string;
  companyName: string;
  taxId: string;
  taxOffice: string | null;
  address: string | null;
  phone: string | null;
  websiteUrl: string | null;
  logoUrl: string | null;
  commissionRate: number;
  balance: number;
  status: DealerStatus;
  approvedById: string | null;
  approvedAt: Date | null;
  rejectionReason: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface DealerLinkEntity {
  id: string;
  dealerId: string;
  code: string;
  productId: string | null;
  discountPercent: number;
  maxUses: number | null;
  currentUses: number;
  clicks: number;
  isActive: boolean;
  expiresAt: Date | null;
  createdAt: Date;
}

export interface DealerSaleEntity {
  id: string;
  dealerId: string;
  orderId: string;
  linkId: string | null;
  grossAmount: number;
  discountAmount: number;
  commissionAmount: number;
  netAmount: number;
  status: DealerSaleStatus;
  settledAt: Date | null;
  createdAt: Date;
}

export interface DealerPayoutEntity {
  id: string;
  dealerId: string;
  userId: string;
  amount: number;
  currency: 'TRY' | 'USD' | 'EUR' | 'USDT';
  method: string;
  destination: string;
  status: DealerPayoutStatus;
  processedById: string | null;
  processedAt: Date | null;
  rejectionReason: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type DealerStatus = 'PENDING' | 'APPROVED' | 'SUSPENDED' | 'REJECTED';
export type DealerSaleStatus = 'PENDING' | 'SETTLED' | 'REFUNDED';
export type DealerPayoutStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'REJECTED';

export interface DealerProfile {
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
  approvedAt: string | null;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DealerLink {
  id: string;
  dealerId: string;
  code: string;
  productId: string | null;
  productName: string | null;
  productSlug: string | null;
  discountPercent: number;
  maxUses: number | null;
  currentUses: number;
  clicks: number;
  isActive: boolean;
  expiresAt: string | null;
  createdAt: string;
}

export interface DealerSale {
  id: string;
  dealerId: string;
  orderId: string;
  linkId: string | null;
  linkCode: string | null;
  productName: string | null;
  orderNumber?: string | null;
  currency?: 'TRY' | 'USD' | 'EUR' | 'USDT';
  grossAmount: number;
  discountAmount: number;
  commissionAmount: number;
  netAmount: number;
  status: DealerSaleStatus;
  settledAt: string | null;
  createdAt: string;
}

export interface DealerCommission {
  id: string;
  saleId: string;
  orderId: string;
  amount: number;
  status: DealerSaleStatus;
  settledAt: string | null;
  createdAt: string;
}

export interface DealerPayout {
  id: string;
  amount: number;
  currency: 'TRY' | 'USD' | 'EUR' | 'USDT';
  method: string;
  destination: string;
  status: DealerPayoutStatus;
  processedAt: string | null;
  rejectionReason: string | null;
  notes: string | null;
  createdAt: string;
}

export interface ProductListItem {
  id: string;
  name?: string;
  title?: string;
}

export interface DealerStats {
  totalSales: number;
  totalGross: number;
  totalCommission: number;
  balance: number;
  pendingCommission: number;
  settledCommission: number;
  salesTrend: Array<{ date: string; amount: number; count: number }>;
  commissionTrend: Array<{ date: string; amount: number }>;
  topProducts: Array<{ productId: string; productName: string; count: number; gross: number }>;
  recentSales: DealerSale[];
  activeLinks: DealerLink[];
}

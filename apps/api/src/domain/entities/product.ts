import type { Currency } from './wallet';

export type DeliveryType = 'KEY' | 'DOWNLOAD' | 'API_CREDITS' | 'MANUAL';
export type OrderStatus = 'PENDING' | 'PAID' | 'FULFILLED' | 'CANCELLED' | 'REFUNDED' | 'FAILED';
export type PaymentMethod =
  | 'PAYTR'
  | 'PAPARA'
  | 'NOWPAYMENTS'
  | 'STRIPE'
  | 'BANK_TRANSFER'
  | 'WALLET';

export interface CategoryEntity {
  id: string;
  slug: string;
  name: string;
  nameEn: string | null;
  nameDe: string | null;
  nameAr: string | null;
  nameRu: string | null;
  icon: string | null;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface BrandEntity {
  id: string;
  slug: string;
  name: string;
  logoUrl: string | null;
  websiteUrl: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductEntity {
  id: string;
  categoryId: string;
  brandId: string | null;
  slug: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  modelUrl: string | null;
  priceTry: number;
  priceUsd: number;
  priceEur: number;
  priceUsdt: number;
  stock: number;
  deliveryType: DeliveryType;
  isActive: boolean;
  isFeatured: boolean;
  tags: string[];
  metadata: Record<string, unknown> | null;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductKeyEntity {
  id: string;
  productId: string;
  code: string;
  isUsed: boolean;
  usedById: string | null;
  usedAt: Date | null;
  reservedAt: Date | null;
  reservedFor: string | null;
  createdAt: Date;
}

export interface OrderItemEntity {
  id: string;
  orderId: string;
  productId: string;
  productKeyId: string | null;
  quantity: number;
  qty?: number;
  unitPrice: number;
  totalPrice: number;
  productTitle?: string;
  productSlug?: string;
  productBrand?: string | null;
  productKeyCode?: string | null;
}

export interface OrderEntity {
  id: string;
  orderNumber: string;
  userId: string;
  totalAmount: number;
  currency: Currency;
  status: OrderStatus;
  paymentMethod: PaymentMethod | null;
  refCode: string | null;
  notes: string | null;
  paidAt: Date | null;
  fulfilledAt: Date | null;
  cancelledAt: Date | null;
  refundedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  items?: OrderItemEntity[];
}

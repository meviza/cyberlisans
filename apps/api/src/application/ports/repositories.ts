import type { SessionEntity } from '../../domain/entities/session';
import type { UserEntity, UserLocale, UserCurrency, UserStatus } from '../../domain/entities/user';

export interface CreateUserInput {
  email: string;
  username: string;
  displayName?: string;
  passwordHash: string;
  locale: UserLocale;
  currency: UserCurrency;
  isAdult: boolean;
  marketingOptIn: boolean;
  referralCode: string;
  referredById: string | null;
}

export interface IUserRepository {
  findById(id: string): Promise<UserEntity | null>;
  findByEmail(email: string): Promise<UserEntity | null>;
  findByUsername(username: string): Promise<UserEntity | null>;
  findByReferralCode(code: string): Promise<UserEntity | null>;
  create(data: CreateUserInput): Promise<UserEntity>;
  update(id: string, data: Partial<UserEntity>): Promise<UserEntity>;
  setEmailVerified(id: string): Promise<void>;
  setTwoFactor(id: string, secret: string | null, enabled: boolean): Promise<void>;
  setLastLogin(id: string, date: Date): Promise<void>;
  setPassword(id: string, hash: string): Promise<void>;
  setStatus(id: string, status: UserStatus): Promise<void>;
  getPasswordHash(id: string): Promise<string | null>;
}

export interface CreateSessionInput {
  userId: string;
  refreshToken: string;
  refreshTokenHash: string;
  userAgent?: string;
  ipAddress?: string;
  expiresAt: Date;
}

export interface ISessionRepository {
  create(data: CreateSessionInput): Promise<SessionEntity>;
  findByRefreshTokenHash(hash: string): Promise<SessionEntity | null>;
  deleteById(id: string): Promise<void>;
  deleteAllForUser(userId: string): Promise<void>;
  listForUser(userId: string): Promise<SessionEntity[]>;
}

export type AuditActionValue =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'LOGIN'
  | 'LOGOUT'
  | 'BALANCE_CHANGE'
  | 'STATUS_CHANGE'
  | 'ROLE_CHANGE'
  | 'SETTINGS_CHANGE';

export interface AuditLogInput {
  actorId: string | null;
  targetUserId?: string;
  action: AuditActionValue;
  targetType?: string;
  targetId?: string;
  payload?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

export interface IAuditRepository {
  log(data: AuditLogInput): Promise<void>;
}

export type ConsentTypeValue =
  | 'KVKK'
  | 'TERMS'
  | 'MARKETING'
  | 'COOKIES_ANALYTICS'
  | 'COOKIES_MARKETING';

export interface ConsentRecordInput {
  userId: string | null;
  email?: string;
  type: ConsentTypeValue;
  granted: boolean;
  documentVersion: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface IConsentRepository {
  record(data: ConsentRecordInput): Promise<void>;
}
import type {
  WalletEntity,
  WalletTransactionEntity,
  PaymentEntity,
  WalletTxType,
  Currency,
} from '../../domain/entities/wallet';
import type {
  ProductEntity,
  ProductKeyEntity,
  CategoryEntity,
  BrandEntity,
  OrderEntity,
  OrderItemEntity,
  OrderStatus,
  PaymentMethod,
  DeliveryType,
} from '../../domain/entities/product';
import type {
  DealerProfileEntity,
  DealerLinkEntity,
  DealerSaleEntity,
  DealerPayoutEntity,
  DealerStatus,
  DealerPayoutStatus,
  DealerSaleStatus,
} from '../../domain/entities/dealer';

export interface IWalletRepository {
  findByUserId(userId: string): Promise<WalletEntity | null>;
  findById(id: string): Promise<WalletEntity | null>;
  credit(input: {
    userId: string;
    currency: Currency;
    amount: number;
    type: WalletTxType;
    description?: string;
    referenceType?: string;
    referenceId?: string;
    metadata?: Record<string, unknown>;
  }): Promise<{ wallet: WalletEntity; transaction: WalletTransactionEntity }>;
  debit(input: {
    userId: string;
    currency: Currency;
    amount: number;
    type: WalletTxType;
    description?: string;
    referenceType?: string;
    referenceId?: string;
    metadata?: Record<string, unknown>;
  }): Promise<{ wallet: WalletEntity; transaction: WalletTransactionEntity }>;
  transfer(input: {
    fromUserId: string;
    toUserId: string;
    currency: Currency;
    amount: number;
    description?: string;
  }): Promise<void>;
  listTransactions(input: {
    userId: string;
    type?: WalletTxType;
    cursor?: string;
    limit: number;
  }): Promise<WalletTransactionEntity[]>;
  addLoyaltyCoins(userId: string, coins: number): Promise<WalletEntity>;
}

export interface IPaymentRepository {
  create(input: {
    userId: string;
    orderId?: string;
    provider: PaymentEntity['provider'];
    amount: number;
    currency: Currency;
    expiresAt?: Date;
    metadata?: Record<string, unknown>;
  }): Promise<PaymentEntity>;
  findById(id: string): Promise<PaymentEntity | null>;
  findByProviderRef(
    provider: PaymentEntity['provider'],
    providerRef: string,
  ): Promise<PaymentEntity | null>;
  updateStatus(
    id: string,
    status: PaymentEntity['status'],
    extras?: { providerRef?: string; webhookPayload?: Record<string, unknown>; paidAt?: Date },
  ): Promise<PaymentEntity>;
  listForUser(userId: string, limit: number, cursor?: string): Promise<PaymentEntity[]>;
  listPending(limit: number): Promise<PaymentEntity[]>;
}

export interface IOrderRepositoryForWallet {
  findById(orderId: string): Promise<{
    id: string;
    userId: string;
    totalAmount: number;
    currency: Currency;
    status: string;
  } | null>;
  markPaid(orderId: string, paymentId: string): Promise<void>;
}

export interface ProductFilter {
  categoryId?: string;
  categorySlug?: string;
  brandId?: string;
  brandSlug?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  currency?: Currency;
  tags?: string[];
}

export type ProductSort = 'newest' | 'oldest' | 'price_asc' | 'price_desc' | 'popular' | 'featured';

export interface ProductListOptions {
  filter: ProductFilter;
  sort: ProductSort;
  page: number;
  limit: number;
}

export interface CreateProductInput {
  categoryId: string;
  brandId?: string | null;
  slug: string;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  modelUrl?: string | null;
  priceTry: number;
  priceUsd: number;
  priceEur: number;
  priceUsdt: number;
  stock: number;
  deliveryType: DeliveryType;
  isActive?: boolean;
  isFeatured?: boolean;
  tags?: string[];
  metadata?: Record<string, unknown> | null;
  sortOrder?: number;
}

export type UpdateProductInput = Partial<CreateProductInput>;

export interface IProductRepository {
  list(opts: ProductListOptions): Promise<{ items: ProductEntity[]; total: number }>;
  findById(id: string): Promise<ProductEntity | null>;
  findBySlug(slug: string): Promise<ProductEntity | null>;
  findByIdWithRelations(id: string): Promise<ProductEntity | null>;
  findBySlugWithRelations(slug: string): Promise<ProductEntity | null>;
  create(data: CreateProductInput): Promise<ProductEntity>;
  update(id: string, data: UpdateProductInput): Promise<ProductEntity>;
  softDelete(id: string): Promise<ProductEntity>;
  countActive(): Promise<number>;
  getFeatured(limit: number): Promise<ProductEntity[]>;
  decrementStock(productId: string, qty: number): Promise<void>;
  incrementStock(productId: string, qty: number): Promise<void>;
}

export interface IProductKeyRepository {
  listByProduct(
    productId: string,
    options: { availableOnly?: boolean; page: number; limit: number },
  ): Promise<{ items: ProductKeyEntity[]; total: number }>;
  reserve(productId: string, qty: number, userId: string): Promise<ProductKeyEntity[]>;
  markUsedByOrderItem(orderItemId: string, userId: string): Promise<void>;
  returnKeysForOrderItem(orderItemId: string): Promise<void>;
  countAvailable(productId: string): Promise<number>;
  bulkCreate(productId: string, codes: string[]): Promise<number>;
  deleteById(id: string): Promise<void>;
  findById(id: string): Promise<ProductKeyEntity | null>;
}

export interface ICategoryRepository {
  list(filter: { isActive?: boolean }): Promise<CategoryEntity[]>;
  findById(id: string): Promise<CategoryEntity | null>;
  findBySlug(slug: string): Promise<CategoryEntity | null>;
  create(data: {
    slug: string;
    name: string;
    nameEn?: string | null;
    nameDe?: string | null;
    nameAr?: string | null;
    nameRu?: string | null;
    icon?: string | null;
    description?: string | null;
    sortOrder?: number;
    isActive?: boolean;
  }): Promise<CategoryEntity>;
  update(id: string, data: Partial<CategoryEntity>): Promise<CategoryEntity>;
  delete(id: string): Promise<void>;
}

export interface IBrandRepository {
  list(filter: { isActive?: boolean }): Promise<BrandEntity[]>;
  findById(id: string): Promise<BrandEntity | null>;
  findBySlug(slug: string): Promise<BrandEntity | null>;
  create(data: {
    slug: string;
    name: string;
    logoUrl?: string | null;
    websiteUrl?: string | null;
    isActive?: boolean;
  }): Promise<BrandEntity>;
  update(id: string, data: Partial<BrandEntity>): Promise<BrandEntity>;
  delete(id: string): Promise<void>;
}

export interface CreateOrderItemInput {
  productId: string;
  productKeyId?: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface CreateOrderInput {
  userId: string;
  totalAmount: number;
  currency: Currency;
  paymentMethod: PaymentMethod;
  notes?: string | null;
  items: CreateOrderItemInput[];
}

export interface IOrderRepository {
  createWithItems(data: CreateOrderInput): Promise<OrderEntity>;
  findById(orderId: string, withItems?: boolean): Promise<OrderEntity | null>;
  findByIdForUser(
    orderId: string,
    userId: string,
    withItems?: boolean,
  ): Promise<OrderEntity | null>;
  findByUserId(
    userId: string,
    options: { status?: OrderStatus; page: number; limit: number },
  ): Promise<{
    items: OrderEntity[];
    total: number;
  }>;
  findByUserIdWithItems(
    userId: string,
    page: number,
    limit: number,
  ): Promise<{
    items: OrderEntity[];
    total: number;
  }>;
  listAll(options: { status?: OrderStatus; page: number; limit: number }): Promise<{
    items: OrderEntity[];
    total: number;
  }>;
  updateStatus(
    orderId: string,
    status: OrderStatus,
    extras?: { paidAt?: Date; fulfilledAt?: Date; cancelledAt?: Date; refundedAt?: Date },
  ): Promise<OrderEntity>;
  markPaid(orderId: string, paymentId: string): Promise<void>;
  markFulfilled(orderId: string): Promise<void>;
}

export interface CreateDealerInput {
  userId: string;
  companyName: string;
  taxId: string;
  taxOffice?: string | null;
  address?: string | null;
  phone?: string | null;
  websiteUrl?: string | null;
  logoUrl?: string | null;
  commissionRate?: number;
}

export interface DealerListFilter {
  status?: DealerStatus;
  search?: string;
  page: number;
  limit: number;
}

export interface DealerStats {
  totalSales: number;
  totalGross: number;
  totalDiscount: number;
  totalCommission: number;
  totalNet: number;
  pendingSettlement: number;
  balance: number;
  linksCount: number;
  pendingCommission?: number;
  settledCommission?: number;
  salesTrend?: Array<{ date: string; amount: number; count: number }>;
  commissionTrend?: Array<{ date: string; amount: number }>;
  topProducts?: Array<{ productId: string; productName: string; count: number; gross: number }>;
  recentSales?: DealerSaleEntity[];
  activeLinks?: DealerLinkEntity[];
}

export interface IDealerRepository {
  findByUserId(userId: string): Promise<DealerProfileEntity | null>;
  findById(id: string): Promise<DealerProfileEntity | null>;
  list(filter: DealerListFilter): Promise<{ items: DealerProfileEntity[]; total: number }>;
  create(data: CreateDealerInput): Promise<DealerProfileEntity>;
  update(
    id: string,
    data: Partial<{
      companyName: string;
      taxOffice: string | null;
      address: string | null;
      phone: string | null;
      websiteUrl: string | null;
      logoUrl: string | null;
      notes: string | null;
      commissionRate: number;
    }>,
  ): Promise<DealerProfileEntity>;
  setStatus(
    id: string,
    status: DealerStatus,
    extras?: { approvedById?: string; rejectionReason?: string },
  ): Promise<DealerProfileEntity>;
  delete(id: string): Promise<void>;
  getStats(dealerId: string): Promise<DealerStats>;
  incrementBalance(dealerId: string, amount: number): Promise<void>;
  decrementBalance(dealerId: string, amount: number): Promise<void>;
}

export interface CreateDealerLinkInput {
  dealerId: string;
  code: string;
  productId?: string | null;
  discountPercent?: number;
  maxUses?: number | null;
  expiresAt?: Date | null;
}

export interface IDealerLinkRepository {
  listByDealer(
    dealerId: string,
    options: { page: number; limit: number; isActive?: boolean },
  ): Promise<{ items: DealerLinkEntity[]; total: number }>;
  findById(id: string): Promise<DealerLinkEntity | null>;
  findByCode(code: string): Promise<DealerLinkEntity | null>;
  create(data: CreateDealerLinkInput): Promise<DealerLinkEntity>;
  update(
    id: string,
    data: Partial<{
      discountPercent: number;
      maxUses: number | null;
      isActive: boolean;
      expiresAt: Date | null;
      productId: string | null;
    }>,
  ): Promise<DealerLinkEntity>;
  delete(id: string): Promise<void>;
  incrementUses(id: string): Promise<void>;
  incrementClicks(id: string): Promise<void>;
}

export interface CreateDealerSaleInput {
  dealerId: string;
  orderId: string;
  linkId: string | null;
  grossAmount: number;
  discountAmount: number;
  commissionAmount: number;
  netAmount: number;
}

export interface IDealerSaleRepository {
  listByDealer(
    dealerId: string,
    options: { status?: DealerSaleStatus; page: number; limit: number },
  ): Promise<{ items: DealerSaleEntity[]; total: number }>;
  listByOrder(orderId: string): Promise<DealerSaleEntity | null>;
  create(data: CreateDealerSaleInput): Promise<DealerSaleEntity>;
  getTotalEarnings(
    dealerId: string,
  ): Promise<{ commission: number; pending: number; settled: number }>;
  getPendingSettlement(dealerId: string): Promise<number>;
  markSettled(saleId: string): Promise<void>;
  markRefunded(orderId: string): Promise<void>;
}

export interface CreateDealerPayoutInput {
  dealerId: string;
  userId: string;
  amount: number;
  currency: 'TRY' | 'USD' | 'EUR' | 'USDT';
  method: 'IBAN' | 'PAPARA';
  destination: string;
  notes?: string | null;
}

export interface IDealerPayoutRepository {
  create(data: CreateDealerPayoutInput): Promise<DealerPayoutEntity>;
  findById(id: string): Promise<DealerPayoutEntity | null>;
  listByDealer(
    dealerId: string,
    options: { status?: DealerPayoutStatus; page: number; limit: number },
  ): Promise<{ items: DealerPayoutEntity[]; total: number }>;
  listAll(options: {
    status?: DealerPayoutStatus;
    page: number;
    limit: number;
  }): Promise<{ items: DealerPayoutEntity[]; total: number }>;
  updateStatus(
    id: string,
    status: DealerPayoutStatus,
    extras?: { processedById?: string; rejectionReason?: string },
  ): Promise<DealerPayoutEntity>;
}

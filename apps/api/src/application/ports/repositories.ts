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
  findById(
    orderId: string,
  ): Promise<{
    id: string;
    userId: string;
    totalAmount: number;
    currency: Currency;
    status: string;
  } | null>;
  markPaid(orderId: string, paymentId: string): Promise<void>;
}

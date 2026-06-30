export type UserRole = 'CUSTOMER' | 'ADMIN' | 'SUPER_ADMIN';
export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'BANNED' | 'PENDING_VERIFICATION';
export type UserLocale = 'TR' | 'EN' | 'DE' | 'AR' | 'RU';
export type UserCurrency = 'TRY' | 'USD' | 'EUR' | 'USDT';

export interface UserEntity {
  id: string;
  email: string;
  emailVerified: boolean;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  locale: UserLocale;
  currency: UserCurrency;
  role: UserRole;
  status: UserStatus;
  twoFactorEnabled: boolean;
  twoFactorSecret: string | null;
  isAdult: boolean;
  marketingOptIn: boolean;
  referralCode: string;
  referredById: string | null;
  createdAt: Date;
  lastLoginAt: Date | null;
}
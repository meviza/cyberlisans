import type { UserEntity } from './user';

export interface SessionEntity {
  id: string;
  userId: string;
  refreshToken: string;
  refreshTokenHash: string | null;
  userAgent: string | null;
  ipAddress: string | null;
  expiresAt: Date;
  createdAt: Date;
}

export type AuthError =
  | 'EMAIL_EXISTS'
  | 'USERNAME_TAKEN'
  | 'INVALID_CREDENTIALS'
  | 'ACCOUNT_LOCKED'
  | 'ACCOUNT_BANNED'
  | 'ACCOUNT_PENDING'
  | '2FA_REQUIRED'
  | 'INVALID_2FA'
  | 'INVALID_REFERRAL'
  | 'AGE_RESTRICTION'
  | 'EMAIL_NOT_VERIFIED'
  | 'INVALID_TOKEN'
  | 'TOKEN_EXPIRED'
  | 'MISSING_CONSENT'
  | 'USER_NOT_FOUND';
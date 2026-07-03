import type { UserEntity } from '../../domain/entities/user';
import type { SessionEntity } from '../../domain/entities/session';

export interface RequestMeta {
  ipAddress?: string;
  userAgent?: string;
}

export interface PasswordHasherPort {
  verify(password: string, hash: string): Promise<boolean>;
}

export interface TokenSignerPort {
  signAccess(payload: {
    sub: string;
    email: string;
    role: string;
    username: string;
  }): Promise<string>;
  signRefresh(payload: { sub: string; jti: string }): Promise<string>;
  signEmailVerify(payload: { sub: string; email: string }): Promise<string>;
  verifyEmailVerify(token: string): Promise<{ sub: string; email: string } | null>;
}

export interface TwoFactorVerifierPort {
  decrypt(cipher: string): string | null;
  verify(token: string, secret: string): boolean;
}

export interface BruteForceGuardPort {
  ensureNotLocked(email: string): Promise<void>;
  recordFailed(email: string, meta: RequestMeta): Promise<void>;
  clear(email: string): Promise<void>;
}

export interface AuditLoggerPort {
  login(input: {
    userId: string;
    sessionId: string;
    accessJti: string;
    twoFactorUsed: boolean;
    meta: RequestMeta;
  }): Promise<void>;
}

export interface AdminNoticeMailerPort {
  sendNewDeviceLogin(user: UserEntity, meta: RequestMeta): Promise<void>;
}

export interface UserRepositoryPort {
  findByEmail(email: string): Promise<UserEntity | null>;
  getPasswordHash(id: string): Promise<string | null>;
  setLastLogin(id: string, when: Date): Promise<void>;
}

export interface SessionRepositoryPort {
  create(input: {
    userId: string;
    refreshToken: string;
    refreshTokenHash: string;
    userAgent?: string;
    ipAddress?: string;
    expiresAt: Date;
  }): Promise<SessionEntity>;
  deleteAllForUser(userId: string): Promise<void>;
}

export interface TwoFactorRepositoryPort {
  findByUserId(userId: string): Promise<{ enabled: boolean; secretCipher: string | null } | null>;
}

export interface LoginOutput {
  accessToken: string;
  refreshToken: string;
  sessionId: string;
  user: {
    id: string;
    email: string;
    username: string;
    displayName: string | null;
    role: 'CUSTOMER' | 'ADMIN' | 'SUPER_ADMIN';
    twoFactorEnabled: boolean;
    emailVerified: boolean;
  };
  twoFactorSetupRequired?: boolean;
  twoFactorSetupUrl?: string;
}

export interface LoginUserDeps {
  users: UserRepositoryPort;
  sessions: SessionRepositoryPort;
  twoFactor: TwoFactorRepositoryPort;
  hasher: PasswordHasherPort;
  tokens: TokenSignerPort;
  twoFactorVerifier: TwoFactorVerifierPort;
  bruteForce: BruteForceGuardPort;
  audit: AuditLoggerPort;
  adminMailer: AdminNoticeMailerPort;
}

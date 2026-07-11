import { loginSchema } from '../../../infrastructure/validators';
import type { LoginInput } from '../../../infrastructure/validators';
import {
  verifyPassword,
  verify2FAToken,
  signAccessToken,
  signRefreshToken,
  decryptFromString,
} from '../../../infrastructure/auth';
import { createHash, randomBytes } from 'crypto';

import { userRepository } from '../../../infrastructure/repositories/user.repository';
import { sessionRepository } from '../../../infrastructure/repositories/session.repository';
import { auditRepository } from '../../../infrastructure/repositories/audit.repository';
import { userTwoFactorRepository } from '../../../infrastructure/repositories/user-two-factor.repository';
import {
  InvalidCredentialsError,
  AccountLockedError,
  AccountBannedError,
  AccountPendingError,
  TwoFactorRequiredError,
  InvalidTwoFactorError,
} from '../../../domain/errors';
import {
  ensureNotLocked,
  recordFailedAttempt,
  clearAttempts,
} from '../../../domain/security/brute-force';
import { mailTemplates, getMailService } from '../../../infrastructure/mail';
import type { RequestMeta } from './register-user';

const REFRESH_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const IDLE_TIMEOUT_MS = 24 * 60 * 60 * 1000;

export interface LoginResult {
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

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export async function loginUser(input: LoginInput, meta: RequestMeta): Promise<LoginResult> {
  const data = loginSchema.parse(input);

  await ensureNotLocked(data.email);

  const user = await userRepository.findByEmail(data.email);
  if (!user) {
    await verifyPassword(data.password, '$2a$12$abcdefghijklmnopqrstuv');
    await recordFailedAttempt(data.email, meta.ipAddress, meta.userAgent);
    throw new InvalidCredentialsError();
  }

  const passwordHash = await userRepository.getPasswordHash(user.id);
  if (!passwordHash) {
    await recordFailedAttempt(data.email, meta.ipAddress, meta.userAgent);
    throw new InvalidCredentialsError();
  }

  const ok = await verifyPassword(data.password, passwordHash);
  if (!ok) {
    await recordFailedAttempt(data.email, meta.ipAddress, meta.userAgent);
    throw new InvalidCredentialsError();
  }

  if (user.status === 'BANNED') {
    await recordFailedAttempt(data.email, meta.ipAddress, meta.userAgent);
    throw new AccountBannedError();
  }
  if (user.status === 'SUSPENDED') throw new AccountLockedError();
  if (user.status === 'PENDING_VERIFICATION') throw new AccountPendingError();

  const twoFaRecord = await userTwoFactorRepository.findByUserId(user.id);
  const twoFactorEnabled = twoFaRecord?.enabled === true;

  if (twoFactorEnabled) {
    if (!data.twoFactorToken) throw new TwoFactorRequiredError();
    if (!twoFaRecord?.secretCipher) throw new TwoFactorRequiredError();
    let secret: string;
    try {
      secret = decryptFromString(twoFaRecord.secretCipher);
    } catch {
      throw new TwoFactorRequiredError();
    }
    const valid = verify2FAToken(data.twoFactorToken, secret);
    if (!valid) {
      await recordFailedAttempt(data.email, meta.ipAddress, meta.userAgent);
      throw new InvalidTwoFactorError();
    }
  }

  await sessionRepository.deleteAllForUser(user.id);

  const jti = randomBytes(16).toString('hex');
  const accessJti = randomBytes(16).toString('hex');
  const accessToken = await signAccessToken({
    sub: user.id,
    email: user.email,
    role: user.role,
    username: user.username,
  });
  const refreshToken = await signRefreshToken({ sub: user.id, jti });
  const refreshTokenHash = hashToken(refreshToken);

  const session = await sessionRepository.create({
    userId: user.id,
    refreshToken,
    refreshTokenHash,
    userAgent: meta.userAgent,
    ipAddress: meta.ipAddress,
    expiresAt: new Date(Date.now() + REFRESH_TTL_MS),
  });

  await userRepository.setLastLogin(user.id, new Date());
  await clearAttempts(data.email);
  await auditRepository.log({
    actorId: user.id,
    action: 'LOGIN',
    targetType: 'user',
    targetId: user.id,
    payload: {
      ip: meta.ipAddress,
      twoFactor: twoFactorEnabled,
      sessionId: session.id,
      accessJti,
    },
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });

  if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
    try {
      const tpl = mailTemplates.newDeviceLogin({
        email: user.email,
        ip: meta.ipAddress ?? 'unknown',
        device: meta.userAgent ?? 'unknown',
        time: new Date().toISOString(),
      });
      await getMailService().send({ to: user.email, ...tpl });
    } catch (err) {
      console.error('[login] admin mail send failed', err);
    }
  }

  const twoFactorSetupRequired =
    (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') && !twoFactorEnabled;

  return {
    accessToken,
    refreshToken,
    sessionId: session.id,
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      displayName: user.displayName,
      role: user.role,
      twoFactorEnabled,
      emailVerified: user.emailVerified,
    },
    twoFactorSetupRequired,
    twoFactorSetupUrl: twoFactorSetupRequired ? '/auth/2fa/setup' : undefined,
  };
}

export const SESSION_LIMITS = {
  REFRESH_TTL_MS,
  IDLE_TIMEOUT_MS,
  ABSOLUTE_TTL_MS: REFRESH_TTL_MS,
};

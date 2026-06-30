import { loginSchema } from '../../../infrastructure/validators';
import type { LoginInput } from '../../../infrastructure/validators';
import { verifyPassword, verify2FAToken, signAccessToken, signRefreshToken } from '../../../infrastructure/auth';
import { createHash, randomBytes } from 'crypto';

import { userRepository } from '../../../infrastructure/repositories/user.repository';
import { sessionRepository } from '../../../infrastructure/repositories/session.repository';
import { auditRepository } from '../../../infrastructure/repositories/audit.repository';
import {
  InvalidCredentialsError,
  AccountLockedError,
  AccountBannedError,
  AccountPendingError,
  TwoFactorRequiredError,
  InvalidTwoFactorError,
} from '../../errors';
import type { RequestMeta } from './register-user';

const REFRESH_TTL_MS = 30 * 24 * 60 * 60 * 1000;

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
}

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export async function loginUser(input: LoginInput, meta: RequestMeta): Promise<LoginResult> {
  const data = loginSchema.parse(input);

  const user = await userRepository.findByEmail(data.email);
  if (!user) throw new InvalidCredentialsError();

  const passwordHash = await userRepository.getPasswordHash(user.id);
  if (!passwordHash) throw new InvalidCredentialsError();

  const ok = await verifyPassword(data.password, passwordHash);
  if (!ok) throw new InvalidCredentialsError();

  if (user.status === 'BANNED') throw new AccountBannedError();
  if (user.status === 'SUSPENDED') throw new AccountLockedError();
  if (user.status === 'PENDING_VERIFICATION') throw new AccountPendingError();

  if (user.twoFactorEnabled) {
    if (!data.twoFactorToken) throw new TwoFactorRequiredError();
    if (!user.twoFactorSecret) throw new TwoFactorRequiredError();
    const valid = verify2FAToken(data.twoFactorToken, user.twoFactorSecret);
    if (!valid) throw new InvalidTwoFactorError();
  }

  const jti = randomBytes(16).toString('hex');
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
  await auditRepository.log({
    actorId: user.id,
    action: 'LOGIN',
    targetType: 'user',
    targetId: user.id,
    payload: { ip: meta.ipAddress, twoFactor: user.twoFactorEnabled },
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });

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
      twoFactorEnabled: user.twoFactorEnabled,
      emailVerified: user.emailVerified,
    },
  };
}

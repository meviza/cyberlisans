import { createHash, randomBytes } from 'crypto';
import { verifyRefreshToken, signAccessToken, signRefreshToken } from '../../../infrastructure/auth';
import { userRepository } from '../../../infrastructure/repositories/user.repository';
import { sessionRepository } from '../../../infrastructure/repositories/session.repository';
import { auditRepository } from '../../../infrastructure/repositories/audit.repository';
import { InvalidTokenError, UserNotFoundError } from '../../errors';
import type { RequestMeta } from './register-user';

const REFRESH_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export interface RefreshResult {
  accessToken: string;
  refreshToken: string;
  sessionId: string;
}

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export async function refreshToken(
  refreshTokenJwt: string,
  meta: RequestMeta,
): Promise<RefreshResult> {
  const payload = await verifyRefreshToken(refreshTokenJwt);
  if (!payload) throw new InvalidTokenError();

  const tokenHash = hashToken(refreshTokenJwt);
  const session = await sessionRepository.findByRefreshTokenHash(tokenHash);
  if (!session) throw new InvalidTokenError('Oturum geçersiz');
  if (session.expiresAt < new Date()) throw new InvalidTokenError('Oturum süresi dolmuş');

  const user = await userRepository.findById(payload.sub);
  if (!user) throw new UserNotFoundError();
  if (user.status === 'BANNED' || user.status === 'SUSPENDED') {
    await sessionRepository.deleteById(session.id);
    throw new InvalidTokenError('Hesap devre dışı');
  }

  await sessionRepository.deleteById(session.id);

  const jti = randomBytes(16).toString('hex');
  const accessToken = await signAccessToken({
    sub: user.id,
    email: user.email,
    role: user.role,
    username: user.username,
  });
  const newRefreshToken = await signRefreshToken({ sub: user.id, jti });
  const newRefreshTokenHash = hashToken(newRefreshToken);

  const newSession = await sessionRepository.create({
    userId: user.id,
    refreshToken: newRefreshToken,
    refreshTokenHash: newRefreshTokenHash,
    userAgent: meta.userAgent ?? session.userAgent ?? undefined,
    ipAddress: meta.ipAddress ?? session.ipAddress ?? undefined,
    expiresAt: new Date(Date.now() + REFRESH_TTL_MS),
  });

  await auditRepository.log({
    actorId: user.id,
    action: 'LOGIN',
    targetType: 'session',
    targetId: newSession.id,
    payload: { event: 'refresh' },
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });

  return {
    accessToken,
    refreshToken: newRefreshToken,
    sessionId: newSession.id,
  };
}

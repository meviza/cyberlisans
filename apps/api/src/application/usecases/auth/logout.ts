import { createHash } from 'crypto';
import { sessionRepository } from '../../../infrastructure/repositories/session.repository';
import { auditRepository } from '../../../infrastructure/repositories/audit.repository';
import { InvalidTokenError } from '../../../domain/errors';
import type { RequestMeta } from './register-user';

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export async function logout(
  refreshTokenJwt: string | undefined,
  userId: string,
  meta: RequestMeta,
): Promise<void> {
  if (refreshTokenJwt) {
    const tokenHash = hashToken(refreshTokenJwt);
    const session = await sessionRepository.findByRefreshTokenHash(tokenHash);
    if (session) {
      await sessionRepository.deleteById(session.id);
    }
  }

  await auditRepository.log({
    actorId: userId,
    action: 'LOGOUT',
    targetType: 'user',
    targetId: userId,
    payload: {},
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });
}

export async function logoutAll(userId: string, meta: RequestMeta): Promise<void> {
  await sessionRepository.deleteAllForUser(userId);
  await auditRepository.log({
    actorId: userId,
    action: 'LOGOUT',
    targetType: 'user',
    targetId: userId,
    payload: { event: 'logout_all' },
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });
}

export async function logoutSession(
  sessionId: string,
  userId: string,
  meta: RequestMeta,
): Promise<void> {
  const sessions = await sessionRepository.listForUser(userId);
  const session = sessions.find((s) => s.id === sessionId);
  if (!session) throw new InvalidTokenError('Oturum bulunamadı');
  await sessionRepository.deleteById(sessionId);
  await auditRepository.log({
    actorId: userId,
    action: 'LOGOUT',
    targetType: 'session',
    targetId: sessionId,
    payload: { event: 'logout_one' },
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });
}

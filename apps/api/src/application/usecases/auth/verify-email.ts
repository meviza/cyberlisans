import { verifyEmailVerifyToken } from '../../../infrastructure/auth';
import { userRepository } from '../../../infrastructure/repositories/user.repository';
import { auditRepository } from '../../../infrastructure/repositories/audit.repository';
import { InvalidTokenError, UserNotFoundError } from '../../../domain/errors';
import type { RequestMeta } from './register-user';

export async function verifyEmail(token: string, meta: RequestMeta): Promise<void> {
  const payload = await verifyEmailVerifyToken(token);
  if (!payload) throw new InvalidTokenError('Doğrulama tokenı geçersiz veya süresi dolmuş');

  const user = await userRepository.findById(payload.sub);
  if (!user) throw new UserNotFoundError();

  if (!user.emailVerified) {
    await userRepository.setEmailVerified(user.id);
  }

  await auditRepository.log({
    actorId: user.id,
    action: 'STATUS_CHANGE',
    targetType: 'user',
    targetId: user.id,
    payload: { event: 'email_verified' },
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });
}

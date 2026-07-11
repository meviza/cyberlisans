import { changePasswordSchema } from '../../../infrastructure/validators';
import type { ChangePasswordInput } from '../../../infrastructure/validators';
import { verifyPassword, hashPassword } from '../../../infrastructure/auth';

import { userRepository } from '../../../infrastructure/repositories/user.repository';
import { sessionRepository } from '../../../infrastructure/repositories/session.repository';
import { auditRepository } from '../../../infrastructure/repositories/audit.repository';
import { InvalidCredentialsError } from '../../../domain/errors';
import type { RequestMeta } from './register-user';

export interface ChangePasswordResult {
  message: string;
}

export async function changePassword(
  userId: string,
  input: ChangePasswordInput,
  meta: RequestMeta,
  currentSessionId?: string,
): Promise<ChangePasswordResult> {
  const data = changePasswordSchema.parse(input);

  const currentHash = await userRepository.getPasswordHash(userId);
  if (!currentHash) throw new InvalidCredentialsError();
  const ok = await verifyPassword(data.currentPassword, currentHash);
  if (!ok) throw new InvalidCredentialsError('Mevcut şifre hatalı');

  const newHash = await hashPassword(data.newPassword);
  await userRepository.setPassword(userId, newHash);

  const sessions = await sessionRepository.listForUser(userId);
  for (const s of sessions) {
    if (s.id !== currentSessionId) {
      await sessionRepository.deleteById(s.id);
    }
  }

  await auditRepository.log({
    actorId: userId,
    action: 'UPDATE',
    targetType: 'user',
    targetId: userId,
    payload: { event: 'password_change' },
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });

  return { message: 'Şifre güncellendi. Diğer cihazlardaki oturumlar kapatıldı.' };
}

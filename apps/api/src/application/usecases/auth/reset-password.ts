import { resetPasswordSchema } from '../../../infrastructure/validators';
import type { ResetPasswordInput } from '../../../infrastructure/validators';
import { verifyPasswordResetToken, hashPassword } from '../../../infrastructure/auth';

import { userRepository } from '../../../infrastructure/repositories/user.repository';
import { sessionRepository } from '../../../infrastructure/repositories/session.repository';
import { auditRepository } from '../../../infrastructure/repositories/audit.repository';
import { InvalidTokenError, UserNotFoundError } from '../../../domain/errors';
import type { RequestMeta } from './register-user';

export interface ResetPasswordResult {
  message: string;
}

export async function resetPassword(
  input: ResetPasswordInput,
  meta: RequestMeta,
): Promise<ResetPasswordResult> {
  const data = resetPasswordSchema.parse(input);

  const payload = await verifyPasswordResetToken(data.token);
  if (!payload) throw new InvalidTokenError('Sıfırlama tokenı geçersiz veya süresi dolmuş');

  const user = await userRepository.findById(payload.sub);
  if (!user) throw new UserNotFoundError();

  const newHash = await hashPassword(data.password);
  await userRepository.setPassword(user.id, newHash);
  await sessionRepository.deleteAllForUser(user.id);

  await auditRepository.log({
    actorId: user.id,
    action: 'UPDATE',
    targetType: 'user',
    targetId: user.id,
    payload: { event: 'password_reset_complete' },
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });

  return { message: 'Şifreniz güncellendi. Tüm oturumlar kapatıldı.' };
}

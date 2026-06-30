import { z } from 'zod';
import { verifyPassword } from '../../../infrastructure/auth';
import { userRepository } from '../../../infrastructure/repositories/user.repository';
import { auditRepository } from '../../../infrastructure/repositories/audit.repository';
import { UserNotFoundError, InvalidCredentialsError } from '../../errors';
import type { RequestMeta } from './register-user';

export const disable2FASchema = z.object({
  password: z.string().min(1),
});
export type Disable2FAInput = z.infer<typeof disable2FASchema>;

export interface Disable2FAResult {
  message: string;
}

export async function disable2FA(
  userId: string,
  input: Disable2FAInput,
  meta: RequestMeta,
): Promise<Disable2FAResult> {
  const data = disable2FASchema.parse(input);

  const user = await userRepository.findById(userId);
  if (!user) throw new UserNotFoundError();

  const hash = await userRepository.getPasswordHash(userId);
  if (!hash) throw new InvalidCredentialsError();
  const ok = await verifyPassword(data.password, hash);
  if (!ok) throw new InvalidCredentialsError('Şifre hatalı');

  await userRepository.setTwoFactor(userId, null, false);

  await auditRepository.log({
    actorId: userId,
    action: 'SETTINGS_CHANGE',
    targetType: 'user',
    targetId: userId,
    payload: { event: '2fa_disabled' },
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });

  return { message: '2FA devre dışı bırakıldı.' };
}

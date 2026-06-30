import { enable2FASchema } from '../../../infrastructure/validators';
import type { Enable2FAInput } from '../../../infrastructure/validators';
import { verify2FAToken } from '../../../infrastructure/auth';

import { mailTemplates, getMailService } from '../../../infrastructure/mail';
import { userRepository } from '../../../infrastructure/repositories/user.repository';
import { auditRepository } from '../../../infrastructure/repositories/audit.repository';
import { UserNotFoundError, InvalidTwoFactorError } from '../../errors';
import type { RequestMeta } from './register-user';

export interface Verify2FAResult {
  message: string;
}

export async function verify2FA(
  userId: string,
  input: Enable2FAInput,
  meta: RequestMeta,
): Promise<Verify2FAResult> {
  const data = enable2FASchema.parse(input);

  const user = await userRepository.findById(userId);
  if (!user) throw new UserNotFoundError();
  if (!user.twoFactorSecret) throw new InvalidTwoFactorError('2FA başlatılmamış');

  const valid = verify2FAToken(data.token, user.twoFactorSecret);
  if (!valid) throw new InvalidTwoFactorError();

  await userRepository.setTwoFactor(userId, user.twoFactorSecret, true);

  await auditRepository.log({
    actorId: userId,
    action: 'SETTINGS_CHANGE',
    targetType: 'user',
    targetId: userId,
    payload: { event: '2fa_enabled' },
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });

  try {
    const tpl = mailTemplates.twoFactorEnabled();
    await getMailService().send({ to: user.email, ...tpl });
  } catch (err) {
    console.error('[2fa] mail send failed', err);
  }

  return { message: '2FA başarıyla etkinleştirildi.' };
}

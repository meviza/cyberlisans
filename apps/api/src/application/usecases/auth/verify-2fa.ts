import { enable2FASchema } from '../../../infrastructure/validators';
import type { Enable2FAInput } from '../../../infrastructure/validators';
import { verify2FAToken, decryptFromString } from '../../../infrastructure/auth';

import { mailTemplates, getMailService } from '../../../infrastructure/mail';
import { userRepository } from '../../../infrastructure/repositories/user.repository';
import { userTwoFactorRepository } from '../../../infrastructure/repositories/user-two-factor.repository';
import { auditRepository } from '../../../infrastructure/repositories/audit.repository';
import { UserNotFoundError, InvalidTwoFactorError } from '../../../domain/errors';
import type { RequestMeta } from './register-user';

export interface Verify2FAResult {
  message: string;
  backupCodesRemaining: number;
}

export async function verify2FA(
  userId: string,
  input: Enable2FAInput,
  meta: RequestMeta,
): Promise<Verify2FAResult> {
  const data = enable2FASchema.parse(input);

  const user = await userRepository.findById(userId);
  if (!user) throw new UserNotFoundError();

  const twoFaRecord = await userTwoFactorRepository.findByUserId(userId);
  if (!twoFaRecord?.secretCipher) throw new InvalidTwoFactorError('2FA başlatılmamış');

  let secret: string;
  try {
    secret = decryptFromString(twoFaRecord.secretCipher);
  } catch {
    throw new InvalidTwoFactorError('2FA secret çözümlenemedi');
  }

  const valid = verify2FAToken(data.token, secret);
  if (!valid) throw new InvalidTwoFactorError();

  await userTwoFactorRepository.upsert(userId, {
    secretCipher: twoFaRecord.secretCipher,
    backupCodesHash: twoFaRecord.backupCodesHash,
    enabled: true,
  });

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

  return {
    message: '2FA başarıyla etkinleştirildi.',
    backupCodesRemaining: twoFaRecord.backupCodesHash.length,
  };
}

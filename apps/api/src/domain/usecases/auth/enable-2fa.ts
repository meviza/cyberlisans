import { generate2FASecret, generate2FAQRCode } from '../../../infrastructure/auth';
import { userRepository } from '../../../infrastructure/repositories/user.repository';
import { auditRepository } from '../../../infrastructure/repositories/audit.repository';
import { UserNotFoundError } from '../../errors';
import type { RequestMeta } from './register-user';

export interface Enable2FAResult {
  secret: string;
  otpauthUrl: string;
  qrCodeDataUrl: string;
}

export async function enable2FA(
  userId: string,
  meta: RequestMeta,
): Promise<Enable2FAResult> {
  const user = await userRepository.findById(userId);
  if (!user) throw new UserNotFoundError();

  const { secret, otpauthUrl } = generate2FASecret(user.email);
  const qrCodeDataUrl = await generate2FAQRCode(otpauthUrl);

  await userRepository.setTwoFactor(userId, secret, false);

  await auditRepository.log({
    actorId: userId,
    action: 'SETTINGS_CHANGE',
    targetType: 'user',
    targetId: userId,
    payload: { event: '2fa_setup_initiated' },
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });

  return { secret, otpauthUrl, qrCodeDataUrl };
}

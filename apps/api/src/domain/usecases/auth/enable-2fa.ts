import {
  generate2FASecret,
  generate2FAQRCode,
  encryptToString,
  generateBackupCodes,
  hashBackupCodes,
} from '../../../infrastructure/auth';
import { userRepository } from '../../../infrastructure/repositories/user.repository';
import { userTwoFactorRepository } from '../../../infrastructure/repositories/user-two-factor.repository';
import { auditRepository } from '../../../infrastructure/repositories/audit.repository';
import { UserNotFoundError } from '../../errors';
import type { RequestMeta } from './register-user';

export interface Enable2FAResult {
  secret: string;
  otpauthUrl: string;
  qrCodeDataUrl: string;
  backupCodes: string[];
}

export async function enable2FA(userId: string, meta: RequestMeta): Promise<Enable2FAResult> {
  const user = await userRepository.findById(userId);
  if (!user) throw new UserNotFoundError();

  const { secret, otpauthUrl } = generate2FASecret(user.email);
  const qrCodeDataUrl = await generate2FAQRCode(otpauthUrl);

  const cipher = encryptToString(secret);
  const backup = generateBackupCodes();
  const backupHashed = await hashBackupCodes(backup.plain);

  await userTwoFactorRepository.upsert(userId, {
    secretCipher: cipher,
    backupCodesHash: backupHashed,
    enabled: false,
  });
  await userRepository.setTwoFactor(userId, null, false);

  await auditRepository.log({
    actorId: userId,
    action: 'SETTINGS_CHANGE',
    targetType: 'user',
    targetId: userId,
    payload: { event: '2fa_setup_initiated' },
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });

  return { secret, otpauthUrl, qrCodeDataUrl, backupCodes: backup.plain };
}

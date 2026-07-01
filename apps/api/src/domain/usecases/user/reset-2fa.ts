import { prisma } from '../../../infrastructure/db';
import { userRepository } from '../../../infrastructure/repositories/user.repository';
import { auditRepository } from '../../../infrastructure/repositories/audit.repository';
import { UserNotFoundForAdminError } from '../../errors/wallet';
import { getMailService } from '../../../infrastructure/mail';

export interface Reset2FAInput {
  userId: string;
  adminId: string;
  ipAddress?: string;
  userAgent?: string;
}

export async function reset2FAForUser(input: Reset2FAInput) {
  const user = await userRepository.findById(input.userId);
  if (!user) throw new UserNotFoundForAdminError();
  if (!user.twoFactorEnabled && !user.twoFactorSecret) {
    return { alreadyDisabled: true, user };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { twoFactorEnabled: false, twoFactorSecret: null },
  });

  await auditRepository.log({
    actorId: input.adminId,
    targetUserId: user.id,
    action: 'SETTINGS_CHANGE',
    targetType: 'user',
    targetId: user.id,
    payload: { operation: 'reset_2fa' },
    ipAddress: input.ipAddress,
    userAgent: input.userAgent,
  });

  try {
    const mail = getMailService();
    const appUrl = process.env['NEXT_PUBLIC_APP_URL'] ?? 'http://localhost:3000';
    await mail.send({
      to: user.email,
      subject: '2FA Sıfırlandı — CyberLisans',
      html: `<div style="font-family: sans-serif; padding: 24px; background: #0A0A1F; color: #fff;">
        <h1 style="color: #FF00C8;">2FA Sıfırlandı</h1>
        <p>Hesabınızın iki faktörlü doğrulaması bir yönetici tarafından sıfırlandı.</p>
        <p>Güvenliğiniz için yeniden etkinleştirmenizi öneririz: <a href="${appUrl}/dashboard/settings" style="color: #00F0FF;">${appUrl}/dashboard/settings</a></p>
      </div>`,
    });
  } catch (err) {
    console.error('[ADMIN RESET 2FA MAIL ERROR]', err);
  }

  return { alreadyDisabled: false };
}

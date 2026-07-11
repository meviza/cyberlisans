import { userRepository } from '../../../infrastructure/repositories/user.repository';
import { auditRepository } from '../../../infrastructure/repositories/audit.repository';
import { UserNotFoundForAdminError } from '../../../domain/errors/wallet';
import { getMailService, mailTemplates } from '../../../infrastructure/mail';

export interface SendPasswordResetInput {
  userId: string;
  adminId: string;
  ipAddress?: string;
  userAgent?: string;
}

export async function sendPasswordResetToUser(input: SendPasswordResetInput) {
  const user = await userRepository.findById(input.userId);
  if (!user) throw new UserNotFoundForAdminError();

  const appUrl = process.env['NEXT_PUBLIC_APP_URL'] ?? 'http://localhost:3000';
  const link = `${appUrl}/forgot-password?email=${encodeURIComponent(user.email)}`;

  try {
    const mail = getMailService();
    const tpl = mailTemplates.passwordReset(link);
    await mail.send({
      to: user.email,
      subject: tpl.subject,
      html: tpl.html,
      text: tpl.text,
    });
  } catch (err) {
    console.error('[ADMIN SEND PASSWORD RESET ERROR]', err);
  }

  await auditRepository.log({
    actorId: input.adminId,
    targetUserId: user.id,
    action: 'SETTINGS_CHANGE',
    targetType: 'user',
    targetId: user.id,
    payload: { operation: 'send_password_reset' },
    ipAddress: input.ipAddress,
    userAgent: input.userAgent,
  });

  return { sent: true, email: user.email };
}

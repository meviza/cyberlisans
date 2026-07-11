import { signPasswordResetToken } from '../../../infrastructure/auth';
import { mailTemplates, getMailService } from '../../../infrastructure/mail';
import { userRepository } from '../../../infrastructure/repositories/user.repository';
import { auditRepository } from '../../../infrastructure/repositories/audit.repository';
import type { RequestMeta } from './register-user';

export interface ForgotPasswordResult {
  message: string;
}

export async function requestPasswordReset(
  email: string,
  meta: RequestMeta,
): Promise<ForgotPasswordResult> {
  const user = await userRepository.findByEmail(email);

  if (user) {
    const token = await signPasswordResetToken({ sub: user.id, email: user.email });
    const appUrl = process.env['NEXT_PUBLIC_APP_URL'] ?? 'http://localhost:3000';
    const link = `${appUrl}/reset-password?token=${token}`;
    try {
      const tpl = mailTemplates.passwordReset(link);
      await getMailService().send({ to: user.email, ...tpl });
    } catch (err) {
      console.error('[forgot] mail send failed', err);
    }

    await auditRepository.log({
      actorId: user.id,
      action: 'UPDATE',
      targetType: 'user',
      targetId: user.id,
      payload: { event: 'password_reset_request' },
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    });
  }

  return { message: 'Eğer e-posta kayıtlıysa sıfırlama bağlantısı gönderildi.' };
}

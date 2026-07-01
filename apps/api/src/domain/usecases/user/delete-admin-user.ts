import { prisma } from '../../../infrastructure/db';
import { userRepository } from '../../../infrastructure/repositories/user.repository';
import { auditRepository } from '../../../infrastructure/repositories/audit.repository';
import { UserNotFoundForAdminError } from '../../errors/wallet';
import { getMailService } from '../../../infrastructure/mail';

export interface DeleteAdminUserInput {
  userId: string;
  adminId: string;
  ipAddress?: string;
  userAgent?: string;
}

export async function deleteAdminUser(input: DeleteAdminUserInput) {
  const user = await userRepository.findById(input.userId);
  if (!user) throw new UserNotFoundForAdminError();
  if (user.id === input.adminId) {
    return { ok: false as const, reason: 'SELF_DELETE' as const };
  }

  const [ordersCount, paymentsCount] = await prisma.$transaction([
    prisma.order.count({ where: { userId: user.id } }),
    prisma.payment.count({ where: { userId: user.id } }),
  ]);

  await prisma.$transaction([
    prisma.auditLog.updateMany({
      where: { targetUserId: user.id },
      data: { targetUserId: null },
    }),
    prisma.auditLog.updateMany({
      where: { actorId: user.id },
      data: { actorId: null },
    }),
    prisma.consentRecord.deleteMany({ where: { userId: user.id } }),
    prisma.walletTransaction.deleteMany({ where: { userId: user.id } }),
    prisma.wallet.deleteMany({ where: { userId: user.id } }),
    prisma.user.delete({ where: { id: user.id } }),
  ]);

  await auditRepository.log({
    actorId: input.adminId,
    targetUserId: input.adminId,
    action: 'DELETE',
    targetType: 'user',
    targetId: user.id,
    payload: {
      email: user.email,
      username: user.username,
      ordersCount,
      paymentsCount,
      reason: 'KVKK hard delete',
    },
    ipAddress: input.ipAddress,
    userAgent: input.userAgent,
  });

  try {
    const mail = getMailService();
    await mail.send({
      to: user.email,
      subject: 'Hesabınız Silindi — CyberLisans',
      html: `<div style="font-family: sans-serif; padding: 24px; background: #0A0A1F; color: #fff;">
        <h1 style="color: #FF00C8;">Hesabınız Silindi</h1>
        <p>KVKK kapsamında talebiniz üzerine hesabınız ve tüm verileriniz silinmiştir.</p>
      </div>`,
    });
  } catch (err) {
    console.error('[ADMIN DELETE USER MAIL ERROR]', err);
  }

  return { ok: true as const };
}

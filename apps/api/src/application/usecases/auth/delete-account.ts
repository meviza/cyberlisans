import { userRepository } from '../../../infrastructure/repositories/user.repository';
import { sessionRepository } from '../../../infrastructure/repositories/session.repository';
import { auditRepository } from '../../../infrastructure/repositories/audit.repository';
import { UserNotFoundError } from '../../../domain/errors';
import type { RequestMeta } from './register-user';

export interface DeleteAccountResult {
  message: string;
}

export async function deleteOwnAccount(
  userId: string,
  meta: RequestMeta,
): Promise<DeleteAccountResult> {
  const user = await userRepository.findById(userId);
  if (!user) throw new UserNotFoundError();

  await userRepository.setStatus(userId, 'SUSPENDED');
  await sessionRepository.deleteAllForUser(userId);

  await auditRepository.log({
    actorId: userId,
    action: 'STATUS_CHANGE',
    targetType: 'user',
    targetId: userId,
    payload: { event: 'account_self_deleted', previousStatus: user.status },
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });

  return { message: 'Hesabınız askıya alındı. Tüm oturumlar kapatıldı.' };
}

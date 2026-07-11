import { updateProfileSchema } from '../../../infrastructure/validators';
import type { UpdateProfileInput } from '../../../infrastructure/validators';

import { userRepository } from '../../../infrastructure/repositories/user.repository';
import { auditRepository } from '../../../infrastructure/repositories/audit.repository';
import { UserNotFoundError } from '../../../domain/errors';
import { consentRepository } from '../../../infrastructure/repositories/consent.repository';
import type { RequestMeta } from './register-user';

export interface UpdateProfileResult {
  id: string;
  displayName: string | null;
  avatarUrl: string | null;
  locale: string;
  currency: string;
  marketingOptIn: boolean;
}

export async function updateProfile(
  userId: string,
  input: UpdateProfileInput,
  meta: RequestMeta,
): Promise<UpdateProfileResult> {
  const data = updateProfileSchema.parse(input);

  const user = await userRepository.findById(userId);
  if (!user) throw new UserNotFoundError();

  const updated = await userRepository.update(userId, {
    displayName: data.displayName ?? user.displayName,
    avatarUrl: data.avatarUrl ?? user.avatarUrl,
    locale: data.locale ?? user.locale,
    currency: data.currency ?? user.currency,
    marketingOptIn: data.marketingOptIn ?? user.marketingOptIn,
  });

  if (data.marketingOptIn !== undefined && data.marketingOptIn !== user.marketingOptIn) {
    await consentRepository.record({
      userId: user.id,
      email: user.email,
      type: 'MARKETING',
      granted: data.marketingOptIn,
      documentVersion: '1.0',
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    });
  }

  await auditRepository.log({
    actorId: userId,
    action: 'UPDATE',
    targetType: 'user',
    targetId: userId,
    payload: { event: 'profile_update', fields: Object.keys(data) },
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });

  return {
    id: updated.id,
    displayName: updated.displayName,
    avatarUrl: updated.avatarUrl,
    locale: updated.locale,
    currency: updated.currency,
    marketingOptIn: updated.marketingOptIn,
  };
}

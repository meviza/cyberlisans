import { userRepository } from '../../../infrastructure/repositories/user.repository';
import { auditRepository } from '../../../infrastructure/repositories/audit.repository';
import { UserNotFoundForAdminError } from '../../../domain/errors/wallet';
import type { UserRole, UserStatus } from '../../../domain/entities/user';

export interface UpdateAdminUserInput {
  userId: string;
  adminId: string;
  data: {
    role?: UserRole;
    status?: UserStatus;
    emailVerified?: boolean;
  };
  ipAddress?: string;
  userAgent?: string;
}

export async function updateAdminUser(input: UpdateAdminUserInput) {
  const existing = await userRepository.findById(input.userId);
  if (!existing) throw new UserNotFoundForAdminError();

  const updated = await userRepository.update(input.userId, {
    ...(input.data.role ? { role: input.data.role } : {}),
    ...(input.data.status ? { status: input.data.status } : {}),
    ...(input.data.emailVerified !== undefined ? { emailVerified: input.data.emailVerified } : {}),
  });

  const changes: Record<string, { from: unknown; to: unknown }> = {};
  if (input.data.role && input.data.role !== existing.role) {
    changes['role'] = { from: existing.role, to: input.data.role };
  }
  if (input.data.status && input.data.status !== existing.status) {
    changes['status'] = { from: existing.status, to: input.data.status };
  }
  if (
    input.data.emailVerified !== undefined &&
    input.data.emailVerified !== existing.emailVerified
  ) {
    changes['emailVerified'] = {
      from: existing.emailVerified,
      to: input.data.emailVerified,
    };
  }

  if (Object.keys(changes).length > 0) {
    const roleChanged = input.data.role && input.data.role !== existing.role;
    const statusChanged = input.data.status && input.data.status !== existing.status;
    await auditRepository.log({
      actorId: input.adminId,
      targetUserId: input.userId,
      action: roleChanged ? 'ROLE_CHANGE' : statusChanged ? 'STATUS_CHANGE' : 'UPDATE',
      targetType: 'user',
      targetId: input.userId,
      payload: changes,
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
    });
  }

  return updated;
}

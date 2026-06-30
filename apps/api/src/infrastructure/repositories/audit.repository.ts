import { prisma } from '../../infrastructure/db';
import type { IAuditRepository, AuditLogInput } from '../../application/ports/repositories';

export class AuditRepository implements IAuditRepository {
  async log(data: AuditLogInput): Promise<void> {
    await prisma.auditLog.create({
      data: {
        actorId: data.actorId,
        targetUserId: data.targetUserId,
        action: data.action,
        targetType: data.targetType,
        targetId: data.targetId,
        payload: data.payload as any,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      },
    });
  }
}

export const auditRepository = new AuditRepository();

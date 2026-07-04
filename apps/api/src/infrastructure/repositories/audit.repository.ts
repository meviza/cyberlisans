import { supabaseAdmin, dbError } from '../../infrastructure/db';
import type { IAuditRepository, AuditLogInput } from '../../application/ports/repositories';

export class AuditRepository implements IAuditRepository {
  async log(data: AuditLogInput): Promise<void> {
    const insert: Record<string, unknown> = {
      actorId: data.actorId,
      action: data.action,
    };
    if (data.targetUserId !== undefined) insert['targetUserId'] = data.targetUserId;
    if (data.targetType !== undefined) insert['targetType'] = data.targetType;
    if (data.targetId !== undefined) insert['targetId'] = data.targetId;
    if (data.payload !== undefined) insert['payload'] = data.payload;
    if (data.ipAddress !== undefined) insert['ipAddress'] = data.ipAddress;
    if (data.userAgent !== undefined) insert['userAgent'] = data.userAgent;
    const { error } = await supabaseAdmin().from('audit_logs').insert(insert);
    if (error) throw dbError(error);
  }
}

export const auditRepository = new AuditRepository();

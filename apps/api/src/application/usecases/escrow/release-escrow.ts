import type { RequestMeta } from '../../ports/auth';
import { supabaseAdmin } from '../../../infrastructure/supabase-db';
import type { IAuditRepository } from '../../ports/repositories';
import { EscrowInvalidStatusError } from '../../../domain/errors/escrow';

export interface ReleaseEscrowInputDTO {
  escrowId: string;
  releasedBy: string;
  reason: string;
  meta?: RequestMeta;
}

export interface ReleaseEscrowOutput {
  ok: true;
  escrowId: string;
  status: string;
}

export class ReleaseEscrowUseCase {
  constructor(private readonly deps: { audit: IAuditRepository }) {}

  async execute(input: ReleaseEscrowInputDTO): Promise<ReleaseEscrowOutput> {
    const { data, error } = await supabaseAdmin().rpc('release_escrow', {
      p_escrow_id: input.escrowId,
      p_released_by: input.releasedBy,
      p_reason: input.reason,
    });
    if (error) {
      throw new EscrowInvalidStatusError(error.message);
    }
    if (data && typeof data === 'object' && (data as { ok?: boolean }).ok === false) {
      throw new EscrowInvalidStatusError((data as { error?: string }).error ?? 'Release başarısız');
    }

    await this.deps.audit.log({
      actorId: input.releasedBy,
      action: 'STATUS_CHANGE',
      targetType: 'escrow',
      targetId: input.escrowId,
      payload: { event: 'release', reason: input.reason },
      ipAddress: input.meta?.ipAddress,
      userAgent: input.meta?.userAgent,
    });

    return { ok: true, escrowId: input.escrowId, status: 'RELEASED' };
  }
}

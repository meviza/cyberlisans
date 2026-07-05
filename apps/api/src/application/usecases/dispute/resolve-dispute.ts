import type { RequestMeta } from '../../ports/auth';
import { supabaseAdmin } from '../../../infrastructure/supabase-db';
import type { IEscrowRepository, IDisputeRepository } from '../../ports/escrow';
import type { IAuditRepository } from '../../ports/repositories';
import { DisputeNotFoundError, DisputeInvalidStatusError } from '../../../domain/errors/escrow';
import type { DisputeEntity, DisputeResolution } from '../../../domain/entities/escrow';

export interface ResolveDisputeInputDTO {
  disputeId: string;
  resolvedBy: string;
  resolution: DisputeResolution;
  refundAmount?: number;
  note?: string;
  meta?: RequestMeta;
}

export interface ResolveDisputeDeps {
  escrow: IEscrowRepository;
  disputes: IDisputeRepository;
  audit: IAuditRepository;
}

export interface ResolveDisputeOutput {
  ok: true;
  disputeId: string;
  escrowStatus: string;
  resolution: DisputeResolution;
}

export class ResolveDisputeUseCase {
  constructor(private readonly deps: ResolveDisputeDeps) {}

  async execute(input: ResolveDisputeInputDTO): Promise<ResolveDisputeOutput> {
    const dispute = await this.deps.disputes.findById(input.disputeId);
    if (!dispute) throw new DisputeNotFoundError();
    if (dispute.status === 'RESOLVED' || dispute.status === 'REJECTED') {
      throw new DisputeInvalidStatusError();
    }

    const escrow = await this.deps.escrow.findById(dispute.escrowId);
    if (!escrow) throw new DisputeNotFoundError();

    let escrowStatus: string;
    if (input.resolution === 'REFUND') {
      await this.callRefundRpc(escrow.id, input.resolvedBy, input.note ?? dispute.reason);
      escrowStatus = 'REFUNDED';
    } else if (input.resolution === 'RELEASE') {
      await this.callReleaseRpc(escrow.id, input.resolvedBy, input.note ?? dispute.reason);
      escrowStatus = 'RELEASED';
    } else {
      const partial = input.refundAmount ?? 0;
      if (partial <= 0 || partial >= escrow.amount) {
        throw new DisputeInvalidStatusError(
          'PARTIAL_REFUND için refundAmount 0 < x < amount olmalı',
        );
      }
      await this.callRefundRpc(escrow.id, input.resolvedBy, input.note ?? dispute.reason);
      escrowStatus = 'PARTIAL';
    }

    await this.deps.disputes.resolve(dispute.id, input.resolution, input.resolvedBy, input.note);

    await this.deps.audit.log({
      actorId: input.resolvedBy,
      action: 'STATUS_CHANGE',
      targetType: 'dispute',
      targetId: dispute.id,
      payload: { resolution: input.resolution, escrowStatus },
      ipAddress: input.meta?.ipAddress,
      userAgent: input.meta?.userAgent,
    });

    return {
      ok: true,
      disputeId: dispute.id,
      escrowStatus,
      resolution: input.resolution,
    };
  }

  private async callRefundRpc(escrowId: string, actorId: string, reason: string) {
    const { error } = await supabaseAdmin().rpc('refund_escrow', {
      p_escrow_id: escrowId,
      p_refunded_by: actorId,
      p_reason: reason,
    });
    if (error) throw new DisputeInvalidStatusError(error.message);
  }

  private async callReleaseRpc(escrowId: string, actorId: string, reason: string) {
    const { error } = await supabaseAdmin().rpc('release_escrow', {
      p_escrow_id: escrowId,
      p_released_by: actorId,
      p_reason: reason,
    });
    if (error) throw new DisputeInvalidStatusError(error.message);
  }
}

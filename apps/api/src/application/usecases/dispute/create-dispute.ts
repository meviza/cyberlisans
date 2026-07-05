import type { RequestMeta } from '../../ports/auth';
import type { IEscrowRepository, IDisputeRepository } from '../../ports/escrow';
import type { IAuditRepository } from '../../ports/repositories';
import {
  EscrowNotFoundError,
  EscrowForbiddenError,
  EscrowInvalidStatusError,
  DisputeAlreadyExistsError,
  DisputeWindowExpiredError,
} from '../../../domain/errors/escrow';
import type { DisputeEntity } from '../../../domain/entities/escrow';

export interface CreateDisputeInputDTO {
  escrowId: string;
  openedBy: string;
  reason: string;
  description?: string;
  meta?: RequestMeta;
}

export interface CreateDisputeDeps {
  escrow: IEscrowRepository;
  disputes: IDisputeRepository;
  audit: IAuditRepository;
}

export interface CreateDisputeOutput {
  id: string;
  status: DisputeEntity['status'];
}

const WINDOW_DAYS = 7;

export class CreateDisputeUseCase {
  constructor(private readonly deps: CreateDisputeDeps) {}

  async execute(input: CreateDisputeInputDTO): Promise<CreateDisputeOutput> {
    const escrow = await this.deps.escrow.findById(input.escrowId);
    if (!escrow) throw new EscrowNotFoundError();
    if (escrow.customerId !== input.openedBy) throw new EscrowForbiddenError();

    if (escrow.status === 'DISPUTED') throw new DisputeAlreadyExistsError();
    if (escrow.status !== 'HELD' && escrow.status !== 'RELEASED') {
      throw new EscrowInvalidStatusError('Sadece HELD veya RELEASED escrow için itiraz açılabilir');
    }
    if (escrow.status === 'RELEASED') {
      const cutoff = new Date(Date.now() - WINDOW_DAYS * 24 * 60 * 60 * 1000);
      if (escrow.releasedAt && escrow.releasedAt < cutoff) {
        throw new DisputeWindowExpiredError();
      }
    }

    const existing = await this.deps.disputes.findByEscrow(escrow.id);
    if (existing && existing.status !== 'REJECTED' && existing.status !== 'RESOLVED') {
      throw new DisputeAlreadyExistsError();
    }

    const reason = input.description
      ? `${input.reason}: ${input.description}`.slice(0, 1000)
      : input.reason;

    const dispute = await this.deps.disputes.create({
      escrowId: escrow.id,
      orderId: escrow.orderId,
      openedById: input.openedBy,
      openedByRole: 'CUSTOMER',
      reason,
    });

    if (escrow.status === 'HELD') {
      await this.deps.escrow.updateStatus(escrow.id, 'DISPUTED');
    }

    await this.deps.audit.log({
      actorId: input.openedBy,
      action: 'CREATE',
      targetType: 'dispute',
      targetId: dispute.id,
      payload: { escrowId: escrow.id, reason: input.reason },
      ipAddress: input.meta?.ipAddress,
      userAgent: input.meta?.userAgent,
    });

    return { id: dispute.id, status: dispute.status };
  }
}

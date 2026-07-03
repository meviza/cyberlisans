import { SellerNotFoundError } from '../../../domain/errors/seller';
import type { SuspendSellerInput, SuspendSellerDeps, SellerOutput } from '../../ports/seller';
import { toSellerOutput } from '../seller/apply-seller';

export class SuspendSellerUseCase {
  constructor(private readonly deps: SuspendSellerDeps) {}

  async execute(input: SuspendSellerInput): Promise<SellerOutput> {
    const current = await this.deps.sellers.findById(input.sellerId);
    if (!current) throw new SellerNotFoundError();

    const seller = await this.deps.sellers.suspend(input.sellerId, input.adminId, input.reason);

    await this.deps.audit.log({
      actorId: input.adminId,
      action: 'STATUS_CHANGE',
      targetType: 'seller',
      targetId: seller.id,
      payload: { from: current.status, to: 'SUSPENDED', reason: input.reason },
      ipAddress: input.meta.ipAddress,
      userAgent: input.meta.userAgent,
    });

    return toSellerOutput(seller);
  }
}

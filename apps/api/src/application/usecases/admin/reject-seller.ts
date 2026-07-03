import { SellerNotFoundError } from '../../../domain/errors/seller';
import type { RejectSellerInput, RejectSellerDeps, SellerOutput } from '../../ports/seller';
import { toSellerOutput } from '../seller/apply-seller';

export class RejectSellerUseCase {
  constructor(private readonly deps: RejectSellerDeps) {}

  async execute(input: RejectSellerInput): Promise<SellerOutput> {
    const current = await this.deps.sellers.findById(input.sellerId);
    if (!current) throw new SellerNotFoundError();

    const seller = await this.deps.sellers.reject(input.sellerId, input.adminId, input.reason);

    await this.deps.audit.log({
      actorId: input.adminId,
      action: 'STATUS_CHANGE',
      targetType: 'seller',
      targetId: seller.id,
      payload: { from: current.status, to: 'REJECTED', reason: input.reason },
      ipAddress: input.meta.ipAddress,
      userAgent: input.meta.userAgent,
    });

    return toSellerOutput(seller);
  }
}

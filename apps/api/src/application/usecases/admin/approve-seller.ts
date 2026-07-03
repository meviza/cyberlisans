import { SellerNotFoundError, SellerInvalidStatusError } from '../../../domain/errors/seller';
import type { ApproveSellerInput, ApproveSellerDeps, SellerOutput } from '../../ports/seller';
import { toSellerOutput } from '../seller/apply-seller';

export class ApproveSellerUseCase {
  constructor(private readonly deps: ApproveSellerDeps) {}

  async execute(input: ApproveSellerInput): Promise<SellerOutput> {
    const current = await this.deps.sellers.findById(input.sellerId);
    if (!current) throw new SellerNotFoundError();
    if (current.status === 'APPROVED') {
      throw new SellerInvalidStatusError('Satıcı zaten onaylı');
    }

    const seller = await this.deps.sellers.approve(
      input.sellerId,
      input.adminId,
      input.notes ?? null,
    );

    await this.deps.audit.log({
      actorId: input.adminId,
      action: 'STATUS_CHANGE',
      targetType: 'seller',
      targetId: seller.id,
      payload: { from: current.status, to: 'APPROVED', notes: input.notes ?? null },
      ipAddress: input.meta.ipAddress,
      userAgent: input.meta.userAgent,
    });

    return toSellerOutput(seller);
  }
}

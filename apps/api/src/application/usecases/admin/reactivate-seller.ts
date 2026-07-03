import { SellerNotFoundError, SellerInvalidStatusError } from '../../../domain/errors/seller';
import type { ReactivateSellerInput, ReactivateSellerDeps, SellerOutput } from '../../ports/seller';
import { toSellerOutput } from '../seller/apply-seller';

export class ReactivateSellerUseCase {
  constructor(private readonly deps: ReactivateSellerDeps) {}

  async execute(input: ReactivateSellerInput): Promise<SellerOutput> {
    const current = await this.deps.sellers.findById(input.sellerId);
    if (!current) throw new SellerNotFoundError();
    if (current.status !== 'SUSPENDED') {
      throw new SellerInvalidStatusError(
        'Sadece askıya alınmış satıcılar tekrar aktifleştirilebilir',
      );
    }

    const seller = await this.deps.sellers.reactivate(input.sellerId, input.adminId);

    await this.deps.audit.log({
      actorId: input.adminId,
      action: 'STATUS_CHANGE',
      targetType: 'seller',
      targetId: seller.id,
      payload: { from: 'SUSPENDED', to: 'APPROVED' },
      ipAddress: input.meta.ipAddress,
      userAgent: input.meta.userAgent,
    });

    return toSellerOutput(seller);
  }
}

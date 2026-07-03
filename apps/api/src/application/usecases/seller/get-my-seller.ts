import type { SellerOutput } from '../../ports/seller';
import { toSellerOutput } from './apply-seller';

export class GetMySellerUseCase {
  constructor(
    private readonly deps: { sellers: import('../../ports/seller').SellerRepositoryPort },
  ) {}

  async execute(userId: string): Promise<SellerOutput | null> {
    const s = await this.deps.sellers.findByUserId(userId);
    if (!s) return null;
    return toSellerOutput(s);
  }
}

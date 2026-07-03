import { SellerNotFoundError, SellerInvalidStatusError } from '../../../domain/errors/seller';
import type { SellerOutput } from '../../ports/seller';
import { toSellerOutput } from './apply-seller';

export class GetSellerBySlugUseCase {
  constructor(
    private readonly deps: { sellers: import('../../ports/seller').SellerRepositoryPort },
  ) {}

  async execute(slug: string): Promise<SellerOutput> {
    const s = await this.deps.sellers.findBySlug(slug);
    if (!s) throw new SellerNotFoundError();
    if (s.status !== 'APPROVED') {
      throw new SellerInvalidStatusError('Satıcı henüz aktif değil');
    }
    return toSellerOutput(s);
  }
}

import type { ListSellersFilter, SellerOutput, ListPendingSellersDeps } from '../../ports/seller';
import { toSellerOutput } from '../seller/apply-seller';

export class ListAllSellersUseCase {
  constructor(private readonly deps: ListPendingSellersDeps) {}

  async execute(filter: ListSellersFilter): Promise<{ items: SellerOutput[]; total: number }> {
    const { items, total } = await this.deps.sellers.list(filter);
    return { items: items.map(toSellerOutput), total };
  }
}

export class ListPendingSellersUseCase {
  constructor(private readonly deps: ListPendingSellersDeps) {}

  async execute(page: number, limit: number): Promise<{ items: SellerOutput[]; total: number }> {
    const { items, total } = await this.deps.sellers.list({
      status: 'PENDING',
      page,
      limit,
    });
    return { items: items.map(toSellerOutput), total };
  }
}

export class GetAdminSellerUseCase {
  constructor(private readonly deps: ListPendingSellersDeps) {}

  async execute(sellerId: string): Promise<SellerOutput> {
    const s = await this.deps.sellers.findById(sellerId);
    if (!s) {
      throw new (await import('../../../domain/errors/seller')).SellerNotFoundError();
    }
    return toSellerOutput(s);
  }
}

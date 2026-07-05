import { SellerNotFoundError } from '../../../domain/errors/seller';
import type {
  ISellerProductRepository,
  SellerProductEntity,
  ProductReviewStatus,
} from '../../ports/repositories';
import type { SellerRepositoryPort } from '../../ports/seller';

export interface ListSellerProductsDeps {
  sellers: SellerRepositoryPort;
  products: ISellerProductRepository;
}

export interface ListSellerProductsInput {
  userId: string;
  status?: ProductReviewStatus;
  page: number;
  limit: number;
}

export interface ListSellerProductsOutput {
  items: SellerProductEntity[];
  total: number;
  page: number;
  limit: number;
}

export class ListSellerProductsUseCase {
  constructor(private readonly deps: ListSellerProductsDeps) {}

  async execute(input: ListSellerProductsInput): Promise<ListSellerProductsOutput> {
    const seller = await this.deps.sellers.findByUserId(input.userId);
    if (!seller) throw new SellerNotFoundError();
    const { items, total } = await this.deps.products.listForSeller({
      sellerId: seller.id,
      status: input.status,
      page: input.page,
      limit: input.limit,
    });
    return { items, total, page: input.page, limit: input.limit };
  }
}

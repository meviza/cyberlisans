import type { ISellerProductRepository, SellerProductEntity } from '../../ports/repositories';

export interface ListPendingProductsDeps {
  products: ISellerProductRepository;
}

export interface ListPendingProductsInput {
  page: number;
  limit: number;
}

export interface ListPendingProductsOutput {
  items: SellerProductEntity[];
  total: number;
  page: number;
  limit: number;
}

export class ListPendingProductsUseCase {
  constructor(private readonly deps: ListPendingProductsDeps) {}

  async execute(input: ListPendingProductsInput): Promise<ListPendingProductsOutput> {
    const { items, total } = await this.deps.products.listPendingProducts({
      page: input.page,
      limit: input.limit,
    });
    return { items, total, page: input.page, limit: input.limit };
  }
}

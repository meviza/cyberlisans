import type { Currency } from '../../../domain/entities/wallet';
import type { PaymentMethod, OrderEntity } from '../../../domain/entities/product';
import type { RequestMeta } from '../../ports/auth';
import type {
  IOrderRepository,
  IProductRepository,
  IAuditRepository,
} from '../../ports/repositories';
import {
  ProductNotFoundError,
  ProductInactiveError,
  InsufficientStockError,
  EmptyCartError,
  NoKeysAvailableError,
} from '../../../domain/errors/product';

export interface CreateOrderItemInput {
  productId: string;
  quantity: number;
}

export interface CreateOrderInput {
  userId: string;
  items: CreateOrderItemInput[];
  currency: Currency;
  paymentMethod: PaymentMethod;
  notes?: string | null;
  refCode?: string | null;
  meta: RequestMeta;
}

export interface CreateOrderRepository extends IOrderRepository {
  createWithItemsTx(input: {
    userId: string;
    items: CreateOrderItemInput[];
    currency: Currency;
    paymentMethod: PaymentMethod;
    notes: string | null;
    refCode: string | null;
  }): Promise<{ orderId: string }>;
}

export interface CreateOrderDeps {
  orders: CreateOrderRepository;
  products: IProductRepository;
  audit: IAuditRepository;
}

const MAX_RETRIES = 5;

export class CreateOrderUseCase {
  constructor(private readonly deps: CreateOrderDeps) {}

  async execute(input: CreateOrderInput): Promise<OrderEntity> {
    if (!input.items?.length) throw new EmptyCartError();
    await this.validateProducts(input.items);

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const { orderId } = await this.deps.orders.createWithItemsTx({
          userId: input.userId,
          items: input.items,
          currency: input.currency,
          paymentMethod: input.paymentMethod,
          notes: input.notes ?? null,
          refCode: input.refCode ?? null,
        });
        await this.deps.audit.log({
          actorId: input.userId,
          action: 'CREATE',
          targetType: 'order',
          targetId: orderId,
          payload: { items: input.items.length, currency: input.currency },
          ipAddress: input.meta.ipAddress,
          userAgent: input.meta.userAgent,
        });
        const order = await this.deps.orders.findById(orderId, true);
        if (!order) throw new Error('ORDER_NOT_FOUND_AFTER_CREATE');
        return order;
      } catch (err) {
        if (err instanceof ProductNotFoundError) throw err;
        if (err instanceof ProductInactiveError) throw err;
        if (err instanceof InsufficientStockError) throw err;
        if (err instanceof EmptyCartError) throw err;
        if (err instanceof NoKeysAvailableError) throw err;
        const code = (err as { code?: string })?.code;
        if (code === 'P2034' && attempt < MAX_RETRIES - 1) continue;
        throw err;
      }
    }
    throw new Error('ORDER_CREATION_CONFLICT');
  }

  private async validateProducts(items: CreateOrderItemInput[]): Promise<void> {
    for (const item of items) {
      const product = await this.deps.products.findById(item.productId);
      if (!product) throw new ProductNotFoundError();
      if (!product.isActive) throw new ProductInactiveError();
      if (product.stock < item.quantity) {
        throw new InsufficientStockError(item.productId, item.quantity, product.stock);
      }
      if (product.stock === 0) throw new NoKeysAvailableError();
    }
  }
}

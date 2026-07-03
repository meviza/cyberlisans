import { roundCurrency } from '@cyberlisans/payments/currency';
import type { RequestMeta } from '../../ports/auth';
import type {
  IOrderRepository,
  IDealerRepository,
  IDealerLinkRepository,
  IDealerSaleRepository,
  IAuditRepository,
} from '../../ports/repositories';
import type { DealerSaleEntity } from '../../../domain/entities/dealer';
import { DealerNotFoundError, DealerSaleExistsError } from '../../../domain/errors/dealer';

export interface CreateEscrowFromOrderInput {
  orderId: string;
  refCode?: string | null;
  meta: RequestMeta;
}

export interface CreateEscrowFromOrderDeps {
  orders: IOrderRepository;
  dealers: IDealerRepository;
  links: IDealerLinkRepository;
  sales: IDealerSaleRepository;
  audit: IAuditRepository;
  createEscrowTx(input: {
    dealerId: string;
    orderId: string;
    linkId: string | null;
    grossAmount: number;
    discountAmount: number;
    commissionAmount: number;
    netAmount: number;
  }): Promise<{ saleId: string }>;
}

const RETRYABLE = 'P2034';
const DUPLICATE = 'P2002';

export class CreateEscrowFromOrderUseCase {
  constructor(private readonly deps: CreateEscrowFromOrderDeps) {}

  async execute(input: CreateEscrowFromOrderInput): Promise<DealerSaleEntity | null> {
    const order = await this.deps.orders.findById(input.orderId, true);
    if (!order || (order.status !== 'PAID' && order.status !== 'FULFILLED')) return null;
    const existing = await this.deps.sales.listByOrder(order.id);
    if (existing) return existing;
    const refCode = input.refCode ?? order.refCode ?? null;
    if (!refCode) return null;

    const link = await this.deps.links.findByCode(refCode);
    if (!link || !link.isActive) return null;
    if (link.expiresAt && link.expiresAt.getTime() < Date.now()) return null;
    if (link.maxUses !== null && link.currentUses >= link.maxUses) return null;
    if (link.productId !== null && !order.items?.some((it) => it.productId === link.productId))
      return null;

    const profile = await this.deps.dealers.findById(link.dealerId);
    if (!profile) throw new DealerNotFoundError();
    if (profile.status !== 'APPROVED') return null;

    let discountAmount = 0;
    for (const it of order.items ?? []) {
      if (link.productId === null || link.productId === it.productId) {
        discountAmount += roundCurrency(
          (it.totalPrice * link.discountPercent) / 100,
          order.currency,
        );
      }
    }
    const gross = Number(order.totalAmount);
    const netAmount = roundCurrency(gross - discountAmount, order.currency);
    const commissionAmount = roundCurrency(
      (netAmount * Number(profile.commissionRate)) / 100,
      order.currency,
    );

    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        const { saleId } = await this.deps.createEscrowTx({
          dealerId: link.dealerId,
          orderId: order.id,
          linkId: link.id,
          grossAmount: gross,
          discountAmount,
          commissionAmount,
          netAmount,
        });
        await this.deps.audit.log({
          actorId: null,
          action: 'CREATE',
          targetType: 'dealer_sale',
          targetId: saleId,
          payload: { dealerId: link.dealerId, orderId: order.id, commissionAmount },
        });
        return await this.deps.sales.listByOrder(order.id);
      } catch (err) {
        if (err instanceof DealerNotFoundError) throw err;
        const code = (err as { code?: string })?.code;
        if (code === DUPLICATE) {
          const ex = await this.deps.sales.listByOrder(order.id);
          if (ex) return ex;
          throw new DealerSaleExistsError();
        }
        if (code === RETRYABLE && attempt < 4) continue;
        throw err;
      }
    }
    throw new Error('ESCROW_CREATION_FAILED');
  }
}

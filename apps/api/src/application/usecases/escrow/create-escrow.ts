import type { RequestMeta } from '../../ports/auth';
import type { IEscrowRepository, CreateEscrowInput } from '../../ports/escrow';
import type { EscrowEntity } from '../../../domain/entities/escrow';
import { EscrowAlreadyExistsError } from '../../../domain/errors/escrow';
import { SellerNotFoundError } from '../../../domain/errors/seller';
import { SellerRepository } from '../../../infrastructure/repositories/seller.repository';
import type { IAuditRepository } from '../../ports/repositories';

export interface CreateEscrowInputDTO {
  orderId: string;
  customerId: string;
  sellerId: string;
  amount: number;
  commissionRate: number;
  currency: 'TRY' | 'USD' | 'EUR' | 'USDT';
  meta?: RequestMeta;
}

export interface CreateEscrowDeps {
  escrow: IEscrowRepository;
  sellers: SellerRepository;
  audit: IAuditRepository;
}

export interface CreateEscrowOutput {
  escrowId: string;
  status: EscrowEntity['status'];
  releaseAt: string;
  payoutEligibleAt: string;
  amount: number;
  sellerAmount: number;
  commissionAmount: number;
  currency: string;
}

const HOLD_DAYS = 7;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

export class CreateEscrowUseCase {
  constructor(private readonly deps: CreateEscrowDeps) {}

  async execute(input: CreateEscrowInputDTO): Promise<CreateEscrowOutput> {
    if (input.amount <= 0) throw new EscrowAlreadyExistsError();

    const seller = await this.deps.sellers.findById(input.sellerId);
    if (!seller) throw new SellerNotFoundError();

    const existing = await this.deps.escrow.findByOrderId(input.orderId);
    if (existing) throw new EscrowAlreadyExistsError();

    const sellerAmount = round((input.amount * (100 - input.commissionRate)) / 100, input.currency);
    const commissionAmount = round(input.amount - sellerAmount, input.currency);

    const now = new Date();
    const releaseAt = new Date(now.getTime() + HOLD_DAYS * MS_PER_DAY);

    const data: CreateEscrowInput = {
      orderId: input.orderId,
      sellerId: input.sellerId,
      customerId: input.customerId,
      amount: input.amount,
      sellerAmount,
      commissionAmount,
      currency: input.currency,
      heldAt: now,
      releaseAt,
      payoutEligibleAt: releaseAt,
    };

    const escrow = await this.deps.escrow.create(data);

    await this.deps.audit.log({
      actorId: input.customerId,
      action: 'CREATE',
      targetType: 'escrow',
      targetId: escrow.id,
      payload: {
        orderId: input.orderId,
        amount: input.amount,
        sellerAmount,
        commissionAmount,
        currency: input.currency,
      },
      ipAddress: input.meta?.ipAddress,
      userAgent: input.meta?.userAgent,
    });

    return {
      escrowId: escrow.id,
      status: escrow.status,
      releaseAt: escrow.releaseAt!.toISOString(),
      payoutEligibleAt: escrow.payoutEligibleAt.toISOString(),
      amount: escrow.amount,
      sellerAmount: escrow.sellerAmount,
      commissionAmount: escrow.commissionAmount,
      currency: escrow.currency,
    };
  }
}

function round(value: number, _currency: string): number {
  return Math.round(value * 100) / 100;
}

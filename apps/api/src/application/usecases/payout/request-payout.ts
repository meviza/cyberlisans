import type { RequestMeta } from '../../ports/auth';
import type { IPayoutRepository, CreatePayoutInput } from '../../ports/escrow';
import type { SellerRepository } from '../../../infrastructure/repositories/seller.repository';
import type { IAuditRepository } from '../../ports/repositories';
import {
  PayoutMinimumAmountError,
  PayoutInsufficientBalanceError,
} from '../../../domain/errors/escrow';
import { SellerNotFoundError, SellerNotApprovedError } from '../../../domain/errors/seller';
import type { PayoutMethod, SellerPayoutEntity } from '../../../domain/entities/escrow';
import type { Currency } from '../../../domain/entities/wallet';

export interface RequestPayoutInputDTO {
  sellerId: string;
  userId: string;
  amount: number;
  method: PayoutMethod;
  destination: string;
  currency: Currency;
  notes?: string;
  meta?: RequestMeta;
}

export interface RequestPayoutDeps {
  payouts: IPayoutRepository;
  sellers: SellerRepository;
  audit: IAuditRepository;
}

export interface RequestPayoutOutput {
  payoutId: string;
  status: SellerPayoutEntity['status'];
  eta: string;
  amount: number;
  currency: Currency;
}

const MIN_AMOUNT = 50;
const ETA_DAYS = 3;

export class RequestPayoutUseCase {
  constructor(private readonly deps: RequestPayoutDeps) {}

  async execute(input: RequestPayoutInputDTO): Promise<RequestPayoutOutput> {
    if (input.amount < MIN_AMOUNT) throw new PayoutMinimumAmountError(MIN_AMOUNT);

    const seller = await this.deps.sellers.findById(input.sellerId);
    if (!seller) throw new SellerNotFoundError();
    if (seller.userId !== input.userId) throw new SellerNotFoundError();
    if (seller.status !== 'APPROVED') throw new SellerNotApprovedError();
    if (seller.kycStatus !== 'VERIFIED') throw new SellerNotApprovedError();

    const balance = Number(seller.balance);
    if (balance < input.amount) throw new PayoutInsufficientBalanceError();

    const data: CreatePayoutInput = {
      sellerId: input.sellerId,
      userId: input.userId,
      amount: input.amount,
      currency: input.currency,
      method: input.method,
      destination: input.destination,
      notes: input.notes ?? null,
      grossAmount: input.amount,
      commissionAmount: 0,
    };

    const payout = await this.deps.payouts.create(data);
    await this.deps.sellers.update(input.sellerId, {
      balance: balance - input.amount,
    });

    await this.deps.audit.log({
      actorId: input.userId,
      action: 'CREATE',
      targetType: 'seller_payout',
      targetId: payout.id,
      payload: {
        amount: input.amount,
        currency: input.currency,
        method: input.method,
      },
      ipAddress: input.meta?.ipAddress,
      userAgent: input.meta?.userAgent,
    });

    const eta = new Date(Date.now() + ETA_DAYS * 24 * 60 * 60 * 1000).toISOString();

    return {
      payoutId: payout.id,
      status: payout.status,
      eta,
      amount: payout.amount,
      currency: payout.currency,
    };
  }
}

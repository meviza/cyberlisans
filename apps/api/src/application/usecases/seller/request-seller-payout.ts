import type { Currency } from '../../../domain/entities/wallet';
import type { RequestMeta } from '../../ports/auth';
import type {
  IDealerRepository,
  IDealerPayoutRepository,
  IAuditRepository,
} from '../../ports/repositories';
import type { DealerPayoutEntity } from '../../../domain/entities/dealer';
import {
  DealerNotFoundError,
  DealerInvalidStatusError,
  DealerInsufficientBalanceError,
} from '../../../domain/errors/dealer';

export interface RequestSellerPayoutInput {
  dealerId: string;
  userId: string;
  amount: number;
  currency: Currency;
  method: 'IBAN' | 'PAPARA';
  destination: string;
  notes?: string | null;
  meta: RequestMeta;
}

export interface RequestSellerPayoutDeps {
  dealers: IDealerRepository;
  payouts: IDealerPayoutRepository;
  audit: IAuditRepository;
}

const MIN_AMOUNT = 50;

export class RequestSellerPayoutUseCase {
  constructor(private readonly deps: RequestSellerPayoutDeps) {}

  async execute(input: RequestSellerPayoutInput): Promise<DealerPayoutEntity> {
    const profile = await this.deps.dealers.findById(input.dealerId);
    if (!profile || profile.userId !== input.userId) throw new DealerNotFoundError();
    if (profile.status !== 'APPROVED') {
      throw new DealerInvalidStatusError('Sadece onaylı satıcılar ödeme talep edebilir');
    }
    if (input.amount < MIN_AMOUNT || Number(profile.balance) < input.amount) {
      throw new DealerInsufficientBalanceError();
    }

    const payout = await this.deps.payouts.create({
      dealerId: input.dealerId,
      userId: input.userId,
      amount: input.amount,
      currency: input.currency,
      method: input.method,
      destination: input.destination,
      notes: input.notes ?? null,
    });
    await this.deps.dealers.decrementBalance(input.dealerId, input.amount);

    await this.deps.audit.log({
      actorId: input.userId,
      action: 'CREATE',
      targetType: 'dealer_payout',
      targetId: payout.id,
      payload: { amount: input.amount, currency: input.currency, method: input.method },
      ipAddress: input.meta.ipAddress,
      userAgent: input.meta.userAgent,
    });

    return payout;
  }
}

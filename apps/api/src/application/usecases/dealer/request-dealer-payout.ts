import { dealerRepository } from '../../../infrastructure/repositories/dealer.repository';
import { dealerPayoutRepository } from '../../../infrastructure/repositories/dealer-payout.repository';
import { auditRepository } from '../../../infrastructure/repositories/audit.repository';
import { prisma } from '../../../infrastructure/db';
import {
  DealerNotFoundError,
  DealerInvalidStatusError,
  DealerInsufficientBalanceError,
} from '../../../domain/errors/dealer';
import type { Currency } from '../../../domain/entities/wallet';

export interface RequestDealerPayoutInput {
  dealerId: string;
  userId: string;
  amount: number;
  currency: Currency;
  method: 'IBAN' | 'PAPARA';
  destination: string;
  notes?: string | null;
  ipAddress?: string;
  userAgent?: string;
}

export async function requestDealerPayout(input: RequestDealerPayoutInput) {
  const profile = await dealerRepository.findById(input.dealerId);
  if (!profile) throw new DealerNotFoundError();
  if (profile.userId !== input.userId) throw new DealerNotFoundError();
  if (profile.status !== 'APPROVED') {
    throw new DealerInvalidStatusError('Sadece onaylı bayiler ödeme talep edebilir');
  }
  if (input.amount < 50) {
    throw new DealerInsufficientBalanceError();
  }
  if (Number(profile.balance) < input.amount) {
    throw new DealerInsufficientBalanceError();
  }
  const result = await prisma.$transaction(async (tx: typeof prisma) => {
    const updated = await tx.dealerProfile.update({
      where: { id: input.dealerId, balance: { gte: input.amount } },
      data: { balance: { decrement: input.amount } },
    });
    if (!updated) throw new DealerInsufficientBalanceError();
    const payout = await tx.dealerPayout.create({
      data: {
        dealerId: input.dealerId,
        userId: input.userId,
        amount: input.amount,
        currency: input.currency,
        method: input.method,
        destination: input.destination,
        notes: input.notes ?? null,
        status: 'PENDING',
      },
    });
    return payout;
  });
  await auditRepository.log({
    actorId: input.userId,
    action: 'CREATE',
    targetType: 'dealer_payout',
    targetId: result.id,
    payload: {
      amount: input.amount,
      currency: input.currency,
      method: input.method,
    },
    ipAddress: input.ipAddress,
    userAgent: input.userAgent,
  });
  return dealerPayoutRepository.findById(result.id);
}

export interface ListDealerPayoutsInput {
  dealerId: string;
  page: number;
  limit: number;
}

export async function listDealerPayouts(input: ListDealerPayoutsInput) {
  const profile = await dealerRepository.findById(input.dealerId);
  if (!profile) throw new DealerNotFoundError();
  return dealerPayoutRepository.listByDealer(input.dealerId, {
    page: input.page,
    limit: input.limit,
  });
}

export interface ProcessDealerPayoutInput {
  dealerId?: string;
  payoutId: string;
  adminId: string;
  action: 'approve' | 'reject' | 'complete';
  rejectionReason?: string;
  ipAddress?: string;
  userAgent?: string;
}

export async function processDealerPayout(input: ProcessDealerPayoutInput) {
  const payout = await dealerPayoutRepository.findById(input.payoutId);
  if (!payout) {
    const { DealerPayoutNotFoundError } = await import('../../../domain/errors/dealer');
    throw new DealerPayoutNotFoundError();
  }
  if (input.dealerId && payout.dealerId !== input.dealerId) {
    const { DealerPayoutNotFoundError } = await import('../../../domain/errors/dealer');
    throw new DealerPayoutNotFoundError();
  }
  if (input.action === 'approve') {
    if (payout.status !== 'PENDING') {
      throw new DealerInvalidStatusError('Sadece bekleyen talepler onaylanabilir');
    }
    const updated = await dealerPayoutRepository.updateStatus(input.payoutId, 'PROCESSING', {
      processedById: input.adminId,
    });
    await auditRepository.log({
      actorId: input.adminId,
      action: 'STATUS_CHANGE',
      targetType: 'dealer_payout',
      targetId: input.payoutId,
      payload: { from: 'PENDING', to: 'PROCESSING' },
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
    });
    return updated;
  }
  if (input.action === 'reject') {
    if (payout.status !== 'PENDING' && payout.status !== 'PROCESSING') {
      throw new DealerInvalidStatusError('Sadece bekleyen/işlemde olan talepler reddedilebilir');
    }
    const result = await prisma.$transaction(async (tx: typeof prisma) => {
      const updated = await tx.dealerPayout.update({
        where: { id: input.payoutId },
        data: {
          status: 'REJECTED',
          processedById: input.adminId,
          processedAt: new Date(),
          rejectionReason: input.rejectionReason ?? null,
        },
      });
      await tx.dealerProfile.update({
        where: { id: payout.dealerId },
        data: { balance: { increment: Number(payout.amount) } },
      });
      return updated;
    });
    await auditRepository.log({
      actorId: input.adminId,
      action: 'STATUS_CHANGE',
      targetType: 'dealer_payout',
      targetId: input.payoutId,
      payload: { from: payout.status, to: 'REJECTED', reason: input.rejectionReason ?? null },
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
    });
    return dealerPayoutRepository.findById(result.id);
  }
  if (input.action === 'complete') {
    if (payout.status !== 'PROCESSING') {
      throw new DealerInvalidStatusError('Sadece işlemde olan talepler tamamlanabilir');
    }
    const updated = await dealerPayoutRepository.updateStatus(input.payoutId, 'COMPLETED', {
      processedById: input.adminId,
    });
    await auditRepository.log({
      actorId: input.adminId,
      action: 'STATUS_CHANGE',
      targetType: 'dealer_payout',
      targetId: input.payoutId,
      payload: { from: payout.status, to: 'COMPLETED' },
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
    });
    return updated;
  }
  throw new Error('INVALID_PAYOUT_ACTION');
}

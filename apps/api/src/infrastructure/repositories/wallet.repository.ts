import { prisma } from '../db';
import { roundCurrency } from '@cyberlisans/payments/currency';
import type { IWalletRepository } from '../../application/ports/repositories';
import type {
  WalletEntity,
  WalletTransactionEntity,
  WalletTxType,
  Currency,
} from '../../domain/entities/wallet';

const MAX_RETRIES = 5;

function toEntity(w: any): WalletEntity {
  return {
    id: w.id,
    userId: w.userId,
    balanceTry: Number(w.balanceTry),
    balanceUsd: Number(w.balanceUsd),
    balanceEur: Number(w.balanceEur),
    balanceUsdt: Number(w.balanceUsdt),
    loyaltyCoins: w.loyaltyCoins,
    version: w.version,
    createdAt: w.createdAt,
    updatedAt: w.updatedAt,
  };
}

function toTxEntity(t: any): WalletTransactionEntity {
  return {
    id: t.id,
    userId: t.userId,
    type: t.type,
    currency: t.currency,
    amount: Number(t.amount),
    balanceAfter: Number(t.balanceAfter),
    referenceType: t.referenceType,
    referenceId: t.referenceId,
    description: t.description,
    metadata: t.metadata,
    createdAt: t.createdAt,
  };
}

const currencyField: Record<Currency, 'balanceTry' | 'balanceUsd' | 'balanceEur' | 'balanceUsdt'> =
  {
    TRY: 'balanceTry',
    USD: 'balanceUsd',
    EUR: 'balanceEur',
    USDT: 'balanceUsdt',
  };

export class WalletRepository implements IWalletRepository {
  async findByUserId(userId: string): Promise<WalletEntity | null> {
    const w = await prisma.wallet.findUnique({ where: { userId } });
    return w ? toEntity(w) : null;
  }

  async findById(id: string): Promise<WalletEntity | null> {
    const w = await prisma.wallet.findUnique({ where: { id } });
    return w ? toEntity(w) : null;
  }

  async credit(input: Parameters<IWalletRepository['credit']>[0]) {
    return this.atomicUpdate(input, 'credit');
  }

  async debit(input: Parameters<IWalletRepository['debit']>[0]) {
    return this.atomicUpdate(input, 'debit');
  }

  private async atomicUpdate(
    input: {
      userId: string;
      currency: Currency;
      amount: number;
      type: WalletTxType;
      description?: string;
      referenceType?: string;
      referenceId?: string;
      metadata?: Record<string, unknown>;
    },
    op: 'credit' | 'debit',
  ) {
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        return await prisma.$transaction(
          async (tx: typeof prisma) => {
            const w = await tx.wallet.findUnique({ where: { userId: input.userId } });
            if (!w) throw new Error('WALLET_NOT_FOUND');
            const field = currencyField[input.currency];
            const current = Number(w[field]);
            const next = op === 'credit' ? current + input.amount : current - input.amount;
            if (op === 'debit' && next < 0) throw new Error('INSUFFICIENT_BALANCE');
            const nextRounded = roundCurrency(next, input.currency);
            const updated = await tx.wallet.update({
              where: { id: w.id, version: w.version },
              data: { [field]: nextRounded, version: { increment: 1 } },
            });
            const transaction = await tx.walletTransaction.create({
              data: {
                userId: input.userId,
                type: input.type,
                currency: input.currency,
                amount: input.amount,
                balanceAfter: nextRounded,
                referenceType: input.referenceType ?? null,
                referenceId: input.referenceId ?? null,
                description: input.description ?? null,
                metadata: (input.metadata as any) ?? undefined,
              },
            });
            return { wallet: toEntity(updated), transaction: toTxEntity(transaction) };
          },
          { isolationLevel: 'Serializable' },
        );
      } catch (err: any) {
        if (err?.message === 'INSUFFICIENT_BALANCE') throw err;
        if (err?.message === 'WALLET_NOT_FOUND') throw err;
        if (err?.code === 'P2034' && attempt < MAX_RETRIES - 1) continue;
        throw err;
      }
    }
    throw new Error('CONCURRENT_UPDATE_FAILED');
  }

  async transfer(input: {
    fromUserId: string;
    toUserId: string;
    currency: Currency;
    amount: number;
    description?: string;
  }) {
    await this.debit({
      userId: input.fromUserId,
      currency: input.currency,
      amount: input.amount,
      type: 'GIFT_SENT',
      description: input.description,
      referenceType: 'transfer',
      referenceId: input.toUserId,
    });
    await this.credit({
      userId: input.toUserId,
      currency: input.currency,
      amount: input.amount,
      type: 'GIFT_RECEIVED',
      description: input.description,
      referenceType: 'transfer',
      referenceId: input.fromUserId,
    });
  }

  async listTransactions(input: {
    userId: string;
    type?: WalletTxType;
    cursor?: string;
    limit: number;
  }): Promise<WalletTransactionEntity[]> {
    const txs = await prisma.walletTransaction.findMany({
      where: { userId: input.userId, type: input.type },
      orderBy: { createdAt: 'desc' },
      take: input.limit + 1,
      ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
    });
    return txs.map(toTxEntity);
  }

  async addLoyaltyCoins(userId: string, coins: number): Promise<WalletEntity> {
    const w = await prisma.wallet.update({
      where: { userId },
      data: { loyaltyCoins: { increment: coins } },
    });
    return toEntity(w);
  }
}

export const walletRepository = new WalletRepository();

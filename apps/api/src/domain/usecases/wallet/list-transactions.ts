import { walletRepository } from '../../../infrastructure/repositories/wallet.repository';
import type { WalletTxType } from '../../entities/wallet';

export async function listTransactions(input: {
  userId: string;
  type?: WalletTxType;
  cursor?: string;
  limit: number;
}) {
  const txs = await walletRepository.listTransactions(input);
  return {
    items: txs.map((t) => ({
      id: t.id,
      type: t.type,
      currency: t.currency,
      amount: t.amount,
      balanceAfter: t.balanceAfter,
      description: t.description,
      createdAt: t.createdAt,
    })),
    nextCursor: txs.length > input.limit ? (txs[input.limit]?.id ?? null) : null,
  };
}

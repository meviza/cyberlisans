import { walletRepository } from '../../../infrastructure/repositories/wallet.repository';
import { auditRepository } from '../../../infrastructure/repositories/audit.repository';
import { userRepository } from '../../../infrastructure/repositories/user.repository';
import {
  InsufficientBalanceError,
  InvalidAmountError,
  UserNotFoundForAdminError,
} from '../../errors/wallet';
import type { Currency } from '../../entities/wallet';

export async function adminAdjustBalance(input: {
  adminId: string;
  userId: string;
  amount: number;
  currency: Currency;
  reason: string;
  ipAddress?: string;
  userAgent?: string;
}) {
  if (input.amount === 0) throw new InvalidAmountError('Tutar 0 olamaz');
  const user = await userRepository.findById(input.userId);
  if (!user) throw new UserNotFoundForAdminError();
  const op = input.amount > 0 ? 'credit' : 'debit';
  if (op === 'debit') {
    const abs = Math.abs(input.amount);
    const w = await walletRepository.findByUserId(input.userId);
    if (!w) throw new InsufficientBalanceError();
    const balance = {
      TRY: w.balanceTry,
      USD: w.balanceUsd,
      EUR: w.balanceEur,
      USDT: w.balanceUsdt,
    }[input.currency];
    if (balance < abs) throw new InsufficientBalanceError();
  }
  const result =
    op === 'credit'
      ? await walletRepository.credit({
          userId: input.userId,
          currency: input.currency,
          amount: Math.abs(input.amount),
          type: 'ADMIN_CREDIT',
          description: input.reason,
          referenceType: 'admin',
          referenceId: input.adminId,
        })
      : await walletRepository.debit({
          userId: input.userId,
          currency: input.currency,
          amount: Math.abs(input.amount),
          type: 'ADMIN_DEBIT',
          description: input.reason,
          referenceType: 'admin',
          referenceId: input.adminId,
        });
  await auditRepository.log({
    actorId: input.adminId,
    targetUserId: input.userId,
    action: 'BALANCE_CHANGE',
    targetType: 'wallet',
    targetId: result.wallet.id,
    payload: { amount: input.amount, currency: input.currency, reason: input.reason },
    ipAddress: input.ipAddress,
    userAgent: input.userAgent,
  });
  return { wallet: result.wallet, transaction: result.transaction };
}

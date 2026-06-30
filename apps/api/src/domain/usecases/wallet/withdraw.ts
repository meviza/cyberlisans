import { walletRepository } from '../../../infrastructure/repositories/wallet.repository';
import { InsufficientBalanceError, MinWithdrawalError } from '../../errors/wallet';
import type { Currency } from '../../entities/wallet';
import { convertCurrency } from '@cyberlisans/payments/currency';

export async function requestWithdrawal(input: {
  userId: string;
  amount: number;
  currency: Currency;
  method: 'IBAN' | 'PAPARA';
  destination: string;
}) {
  if (input.amount < 50) throw new MinWithdrawalError();
  const w = await walletRepository.findByUserId(input.userId);
  if (!w) throw new InsufficientBalanceError();
  const balance = {
    TRY: w.balanceTry,
    USD: w.balanceUsd,
    EUR: w.balanceEur,
    USDT: w.balanceUsdt,
  }[input.currency];
  if (balance < input.amount) throw new InsufficientBalanceError();
  const tryEquivalent = convertCurrency(input.amount, input.currency, 'TRY');
  return {
    success: true,
    status: 'PENDING_ADMIN_APPROVAL' as const,
    message: `Çekim talebiniz alındı. ${tryEquivalent.toFixed(2)} ₺ karşılığı. Admin onayı sonrası ${
      input.method === 'IBAN' ? 'IBAN' : 'Papara'
    } hesabınıza aktarılacak.`,
    request: {
      amount: input.amount,
      currency: input.currency,
      method: input.method,
      destination: input.destination,
    },
  };
}

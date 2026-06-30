import { walletRepository } from '../../../infrastructure/repositories/wallet.repository';
import { WalletNotFoundError } from '../../errors/wallet';

export async function getWallet(userId: string) {
  const w = await walletRepository.findByUserId(userId);
  if (!w) throw new WalletNotFoundError();
  return {
    balance: {
      TRY: w.balanceTry,
      USD: w.balanceUsd,
      EUR: w.balanceEur,
      USDT: w.balanceUsdt,
    },
    loyaltyCoins: w.loyaltyCoins,
    version: w.version,
  };
}

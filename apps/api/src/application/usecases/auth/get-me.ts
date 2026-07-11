import { supabaseAdmin } from '../../../infrastructure/db';
import { userRepository } from '../../../infrastructure/repositories/user.repository';
import { walletRepository } from '../../../infrastructure/repositories/wallet.repository';
import { UserNotFoundError } from '../../../domain/errors';

export interface MeResult {
  id: string;
  email: string;
  emailVerified: boolean;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  locale: string;
  currency: string;
  role: string;
  status: string;
  twoFactorEnabled: boolean;
  isAdult: boolean;
  marketingOptIn: boolean;
  referralCode: string;
  createdAt: Date;
  lastLoginAt: Date | null;
  wallet: {
    balanceTry: string;
    balanceUsd: string;
    balanceEur: string;
    balanceUsdt: string;
    loyaltyCoins: number;
  } | null;
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    status: string;
    totalAmount: string;
    currency: string;
    createdAt: Date;
  }>;
}

export async function getMe(userId: string): Promise<MeResult> {
  const user = await userRepository.findById(userId);
  if (!user) throw new UserNotFoundError();

  const wallet = await walletRepository.findByUserId(userId);
  const { data: ordersRaw } = await supabaseAdmin()
    .from('orders')
    .select('id,orderNumber,status,totalAmount,currency,createdAt')
    .eq('userId', userId)
    .order('createdAt', { ascending: false })
    .limit(5);

  return {
    id: user.id,
    email: user.email,
    emailVerified: user.emailVerified,
    username: user.username,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    locale: user.locale,
    currency: user.currency,
    role: user.role,
    status: user.status,
    twoFactorEnabled: user.twoFactorEnabled,
    isAdult: user.isAdult,
    marketingOptIn: user.marketingOptIn,
    referralCode: user.referralCode,
    createdAt: user.createdAt,
    lastLoginAt: user.lastLoginAt,
    wallet: wallet
      ? {
          balanceTry: wallet.balanceTry.toString(),
          balanceUsd: wallet.balanceUsd.toString(),
          balanceEur: wallet.balanceEur.toString(),
          balanceUsdt: wallet.balanceUsdt.toString(),
          loyaltyCoins: wallet.loyaltyCoins,
        }
      : null,
    recentOrders: (ordersRaw ?? []).map((o) => ({
      id: o.id as string,
      orderNumber: o.orderNumber as string,
      status: o.status as string,
      totalAmount: String(o.totalAmount),
      currency: o.currency as string,
      createdAt: new Date(o.createdAt as string),
    })),
  };
}

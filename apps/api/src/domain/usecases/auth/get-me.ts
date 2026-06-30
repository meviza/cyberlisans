import { prisma } from '../../../infrastructure/db';
import { userRepository } from '../../../infrastructure/repositories/user.repository';
import { UserNotFoundError } from '../../errors';

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

  const [wallet, orders] = await Promise.all([
    prisma.wallet.findUnique({ where: { userId } }),
    prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        orderNumber: true,
        status: true,
        totalAmount: true,
        currency: true,
        createdAt: true,
      },
    }),
  ]);

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
    recentOrders: orders.map((o: any) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      status: o.status,
      totalAmount: o.totalAmount.toString(),
      currency: o.currency,
      createdAt: o.createdAt,
    })),
  };
}
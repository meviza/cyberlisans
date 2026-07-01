import { prisma } from '../../../infrastructure/db';
import { UserNotFoundForAdminError } from '../../errors/wallet';

export interface AdminUserDetail {
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
  referredById: string | null;
  createdAt: Date;
  lastLoginAt: Date | null;
  updatedAt: Date;
  wallet: {
    id: string;
    balanceTry: number;
    balanceUsd: number;
    balanceEur: number;
    balanceUsdt: number;
    loyaltyCoins: number;
  } | null;
  counts: {
    orders: number;
    payments: number;
    auditLogs: number;
  };
}

export async function getAdminUser(userId: string): Promise<AdminUserDetail> {
  const u = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      wallet: true,
    },
  });
  if (!u) throw new UserNotFoundForAdminError();

  const [ordersCount, paymentsCount, auditCount] = await prisma.$transaction([
    prisma.order.count({ where: { userId } }),
    prisma.payment.count({ where: { userId } }),
    prisma.auditLog.count({ where: { OR: [{ actorId: userId }, { targetUserId: userId }] } }),
  ]);

  return {
    id: u.id,
    email: u.email,
    emailVerified: u.emailVerified,
    username: u.username,
    displayName: u.displayName,
    avatarUrl: u.avatarUrl,
    locale: u.locale,
    currency: u.currency,
    role: u.role,
    status: u.status,
    twoFactorEnabled: u.twoFactorEnabled,
    isAdult: u.isAdult,
    marketingOptIn: u.marketingOptIn,
    referralCode: u.referralCode,
    referredById: u.referredById,
    createdAt: u.createdAt,
    lastLoginAt: u.lastLoginAt,
    updatedAt: u.updatedAt,
    wallet: u.wallet
      ? {
          id: u.wallet.id,
          balanceTry: Number(u.wallet.balanceTry),
          balanceUsd: Number(u.wallet.balanceUsd),
          balanceEur: Number(u.wallet.balanceEur),
          balanceUsdt: Number(u.wallet.balanceUsdt),
          loyaltyCoins: u.wallet.loyaltyCoins,
        }
      : null,
    counts: {
      orders: ordersCount,
      payments: paymentsCount,
      auditLogs: auditCount,
    },
  };
}

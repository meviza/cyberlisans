import { prisma } from '../../../infrastructure/db';
import type { UserRole, UserStatus } from '../../../domain/entities/user';

export interface ListAdminUsersInput {
  search?: string;
  role?: UserRole;
  status?: UserStatus;
  createdFrom?: Date;
  createdTo?: Date;
  page?: number;
  limit?: number;
}

export interface AdminUserListItem {
  id: string;
  email: string;
  emailVerified: boolean;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  role: UserRole;
  status: UserStatus;
  twoFactorEnabled: boolean;
  isAdult: boolean;
  marketingOptIn: boolean;
  createdAt: Date;
  lastLoginAt: Date | null;
  walletBalance: {
    TRY: number;
    USD: number;
    EUR: number;
    USDT: number;
  };
}

export async function listAdminUsers(input: ListAdminUsersInput = {}) {
  const page = Math.max(1, input.page ?? 1);
  const limit = Math.min(100, Math.max(1, input.limit ?? 20));

  const where: Record<string, unknown> = {};
  if (input.role) where['role'] = input.role;
  if (input.status) where['status'] = input.status;
  if (input.createdFrom || input.createdTo) {
    where['createdAt'] = {
      ...(input.createdFrom ? { gte: input.createdFrom } : {}),
      ...(input.createdTo ? { lte: input.createdTo } : {}),
    };
  }
  if (input.search && input.search.trim().length > 0) {
    const term = input.search.trim();
    where['OR'] = [
      { email: { contains: term, mode: 'insensitive' } },
      { username: { contains: term, mode: 'insensitive' } },
      { displayName: { contains: term, mode: 'insensitive' } },
      { id: { equals: term } },
    ];
  }

  const [users, total] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        wallet: {
          select: { balanceTry: true, balanceUsd: true, balanceEur: true, balanceUsdt: true },
        },
      },
    }),
    prisma.user.count({ where }),
  ]);

  const items: AdminUserListItem[] = users.map((u: (typeof users)[number]) => ({
    id: u.id,
    email: u.email,
    emailVerified: u.emailVerified,
    username: u.username,
    displayName: u.displayName,
    avatarUrl: u.avatarUrl,
    role: u.role,
    status: u.status,
    twoFactorEnabled: u.twoFactorEnabled,
    isAdult: u.isAdult,
    marketingOptIn: u.marketingOptIn,
    createdAt: u.createdAt,
    lastLoginAt: u.lastLoginAt,
    walletBalance: {
      TRY: Number(u.wallet?.balanceTry ?? 0),
      USD: Number(u.wallet?.balanceUsd ?? 0),
      EUR: Number(u.wallet?.balanceEur ?? 0),
      USDT: Number(u.wallet?.balanceUsdt ?? 0),
    },
  }));

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit) || 1,
  };
}

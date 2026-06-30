import { prisma } from '../../infrastructure/db';
import type { IUserRepository, CreateUserInput } from '../../application/ports/repositories';
import type { UserEntity, UserStatus } from '../../domain/entities/user';

type PrismaUser = Awaited<ReturnType<typeof prisma.user.findUnique>>;

function toEntity(u: NonNullable<PrismaUser>): UserEntity {
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
    twoFactorSecret: u.twoFactorSecret,
    isAdult: u.isAdult,
    marketingOptIn: u.marketingOptIn,
    referralCode: u.referralCode,
    referredById: u.referredById,
    createdAt: u.createdAt,
    lastLoginAt: u.lastLoginAt,
  };
}

export class UserRepository implements IUserRepository {
  async findById(id: string): Promise<UserEntity | null> {
    const u = await prisma.user.findUnique({ where: { id } });
    return u ? toEntity(u) : null;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const u = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    return u ? toEntity(u) : null;
  }

  async findByUsername(username: string): Promise<UserEntity | null> {
    const u = await prisma.user.findUnique({ where: { username: username.toLowerCase() } });
    return u ? toEntity(u) : null;
  }

  async findByReferralCode(code: string): Promise<UserEntity | null> {
    const u = await prisma.user.findUnique({ where: { referralCode: code } });
    return u ? toEntity(u) : null;
  }

  async create(data: CreateUserInput): Promise<UserEntity> {
    const u = await prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        username: data.username.toLowerCase(),
        displayName: data.displayName,
        locale: data.locale,
        currency: data.currency,
        isAdult: data.isAdult,
        marketingOptIn: data.marketingOptIn,
        referralCode: data.referralCode,
        referredById: data.referredById,
        credential: { create: { passwordHash: data.passwordHash } },
        wallet: { create: {} },
      },
    });
    return toEntity(u);
  }

  async update(id: string, data: Partial<UserEntity>): Promise<UserEntity> {
    const u = await prisma.user.update({ where: { id }, data });
    return toEntity(u);
  }

  async setEmailVerified(id: string): Promise<void> {
    await prisma.user.update({
      where: { id },
      data: { emailVerified: true, status: 'ACTIVE' },
    });
  }

  async setTwoFactor(id: string, secret: string | null, enabled: boolean): Promise<void> {
    await prisma.user.update({
      where: { id },
      data: { twoFactorSecret: secret, twoFactorEnabled: enabled },
    });
  }

  async setLastLogin(id: string, date: Date): Promise<void> {
    await prisma.user.update({ where: { id }, data: { lastLoginAt: date } });
  }

  async setPassword(id: string, hash: string): Promise<void> {
    await prisma.userCredential.upsert({
      where: { userId: id },
      create: { userId: id, passwordHash: hash },
      update: { passwordHash: hash },
    });
  }

  async setStatus(id: string, status: UserStatus): Promise<void> {
    await prisma.user.update({ where: { id }, data: { status } });
  }

  async getPasswordHash(id: string): Promise<string | null> {
    const c = await prisma.userCredential.findUnique({ where: { userId: id } });
    return c?.passwordHash ?? null;
  }
}

export const userRepository = new UserRepository();

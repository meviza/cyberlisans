import { prisma } from '../../infrastructure/db';
import type { ISessionRepository, CreateSessionInput } from '../../application/ports/repositories';
import type { SessionEntity } from '../../domain/entities/session';

type PrismaSession = Awaited<ReturnType<typeof prisma.session.findUnique>>;

function toEntity(s: NonNullable<PrismaSession>): SessionEntity {
  return {
    id: s.id,
    userId: s.userId,
    refreshToken: s.refreshToken,
    refreshTokenHash: s.refreshTokenHash,
    userAgent: s.userAgent,
    ipAddress: s.ipAddress,
    expiresAt: s.expiresAt,
    createdAt: s.createdAt,
  };
}

export class SessionRepository implements ISessionRepository {
  async create(data: CreateSessionInput): Promise<SessionEntity> {
    const s = await prisma.session.create({
      data: {
        userId: data.userId,
        refreshToken: data.refreshToken,
        refreshTokenHash: data.refreshTokenHash,
        userAgent: data.userAgent,
        ipAddress: data.ipAddress,
        expiresAt: data.expiresAt,
      },
    });
    return toEntity(s);
  }

  async findByRefreshTokenHash(hash: string): Promise<SessionEntity | null> {
    const s = await prisma.session.findUnique({ where: { refreshTokenHash: hash } });
    return s ? toEntity(s) : null;
  }

  async deleteById(id: string): Promise<void> {
    await prisma.session.delete({ where: { id } });
  }

  async deleteAllForUser(userId: string): Promise<void> {
    await prisma.session.deleteMany({ where: { userId } });
  }

  async listForUser(userId: string): Promise<SessionEntity[]> {
    const sessions = await prisma.session.findMany({
      where: { userId, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
    });
    return sessions.map(toEntity);
  }
}

export const sessionRepository = new SessionRepository();

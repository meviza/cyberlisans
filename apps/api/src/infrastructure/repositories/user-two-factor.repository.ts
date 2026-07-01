import { prisma } from '../../infrastructure/db';
import type { EncryptedData } from '@cyberlisans/auth/crypto';

export interface TwoFactorRecord {
  userId: string;
  secretCipher: string;
  backupCodesHash: string[];
  enabled: boolean;
}

export class UserTwoFactorRepository {
  async findByUserId(userId: string): Promise<TwoFactorRecord | null> {
    const rec = await prisma.userTwoFactor.findUnique({ where: { userId } });
    if (!rec) return null;
    return {
      userId: rec.userId,
      secretCipher: rec.secretCipher,
      backupCodesHash: rec.backupCodesHash,
      enabled: rec.enabled,
    };
  }

  async upsert(
    userId: string,
    data: { secretCipher: EncryptedData | string; backupCodesHash: string[]; enabled: boolean },
  ): Promise<void> {
    const cipherStr =
      typeof data.secretCipher === 'string' ? data.secretCipher : JSON.stringify(data.secretCipher);
    await prisma.userTwoFactor.upsert({
      where: { userId },
      create: {
        userId,
        secretCipher: cipherStr,
        backupCodesHash: data.backupCodesHash,
        enabled: data.enabled,
      },
      update: {
        secretCipher: cipherStr,
        backupCodesHash: data.backupCodesHash,
        enabled: data.enabled,
      },
    });
  }

  async disable(userId: string): Promise<void> {
    await prisma.userTwoFactor.deleteMany({ where: { userId } });
  }
}

export const userTwoFactorRepository = new UserTwoFactorRepository();

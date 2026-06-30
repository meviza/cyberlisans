import { prisma } from '../../infrastructure/db';
import type { IConsentRepository, ConsentRecordInput } from '../../application/ports/repositories';

export class ConsentRepository implements IConsentRepository {
  async record(data: ConsentRecordInput): Promise<void> {
    await prisma.consentRecord.create({
      data: {
        userId: data.userId,
        email: data.email,
        type: data.type,
        granted: data.granted,
        documentVersion: data.documentVersion,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      },
    });
  }
}

export const consentRepository = new ConsentRepository();

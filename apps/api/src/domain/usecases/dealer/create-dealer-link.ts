import { dealerRepository } from '../../../infrastructure/repositories/dealer.repository';
import { dealerLinkRepository } from '../../../infrastructure/repositories/dealer-link.repository';
import { auditRepository } from '../../../infrastructure/repositories/audit.repository';
import {
  DealerNotFoundError,
  DealerLinkCodeTakenError,
  DealerInvalidStatusError,
} from '../../errors/dealer';

export interface CreateDealerLinkInput {
  dealerId: string;
  code: string;
  productId?: string | null;
  discountPercent?: number;
  maxUses?: number | null;
  expiresAt?: Date | null;
  ipAddress?: string;
  userAgent?: string;
}

function normalizeCode(code: string): string {
  return code
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_-]/g, '');
}

export async function createDealerLink(input: CreateDealerLinkInput) {
  const profile = await dealerRepository.findById(input.dealerId);
  if (!profile) throw new DealerNotFoundError();
  if (profile.status !== 'APPROVED') {
    throw new DealerInvalidStatusError('Sadece onaylı bayiler link oluşturabilir');
  }
  const code = normalizeCode(input.code);
  if (code.length < 3 || code.length > 60) {
    throw new DealerLinkCodeTakenError();
  }
  const existing = await dealerLinkRepository.findByCode(code);
  if (existing) throw new DealerLinkCodeTakenError();
  const link = await dealerLinkRepository.create({
    dealerId: input.dealerId,
    code,
    productId: input.productId ?? null,
    discountPercent: input.discountPercent ?? 0,
    maxUses: input.maxUses ?? null,
    expiresAt: input.expiresAt ?? null,
  });
  await auditRepository.log({
    actorId: profile.userId,
    action: 'CREATE',
    targetType: 'dealer_link',
    targetId: link.id,
    payload: { code: link.code, discountPercent: link.discountPercent },
    ipAddress: input.ipAddress,
    userAgent: input.userAgent,
  });
  return link;
}

import { dealerLinkRepository } from '../../../infrastructure/repositories/dealer-link.repository';
import { DealerLinkNotFoundError } from '../../errors/dealer';

export interface ResolvedDealerLink {
  dealerId: string;
  productId: string | null;
  discountPercent: number;
  isActive: boolean;
  code: string;
}

export async function resolveDealerLink(code: string): Promise<ResolvedDealerLink | null> {
  const link = await dealerLinkRepository.findByCode(code);
  if (!link) return null;
  if (!link.isActive) return null;
  if (link.expiresAt && link.expiresAt.getTime() < Date.now()) return null;
  if (link.maxUses !== null && link.currentUses >= link.maxUses) return null;
  await dealerLinkRepository.incrementClicks(link.id);
  return {
    dealerId: link.dealerId,
    productId: link.productId,
    discountPercent: link.discountPercent,
    isActive: link.isActive,
    code: link.code,
  };
}

export async function getDealerLinkByCode(code: string) {
  const link = await dealerLinkRepository.findByCode(code);
  if (!link) throw new DealerLinkNotFoundError();
  return link;
}

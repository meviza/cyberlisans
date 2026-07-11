import { dealerLinkRepository } from '../../../infrastructure/repositories/dealer-link.repository';
import { dealerRepository } from '../../../infrastructure/repositories/dealer.repository';
import { DealerLinkNotFoundError } from '../../../domain/errors/dealer';

export interface ResolvedDealerLink {
  dealerId: string;
  productId: string | null;
  productSlug?: string | null;
  discountPercent: number;
  isActive: boolean;
  code: string;
}

export async function resolveDealerLink(code: string): Promise<ResolvedDealerLink | null> {
  const normalized = code
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_-]/g, '');
  const link = await dealerLinkRepository.findByCode(normalized);
  if (!link) return null;
  const dealer = await dealerRepository.findById(link.dealerId);
  if (!dealer || dealer.status !== 'APPROVED') return null;
  if (!link.isActive) return null;
  if (link.expiresAt && link.expiresAt.getTime() < Date.now()) return null;
  if (link.maxUses !== null && link.currentUses >= link.maxUses) return null;
  await dealerLinkRepository.incrementClicks(link.id);
  return {
    dealerId: link.dealerId,
    productId: link.productId,
    productSlug: link.productSlug ?? null,
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

import { dealerRepository } from '../../../infrastructure/repositories/dealer.repository';
import { dealerLinkRepository } from '../../../infrastructure/repositories/dealer-link.repository';
import { DealerNotFoundError, DealerLinkNotFoundError } from '../../errors/dealer';

export interface ListDealerLinksInput {
  dealerId: string;
  page: number;
  limit: number;
  isActive?: boolean;
}

export async function listDealerLinks(input: ListDealerLinksInput) {
  const profile = await dealerRepository.findById(input.dealerId);
  if (!profile) throw new DealerNotFoundError();
  return dealerLinkRepository.listByDealer(input.dealerId, {
    page: input.page,
    limit: input.limit,
    isActive: input.isActive,
  });
}

export interface UpdateDealerLinkInput {
  linkId: string;
  dealerId: string;
  data: {
    discountPercent?: number;
    maxUses?: number | null;
    isActive?: boolean;
    expiresAt?: Date | null;
    productId?: string | null;
  };
  ipAddress?: string;
  userAgent?: string;
}

export async function updateDealerLink(input: UpdateDealerLinkInput) {
  const profile = await dealerRepository.findById(input.dealerId);
  if (!profile) throw new DealerNotFoundError();
  if (profile.status !== 'APPROVED' && input.data.isActive === true) {
    const { DealerInvalidStatusError } = await import('../../errors/dealer');
    throw new DealerInvalidStatusError('Sadece onaylı bayiler link aktive edebilir');
  }
  const link = await dealerLinkRepository.findById(input.linkId);
  if (!link) throw new DealerLinkNotFoundError();
  if (link.dealerId !== input.dealerId) throw new DealerLinkNotFoundError();
  const allowed: Record<string, unknown> = {};
  if (input.data.discountPercent !== undefined)
    allowed['discountPercent'] = input.data.discountPercent;
  if (input.data.maxUses !== undefined) allowed['maxUses'] = input.data.maxUses;
  if (input.data.isActive !== undefined) allowed['isActive'] = input.data.isActive;
  if (input.data.expiresAt !== undefined) allowed['expiresAt'] = input.data.expiresAt;
  if (input.data.productId !== undefined) allowed['productId'] = input.data.productId;
  if (Object.keys(allowed).length === 0) return link;
  return dealerLinkRepository.update(input.linkId, allowed);
}

export interface DeleteDealerLinkInput {
  linkId: string;
  dealerId: string;
}

export async function deleteDealerLink(input: DeleteDealerLinkInput) {
  const profile = await dealerRepository.findById(input.dealerId);
  if (!profile) throw new DealerNotFoundError();
  const link = await dealerLinkRepository.findById(input.linkId);
  if (!link) throw new DealerLinkNotFoundError();
  if (link.dealerId !== input.dealerId) throw new DealerLinkNotFoundError();
  await dealerLinkRepository.delete(input.linkId);
}

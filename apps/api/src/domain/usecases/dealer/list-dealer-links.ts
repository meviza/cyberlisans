import { dealerRepository } from '../../../infrastructure/repositories/dealer.repository';
import { dealerLinkRepository } from '../../../infrastructure/repositories/dealer-link.repository';
import { DealerNotFoundError, DealerLinkNotFoundError } from '../../errors/dealer';

export interface ListDealerLinksInput {
  dealerId: string;
  page: number;
  limit: number;
}

export async function listDealerLinks(input: ListDealerLinksInput) {
  const profile = await dealerRepository.findById(input.dealerId);
  if (!profile) throw new DealerNotFoundError();
  return dealerLinkRepository.listByDealer(input.dealerId, {
    page: input.page,
    limit: input.limit,
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
  };
  ipAddress?: string;
  userAgent?: string;
}

export async function updateDealerLink(input: UpdateDealerLinkInput) {
  const link = await dealerLinkRepository.findById(input.linkId);
  if (!link) throw new DealerLinkNotFoundError();
  if (link.dealerId !== input.dealerId) throw new DealerLinkNotFoundError();
  const allowed: Record<string, unknown> = {};
  if (input.data.discountPercent !== undefined)
    allowed['discountPercent'] = input.data.discountPercent;
  if (input.data.maxUses !== undefined) allowed['maxUses'] = input.data.maxUses;
  if (input.data.isActive !== undefined) allowed['isActive'] = input.data.isActive;
  if (input.data.expiresAt !== undefined) allowed['expiresAt'] = input.data.expiresAt;
  if (Object.keys(allowed).length === 0) return link;
  return dealerLinkRepository.update(input.linkId, allowed);
}

export interface DeleteDealerLinkInput {
  linkId: string;
  dealerId: string;
}

export async function deleteDealerLink(input: DeleteDealerLinkInput) {
  const link = await dealerLinkRepository.findById(input.linkId);
  if (!link) throw new DealerLinkNotFoundError();
  if (link.dealerId !== input.dealerId) throw new DealerLinkNotFoundError();
  await dealerLinkRepository.delete(input.linkId);
}

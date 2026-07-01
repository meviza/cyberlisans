import { dealerRepository } from '../../../infrastructure/repositories/dealer.repository';
import { auditRepository } from '../../../infrastructure/repositories/audit.repository';
import { DealerNotFoundError } from '../../errors/dealer';

export interface UpdateDealerProfileInput {
  dealerId: string;
  actorId: string;
  isAdmin: boolean;
  data: {
    companyName?: string;
    taxOffice?: string | null;
    address?: string | null;
    phone?: string | null;
    websiteUrl?: string | null;
    logoUrl?: string | null;
    notes?: string | null;
    commissionRate?: number;
  };
  ipAddress?: string;
  userAgent?: string;
}

export async function updateDealerProfile(input: UpdateDealerProfileInput) {
  const existing = await dealerRepository.findById(input.dealerId);
  if (!existing) throw new DealerNotFoundError();
  const allowed: Record<string, unknown> = {};
  if (input.isAdmin) {
    if (input.data.companyName !== undefined) allowed['companyName'] = input.data.companyName;
    if (input.data.taxOffice !== undefined) allowed['taxOffice'] = input.data.taxOffice;
    if (input.data.address !== undefined) allowed['address'] = input.data.address;
    if (input.data.phone !== undefined) allowed['phone'] = input.data.phone;
    if (input.data.websiteUrl !== undefined) allowed['websiteUrl'] = input.data.websiteUrl;
    if (input.data.logoUrl !== undefined) allowed['logoUrl'] = input.data.logoUrl;
    if (input.data.notes !== undefined) allowed['notes'] = input.data.notes;
    if (input.data.commissionRate !== undefined)
      allowed['commissionRate'] = input.data.commissionRate;
  } else {
    if (input.data.taxOffice !== undefined) allowed['taxOffice'] = input.data.taxOffice;
    if (input.data.address !== undefined) allowed['address'] = input.data.address;
    if (input.data.phone !== undefined) allowed['phone'] = input.data.phone;
    if (input.data.websiteUrl !== undefined) allowed['websiteUrl'] = input.data.websiteUrl;
    if (input.data.logoUrl !== undefined) allowed['logoUrl'] = input.data.logoUrl;
  }
  if (Object.keys(allowed).length === 0) return existing;
  const updated = await dealerRepository.update(input.dealerId, allowed);
  await auditRepository.log({
    actorId: input.actorId,
    action: 'UPDATE',
    targetType: 'dealer_profile',
    targetId: input.dealerId,
    payload: { changed: Object.keys(allowed) },
    ipAddress: input.ipAddress,
    userAgent: input.userAgent,
  });
  return updated;
}

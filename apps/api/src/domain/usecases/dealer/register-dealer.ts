import { dealerRepository } from '../../../infrastructure/repositories/dealer.repository';
import { userRepository } from '../../../infrastructure/repositories/user.repository';
import { auditRepository } from '../../../infrastructure/repositories/audit.repository';
import { DealerProfileExistsError, DealerNotFoundError } from '../../errors/dealer';
import { UserNotFoundForAdminError } from '../../errors/wallet';

export interface RegisterDealerInput {
  userId: string;
  companyName: string;
  taxId: string;
  taxOffice?: string | null;
  address?: string | null;
  phone?: string | null;
  websiteUrl?: string | null;
  logoUrl?: string | null;
  ipAddress?: string;
  userAgent?: string;
}

export async function registerDealer(input: RegisterDealerInput) {
  const user = await userRepository.findById(input.userId);
  if (!user) throw new UserNotFoundForAdminError();
  const existing = await dealerRepository.findByUserId(input.userId);
  if (existing) throw new DealerProfileExistsError();
  const profile = await dealerRepository.create({
    userId: input.userId,
    companyName: input.companyName,
    taxId: input.taxId,
    taxOffice: input.taxOffice ?? null,
    address: input.address ?? null,
    phone: input.phone ?? null,
    websiteUrl: input.websiteUrl ?? null,
    logoUrl: input.logoUrl ?? null,
  });
  await auditRepository.log({
    actorId: input.userId,
    action: 'CREATE',
    targetType: 'dealer_profile',
    targetId: profile.id,
    payload: { companyName: input.companyName, taxId: input.taxId },
    ipAddress: input.ipAddress,
    userAgent: input.userAgent,
  });
  return profile;
}

export async function getDealerById(id: string) {
  const profile = await dealerRepository.findById(id);
  if (!profile) throw new DealerNotFoundError();
  return profile;
}

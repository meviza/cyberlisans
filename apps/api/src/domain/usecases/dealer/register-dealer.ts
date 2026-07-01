import { dealerRepository } from '../../../infrastructure/repositories/dealer.repository';
import { userRepository } from '../../../infrastructure/repositories/user.repository';
import { auditRepository } from '../../../infrastructure/repositories/audit.repository';
import { DealerProfileExistsError, DealerNotFoundError } from '../../errors/dealer';
import { UserNotFoundForAdminError } from '../../errors/wallet';
import { mailTemplates, getMailService } from '../../../infrastructure/mail';

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

export interface RegisterDealerResult {
  id: string;
  userId: string;
  companyName: string;
  status: string;
  twoFactorRequired: boolean;
  twoFactorSetupUrl: string;
}

export async function registerDealer(input: RegisterDealerInput): Promise<RegisterDealerResult> {
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

  const twoFactorRequired = !user.twoFactorEnabled;
  const appUrl = process.env['NEXT_PUBLIC_APP_URL'] ?? 'http://localhost:3000';
  const twoFactorSetupUrl = `${appUrl}/auth/2fa/setup`;

  if (twoFactorRequired) {
    try {
      const tpl = mailTemplates.twoFactorMandatoryWarning({
        email: user.email,
        setupUrl: twoFactorSetupUrl,
      });
      await getMailService().send({ to: user.email, ...tpl });
    } catch (err) {
      console.error('[register-dealer] 2fa mail failed', err);
    }
  }

  return {
    id: profile.id,
    userId: profile.userId,
    companyName: profile.companyName,
    status: profile.status,
    twoFactorRequired,
    twoFactorSetupUrl,
  };
}

export async function getDealerById(id: string) {
  const profile = await dealerRepository.findById(id);
  if (!profile) throw new DealerNotFoundError();
  return profile;
}

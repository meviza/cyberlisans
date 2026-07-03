import { AlreadyHasSellerError, SellerSlugTakenError } from '../../../domain/errors/seller';
import type { ApplySellerInput, ApplySellerDeps, SellerOutput } from '../../ports/seller';
import type { RequestMeta } from '../../ports/auth';

export class ApplySellerUseCase {
  constructor(private readonly deps: ApplySellerDeps) {}

  async execute(input: ApplySellerInput, meta: RequestMeta): Promise<SellerOutput> {
    const existing = await this.deps.sellers.findByUserId(input.userId);
    if (existing) throw new AlreadyHasSellerError();

    const slugTaken = await this.deps.sellers.findBySlug(input.slug);
    if (slugTaken) throw new SellerSlugTakenError();

    const seller = await this.deps.sellers.create({
      userId: input.userId,
      companyName: input.companyName,
      taxId: input.taxId,
      taxOffice: input.taxOffice ?? null,
      address: input.address ?? null,
      phone: input.phone ?? null,
      websiteUrl: input.websiteUrl ?? null,
      logoUrl: input.logoUrl ?? null,
      bio: input.bio ?? null,
      slug: input.slug,
      status: 'PENDING',
      kycStatus: 'PENDING',
    });

    await this.deps.audit.log({
      actorId: input.userId,
      action: 'CREATE',
      targetType: 'seller',
      targetId: seller.id,
      payload: { event: 'apply', slug: input.slug },
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    });

    return toSellerOutput(seller);
  }
}

export function toSellerOutput(
  s: NonNullable<Awaited<ReturnType<ApplySellerDeps['sellers']['findById']>>>,
): SellerOutput {
  return {
    id: s.id,
    userId: s.userId,
    slug: s.slug,
    companyName: s.companyName,
    taxId: s.taxId,
    taxOffice: s.taxOffice,
    address: s.address,
    phone: s.phone,
    websiteUrl: s.websiteUrl,
    logoUrl: s.logoUrl,
    bio: s.bio,
    commissionRate: Number(s.commissionRate),
    balance: Number(s.balance),
    status: s.status,
    kycStatus: s.kycStatus,
    approvedById: s.approvedById,
    approvedAt: s.approvedAt,
    rejectionReason: s.rejectionReason,
    notes: s.notes,
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
  };
}

import { prisma } from '../db';
import type {
  SellerRepositoryPort,
  SellerEntity,
  ListSellersFilter,
} from '../../application/ports/seller';

function toEntity(s: any): SellerEntity {
  return {
    id: s.id,
    userId: s.userId,
    slug: s.slug,
    companyName: s.companyName,
    taxId: s.taxId,
    taxOffice: s.taxOffice ?? null,
    address: s.address ?? null,
    phone: s.phone ?? null,
    websiteUrl: s.websiteUrl ?? null,
    logoUrl: s.logoUrl ?? null,
    bio: s.bio ?? null,
    commissionRate: Number(s.commissionRate),
    balance: Number(s.balance),
    status: s.status,
    kycStatus: s.kycStatus,
    approvedById: s.approvedById ?? null,
    approvedAt: s.approvedAt ?? null,
    rejectionReason: s.rejectionReason ?? null,
    notes: s.notes ?? null,
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
  };
}

export class SellerRepository implements SellerRepositoryPort {
  async findByUserId(userId: string): Promise<SellerEntity | null> {
    const s = await prisma.seller.findUnique({ where: { userId } });
    return s ? toEntity(s) : null;
  }

  async findById(id: string): Promise<SellerEntity | null> {
    const s = await prisma.seller.findUnique({ where: { id } });
    return s ? toEntity(s) : null;
  }

  async findBySlug(slug: string): Promise<SellerEntity | null> {
    const s = await prisma.seller.findUnique({ where: { slug } });
    return s ? toEntity(s) : null;
  }

  async create(data: Parameters<SellerRepositoryPort['create']>[0]): Promise<SellerEntity> {
    const s = await prisma.seller.create({
      data: {
        userId: data.userId,
        slug: data.slug,
        companyName: data.companyName,
        taxId: data.taxId,
        taxOffice: data.taxOffice,
        address: data.address,
        phone: data.phone,
        websiteUrl: data.websiteUrl,
        logoUrl: data.logoUrl,
        bio: data.bio,
        commissionRate: 12.0,
        balance: 0,
        status: data.status,
        kycStatus: data.kycStatus,
      },
    });
    return toEntity(s);
  }

  async update(id: string, data: Partial<SellerEntity>): Promise<SellerEntity> {
    const s = await prisma.seller.update({ where: { id }, data });
    return toEntity(s);
  }

  async list(filter: ListSellersFilter): Promise<{ items: SellerEntity[]; total: number }> {
    const where: any = {};
    if (filter.status) where.status = filter.status;
    if (filter.kycStatus) where.kycStatus = filter.kycStatus;
    if (filter.search) {
      where.OR = [
        { companyName: { contains: filter.search, mode: 'insensitive' } },
        { slug: { contains: filter.search, mode: 'insensitive' } },
      ];
    }
    const [items, total] = await prisma.$transaction([
      prisma.seller.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (filter.page - 1) * filter.limit,
        take: filter.limit,
      }),
      prisma.seller.count({ where }),
    ]);
    return { items: items.map((i: any) => toEntity(i)), total };
  }

  async approve(id: string, adminId: string, notes?: string | null): Promise<SellerEntity> {
    const s = await prisma.seller.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedById: adminId,
        approvedAt: new Date(),
        rejectionReason: null,
        notes: notes ?? null,
        kycStatus: 'VERIFIED',
      },
    });
    return toEntity(s);
  }

  async reject(id: string, _adminId: string, reason: string): Promise<SellerEntity> {
    const s = await prisma.seller.update({
      where: { id },
      data: { status: 'REJECTED', rejectionReason: reason, kycStatus: 'REJECTED' },
    });
    return toEntity(s);
  }

  async suspend(id: string, _adminId: string, reason: string): Promise<SellerEntity> {
    const s = await prisma.seller.update({
      where: { id },
      data: { status: 'SUSPENDED', rejectionReason: reason },
    });
    return toEntity(s);
  }

  async reactivate(id: string, _adminId: string): Promise<SellerEntity> {
    const s = await prisma.seller.update({
      where: { id },
      data: { status: 'APPROVED', rejectionReason: null },
    });
    return toEntity(s);
  }
}

export const sellerRepository = new SellerRepository();

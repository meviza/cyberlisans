import { supabaseAdmin, dbError } from '../db';
import type {
  SellerRepositoryPort,
  SellerEntity,
  ListSellersFilter,
} from '../../application/ports/seller';

type Row = Record<string, unknown>;

function toEntity(s: Row): SellerEntity {
  return {
    id: s['id'] as string,
    userId: s['userId'] as string,
    slug: s['slug'] as string,
    companyName: s['companyName'] as string,
    taxId: s['taxId'] as string,
    taxOffice: (s['taxOffice'] as string | null) ?? null,
    address: (s['address'] as string | null) ?? null,
    phone: (s['phone'] as string | null) ?? null,
    websiteUrl: (s['websiteUrl'] as string | null) ?? null,
    logoUrl: (s['logoUrl'] as string | null) ?? null,
    bio: (s['bio'] as string | null) ?? null,
    commissionRate: Number(s['commissionRate']),
    balance: Number(s['balance']),
    status: s['status'] as SellerEntity['status'],
    kycStatus: s['kycStatus'] as SellerEntity['kycStatus'],
    approvedById: (s['approvedById'] as string | null) ?? null,
    approvedAt: s['approvedAt'] ? new Date(s['approvedAt'] as string) : null,
    rejectionReason: (s['rejectionReason'] as string | null) ?? null,
    notes: (s['notes'] as string | null) ?? null,
    createdAt: new Date(s['createdAt'] as string),
    updatedAt: new Date(s['updatedAt'] as string),
  };
}

export class SellerRepository implements SellerRepositoryPort {
  async findByUserId(userId: string): Promise<SellerEntity | null> {
    const { data, error } = await supabaseAdmin()
      .from('sellers')
      .select('*')
      .eq('userId', userId)
      .maybeSingle();
    if (error) {
      if ((error as { code?: string }).code === 'PGRST205') return null;
      throw dbError(error);
    }
    return data ? toEntity(data) : null;
  }

  async findById(id: string): Promise<SellerEntity | null> {
    const { data, error } = await supabaseAdmin()
      .from('sellers')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) {
      if ((error as { code?: string }).code === 'PGRST205') return null;
      throw dbError(error);
    }
    return data ? toEntity(data) : null;
  }

  async findBySlug(slug: string): Promise<SellerEntity | null> {
    const { data, error } = await supabaseAdmin()
      .from('sellers')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();
    if (error) {
      if ((error as { code?: string }).code === 'PGRST205') return null;
      throw dbError(error);
    }
    return data ? toEntity(data) : null;
  }

  async create(data: Parameters<SellerRepositoryPort['create']>[0]): Promise<SellerEntity> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const insert = {
      id,
      userId: data.userId,
      slug: data.slug,
      companyName: data.companyName,
      taxId: data.taxId,
      taxOffice: data.taxOffice ?? null,
      address: data.address ?? null,
      phone: data.phone ?? null,
      websiteUrl: data.websiteUrl ?? null,
      logoUrl: data.logoUrl ?? null,
      bio: data.bio ?? null,
      commissionRate: 12.0,
      balance: 0,
      status: data.status,
      kycStatus: data.kycStatus,
      createdAt: now,
      updatedAt: now,
    };
    const { data: row, error } = await supabaseAdmin()
      .from('sellers')
      .insert(insert)
      .select('*')
      .single();
    if (error || !row) throw dbError(error);
    return toEntity(row);
  }

  async update(id: string, data: Partial<SellerEntity>): Promise<SellerEntity> {
    const patch: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(data)) {
      if (v !== undefined) {
        patch[k] = v instanceof Date ? v.toISOString() : v;
      }
    }
    patch['updatedAt'] = new Date().toISOString();
    const { data: row, error } = await supabaseAdmin()
      .from('sellers')
      .update(patch)
      .eq('id', id)
      .select('*')
      .single();
    if (error || !row) throw dbError(error);
    return toEntity(row);
  }

  async list(filter: ListSellersFilter): Promise<{ items: SellerEntity[]; total: number }> {
    let q = supabaseAdmin().from('sellers').select('*', { count: 'exact' });
    if (filter.status) q = q.eq('status', filter.status);
    if (filter.kycStatus) q = q.eq('kycStatus', filter.kycStatus);
    q = q.order('createdAt', { ascending: false });
    const from = (filter.page - 1) * filter.limit;
    q = q.range(from, from + filter.limit - 1);
    const { data, error, count } = await q;
    if (error) throw dbError(error);
    return { items: (data ?? []).map((r) => toEntity(r)), total: count ?? 0 };
  }

  async approve(id: string, adminId: string, notes?: string | null): Promise<SellerEntity> {
    const { data: row, error } = await supabaseAdmin()
      .from('sellers')
      .update({
        status: 'APPROVED',
        approvedById: adminId,
        approvedAt: new Date().toISOString(),
        rejectionReason: null,
        notes: notes ?? null,
        kycStatus: 'VERIFIED',
        updatedAt: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*')
      .single();
    if (error || !row) throw dbError(error);
    return toEntity(row);
  }

  async reject(id: string, _adminId: string, reason: string): Promise<SellerEntity> {
    const { data: row, error } = await supabaseAdmin()
      .from('sellers')
      .update({
        status: 'REJECTED',
        rejectionReason: reason,
        kycStatus: 'REJECTED',
        updatedAt: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*')
      .single();
    if (error || !row) throw dbError(error);
    return toEntity(row);
  }

  async suspend(id: string, _adminId: string, reason: string): Promise<SellerEntity> {
    const { data: row, error } = await supabaseAdmin()
      .from('sellers')
      .update({
        status: 'SUSPENDED',
        rejectionReason: reason,
        updatedAt: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*')
      .single();
    if (error || !row) throw dbError(error);
    return toEntity(row);
  }

  async reactivate(id: string, _adminId: string): Promise<SellerEntity> {
    const { data: row, error } = await supabaseAdmin()
      .from('sellers')
      .update({
        status: 'APPROVED',
        rejectionReason: null,
        updatedAt: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*')
      .single();
    if (error || !row) throw dbError(error);
    return toEntity(row);
  }
}

export const sellerRepository = new SellerRepository();

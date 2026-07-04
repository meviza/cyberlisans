import { supabaseAdmin, dbError } from '../db';
import type { IBrandRepository } from '../../application/ports/repositories';
import type { BrandEntity } from '../../domain/entities/product';

type Row = {
  id: string;
  slug: string;
  name: string;
  logoUrl: string | null;
  websiteUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

function toEntity(b: Row): BrandEntity {
  return {
    id: b.id,
    slug: b.slug,
    name: b.name,
    logoUrl: b.logoUrl ?? null,
    websiteUrl: b.websiteUrl ?? null,
    isActive: b.isActive,
    createdAt: new Date(b.createdAt),
    updatedAt: new Date(b.updatedAt),
  };
}

export class BrandRepository implements IBrandRepository {
  async list(filter: { isActive?: boolean }): Promise<BrandEntity[]> {
    let q = supabaseAdmin().from('brands').select('*');
    if (filter.isActive !== undefined) q = q.eq('isActive', filter.isActive);
    q = q.order('name', { ascending: true });
    const { data, error } = await q;
    if (error) throw dbError(error);
    return (data ?? []).map((r) => toEntity(r as Row));
  }

  async findById(id: string): Promise<BrandEntity | null> {
    const { data, error } = await supabaseAdmin()
      .from('brands')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw dbError(error);
    return data ? toEntity(data as Row) : null;
  }

  async findBySlug(slug: string): Promise<BrandEntity | null> {
    const { data, error } = await supabaseAdmin()
      .from('brands')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();
    if (error) throw dbError(error);
    return data ? toEntity(data as Row) : null;
  }

  async create(data: {
    slug: string;
    name: string;
    logoUrl?: string | null;
    websiteUrl?: string | null;
    isActive?: boolean;
  }): Promise<BrandEntity> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const { data: b, error } = await supabaseAdmin()
      .from('brands')
      .insert({
        id,
        slug: data.slug,
        name: data.name,
        logoUrl: data.logoUrl ?? null,
        websiteUrl: data.websiteUrl ?? null,
        isActive: data.isActive ?? true,
        createdAt: now,
        updatedAt: now,
      })
      .select('*')
      .single();
    if (error || !b) throw dbError(error);
    return toEntity(b as Row);
  }

  async update(id: string, data: Partial<BrandEntity>): Promise<BrandEntity> {
    const patch: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(data)) {
      if (v === undefined) continue;
      patch[k] = v instanceof Date ? v.toISOString() : v;
    }
    patch['updatedAt'] = new Date().toISOString();
    const { data: b, error } = await supabaseAdmin()
      .from('brands')
      .update(patch)
      .eq('id', id)
      .select('*')
      .single();
    if (error || !b) throw dbError(error);
    return toEntity(b as Row);
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabaseAdmin().from('brands').delete().eq('id', id);
    if (error) throw dbError(error);
  }
}

export const brandRepository = new BrandRepository();

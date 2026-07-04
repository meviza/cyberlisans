import { supabaseAdmin, dbError } from '../db';
import type { ICategoryRepository } from '../../application/ports/repositories';
import type { CategoryEntity } from '../../domain/entities/product';

type Row = {
  id: string;
  slug: string;
  name: string;
  nameEn: string | null;
  nameDe: string | null;
  nameAr: string | null;
  nameRu: string | null;
  icon: string | null;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

function toEntity(c: Row): CategoryEntity {
  return {
    id: c.id,
    slug: c.slug,
    name: c.name,
    nameEn: c.nameEn ?? null,
    nameDe: c.nameDe ?? null,
    nameAr: c.nameAr ?? null,
    nameRu: c.nameRu ?? null,
    icon: c.icon ?? null,
    description: c.description ?? null,
    sortOrder: c.sortOrder,
    isActive: c.isActive,
    createdAt: new Date(c.createdAt),
    updatedAt: new Date(c.updatedAt),
  };
}

export class CategoryRepository implements ICategoryRepository {
  async list(filter: { isActive?: boolean }): Promise<CategoryEntity[]> {
    let q = supabaseAdmin().from('categories').select('*');
    if (filter.isActive !== undefined) q = q.eq('isActive', filter.isActive);
    q = q.order('sortOrder', { ascending: true }).order('name', { ascending: true });
    const { data, error } = await q;
    if (error) throw dbError(error);
    return (data ?? []).map((r) => toEntity(r as Row));
  }

  async findById(id: string): Promise<CategoryEntity | null> {
    const { data, error } = await supabaseAdmin()
      .from('categories')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw dbError(error);
    return data ? toEntity(data as Row) : null;
  }

  async findBySlug(slug: string): Promise<CategoryEntity | null> {
    const { data, error } = await supabaseAdmin()
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();
    if (error) throw dbError(error);
    return data ? toEntity(data as Row) : null;
  }

  async create(data: {
    slug: string;
    name: string;
    nameEn?: string | null;
    nameDe?: string | null;
    nameAr?: string | null;
    nameRu?: string | null;
    icon?: string | null;
    description?: string | null;
    sortOrder?: number;
    isActive?: boolean;
  }): Promise<CategoryEntity> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const { data: c, error } = await supabaseAdmin()
      .from('categories')
      .insert({
        id,
        slug: data.slug,
        name: data.name,
        nameEn: data.nameEn ?? null,
        nameDe: data.nameDe ?? null,
        nameAr: data.nameAr ?? null,
        nameRu: data.nameRu ?? null,
        icon: data.icon ?? null,
        description: data.description ?? null,
        sortOrder: data.sortOrder ?? 0,
        isActive: data.isActive ?? true,
        createdAt: now,
        updatedAt: now,
      })
      .select('*')
      .single();
    if (error || !c) throw dbError(error);
    return toEntity(c as Row);
  }

  async update(id: string, data: Partial<CategoryEntity>): Promise<CategoryEntity> {
    const patch: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(data)) {
      if (v === undefined) continue;
      patch[k] = v instanceof Date ? v.toISOString() : v;
    }
    patch['updatedAt'] = new Date().toISOString();
    const { data: c, error } = await supabaseAdmin()
      .from('categories')
      .update(patch)
      .eq('id', id)
      .select('*')
      .single();
    if (error || !c) throw dbError(error);
    return toEntity(c as Row);
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabaseAdmin().from('categories').delete().eq('id', id);
    if (error) throw dbError(error);
  }
}

export const categoryRepository = new CategoryRepository();

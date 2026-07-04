import { supabaseAdmin, dbError } from '../db';
import type { IProductKeyRepository } from '../../application/ports/repositories';
import type { ProductKeyEntity } from '../../domain/entities/product';
import { NoKeysAvailableError } from '../../domain/errors/product';

const COLS = 'id,productId,code,isUsed,usedById,usedAt,reservedAt,reservedFor,createdAt';

type Row = {
  id: string;
  productId: string;
  code: string;
  isUsed: boolean;
  usedById: string | null;
  usedAt: string | null;
  reservedAt: string | null;
  reservedFor: string | null;
  createdAt: string;
};

function toEntity(k: Row): ProductKeyEntity {
  return {
    id: k.id,
    productId: k.productId,
    code: k.code,
    isUsed: k.isUsed,
    usedById: k.usedById ?? null,
    usedAt: k.usedAt ? new Date(k.usedAt) : null,
    reservedAt: k.reservedAt ? new Date(k.reservedAt) : null,
    reservedFor: k.reservedFor ?? null,
    createdAt: new Date(k.createdAt),
  };
}

const MAX_RESERVATION_RETRIES = 5;

export class ProductKeyRepository implements IProductKeyRepository {
  async listByProduct(
    productId: string,
    options: { availableOnly?: boolean; page: number; limit: number },
  ): Promise<{ items: ProductKeyEntity[]; total: number }> {
    let q = supabaseAdmin()
      .from('product_keys')
      .select(COLS, { count: 'exact' })
      .eq('productId', productId);
    if (options.availableOnly) q = q.eq('isUsed', false);
    q = q.order('createdAt', { ascending: false });
    const from = (options.page - 1) * options.limit;
    const to = from + options.limit - 1;
    q = q.range(from, to);
    const { data, error, count } = await q;
    if (error) throw dbError(error);
    return { items: (data ?? []).map((r) => toEntity(r as Row)), total: count ?? 0 };
  }

  async reserve(productId: string, qty: number, userId: string): Promise<ProductKeyEntity[]> {
    for (let attempt = 0; attempt < MAX_RESERVATION_RETRIES; attempt++) {
      try {
        const { data: keys, error: findErr } = await supabaseAdmin()
          .from('product_keys')
          .select(COLS)
          .eq('productId', productId)
          .eq('isUsed', false)
          .is('reservedFor', null)
          .order('createdAt', { ascending: true })
          .limit(qty);
        if (findErr) throw dbError(findErr);
        if (!keys || (keys as Row[]).length < qty) throw new NoKeysAvailableError();
        const now = new Date().toISOString();
        const updated: ProductKeyEntity[] = [];
        for (const k of keys as Row[]) {
          const { data: r, error: uErr } = await supabaseAdmin()
            .from('product_keys')
            .update({ reservedAt: now, reservedFor: userId })
            .eq('id', k.id)
            .is('reservedFor', null)
            .select(COLS)
            .maybeSingle();
          if (uErr) throw dbError(uErr);
          if (!r) throw new Error('KEY_RESERVATION_CONFLICT');
          updated.push(toEntity(r as Row));
        }
        return updated;
      } catch (err: unknown) {
        if (err instanceof NoKeysAvailableError) throw err;
        if (err instanceof Error && err.message === 'KEY_RESERVATION_CONFLICT') {
          if (attempt < MAX_RESERVATION_RETRIES - 1) continue;
          throw err;
        }
        throw err;
      }
    }
    throw new Error('KEY_RESERVATION_CONFLICT');
  }

  async markUsedByOrderItem(orderItemId: string, userId: string): Promise<void> {
    const { data: item, error: iErr } = await supabaseAdmin()
      .from('order_items')
      .select('productKeyId')
      .eq('id', orderItemId)
      .maybeSingle();
    if (iErr) throw dbError(iErr);
    const keyId = (item as { productKeyId: string | null } | null)?.productKeyId;
    if (!keyId) return;
    const { error } = await supabaseAdmin()
      .from('product_keys')
      .update({
        isUsed: true,
        usedById: userId,
        usedAt: new Date().toISOString(),
        reservedAt: null,
        reservedFor: null,
      })
      .eq('id', keyId);
    if (error) throw dbError(error);
  }

  async returnKeysForOrderItem(orderItemId: string): Promise<void> {
    const { data: item, error: iErr } = await supabaseAdmin()
      .from('order_items')
      .select('productKeyId')
      .eq('id', orderItemId)
      .maybeSingle();
    if (iErr) throw dbError(iErr);
    const keyId = (item as { productKeyId: string | null } | null)?.productKeyId;
    if (!keyId) return;
    const { data: key } = await supabaseAdmin()
      .from('product_keys')
      .select('isUsed')
      .eq('id', keyId)
      .maybeSingle();
    if (!key || (key as { isUsed: boolean }).isUsed) return;
    const { error } = await supabaseAdmin()
      .from('product_keys')
      .update({ reservedAt: null, reservedFor: null })
      .eq('id', keyId);
    if (error) throw dbError(error);
  }

  async countAvailable(productId: string): Promise<number> {
    const { count, error } = await supabaseAdmin()
      .from('product_keys')
      .select('*', { count: 'exact', head: true })
      .eq('productId', productId)
      .eq('isUsed', false);
    if (error) throw dbError(error);
    return count ?? 0;
  }

  async bulkCreate(productId: string, codes: string[]): Promise<number> {
    const now = new Date().toISOString();
    const rows = codes.map((code) => ({
      id: crypto.randomUUID(),
      productId,
      code,
      createdAt: now,
    }));
    const { data, error } = await supabaseAdmin().from('product_keys').insert(rows).select('id');
    if (error) throw dbError(error);
    return (data ?? []).length;
  }

  async deleteById(id: string): Promise<void> {
    const { error } = await supabaseAdmin().from('product_keys').delete().eq('id', id);
    if (error) throw dbError(error);
  }

  async findById(id: string): Promise<ProductKeyEntity | null> {
    const { data, error } = await supabaseAdmin()
      .from('product_keys')
      .select(COLS)
      .eq('id', id)
      .maybeSingle();
    if (error) throw dbError(error);
    return data ? toEntity(data as Row) : null;
  }
}

export const productKeyRepository = new ProductKeyRepository();

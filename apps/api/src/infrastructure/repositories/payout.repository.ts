import { supabaseAdmin, dbError } from '../db';
import type {
  IPayoutRepository,
  CreatePayoutInput,
  PayoutListFilter,
} from '../../application/ports/escrow';
import type { SellerPayoutEntity, PayoutStatus, PayoutMethod } from '../../domain/entities/escrow';

type Row = Record<string, unknown>;

function toEntity(r: Row): SellerPayoutEntity {
  return {
    id: r['id'] as string,
    sellerId: r['sellerId'] as string,
    userId: r['userId'] as string,
    amount: Number(r['amount']),
    grossAmount: r['grossAmount'] != null ? Number(r['grossAmount']) : null,
    commissionAmount: r['commissionAmount'] != null ? Number(r['commissionAmount']) : null,
    currency: r['currency'] as SellerPayoutEntity['currency'],
    method: r['method'] as PayoutMethod,
    destination: r['destination'] as string,
    status: r['status'] as PayoutStatus,
    processedById: (r['processedById'] as string | null) ?? null,
    processedAt: r['processedAt'] ? new Date(r['processedAt'] as string) : null,
    rejectionReason: (r['rejectionReason'] as string | null) ?? null,
    notes: (r['notes'] as string | null) ?? null,
    createdAt: new Date(r['createdAt'] as string),
    updatedAt: new Date(r['updatedAt'] as string),
  };
}

export class PayoutRepository implements IPayoutRepository {
  async findById(id: string): Promise<SellerPayoutEntity | null> {
    const { data, error } = await supabaseAdmin()
      .from('seller_payouts')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) {
      if ((error as { code?: string }).code === 'PGRST205') return null;
      throw dbError(error);
    }
    return data ? toEntity(data) : null;
  }

  async create(data: CreatePayoutInput): Promise<SellerPayoutEntity> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const insert = {
      id,
      sellerId: data.sellerId,
      userId: data.userId,
      amount: data.amount,
      grossAmount: data.grossAmount ?? null,
      commissionAmount: data.commissionAmount ?? null,
      currency: data.currency,
      method: data.method,
      destination: data.destination,
      notes: data.notes ?? null,
      status: 'PENDING',
      createdAt: now,
      updatedAt: now,
    };
    const { data: row, error } = await supabaseAdmin()
      .from('seller_payouts')
      .insert(insert)
      .select('*')
      .single();
    if (error || !row) throw dbError(error);
    return toEntity(row);
  }

  async listBySeller(
    sellerId: string,
    options: { status?: PayoutStatus; page: number; limit: number },
  ): Promise<{ items: SellerPayoutEntity[]; total: number }> {
    let q = supabaseAdmin()
      .from('seller_payouts')
      .select('*', { count: 'exact' })
      .eq('sellerId', sellerId);
    if (options.status) q = q.eq('status', options.status);
    q = q.order('createdAt', { ascending: false });
    const from = (options.page - 1) * options.limit;
    q = q.range(from, from + options.limit - 1);
    const { data, error, count } = await q;
    if (error) throw dbError(error);
    return { items: (data ?? []).map((r) => toEntity(r)), total: count ?? 0 };
  }

  async list(filter: PayoutListFilter): Promise<{ items: SellerPayoutEntity[]; total: number }> {
    let q = supabaseAdmin().from('seller_payouts').select('*', { count: 'exact' });
    if (filter.sellerId) q = q.eq('sellerId', filter.sellerId);
    if (filter.userId) q = q.eq('userId', filter.userId);
    if (filter.status) q = q.eq('status', filter.status);
    if (filter.method) q = q.eq('method', filter.method);
    q = q.order('createdAt', { ascending: false });
    const from = (filter.page - 1) * filter.limit;
    q = q.range(from, from + filter.limit - 1);
    const { data, error, count } = await q;
    if (error) throw dbError(error);
    return { items: (data ?? []).map((r) => toEntity(r)), total: count ?? 0 };
  }

  async updateStatus(
    id: string,
    status: PayoutStatus,
    extras?: {
      processedById?: string;
      processedAt?: Date;
      rejectionReason?: string;
      notes?: string;
    },
  ): Promise<SellerPayoutEntity> {
    const patch: Record<string, unknown> = { status, updatedAt: new Date().toISOString() };
    if (extras?.processedById !== undefined) patch['processedById'] = extras.processedById;
    if (extras?.processedAt) patch['processedAt'] = extras.processedAt.toISOString();
    if (extras?.rejectionReason !== undefined) patch['rejectionReason'] = extras.rejectionReason;
    if (extras?.notes !== undefined) patch['notes'] = extras.notes;
    const { data: row, error } = await supabaseAdmin()
      .from('seller_payouts')
      .update(patch)
      .eq('id', id)
      .select('*')
      .single();
    if (error || !row) throw dbError(error);
    return toEntity(row);
  }
}

export const payoutRepository = new PayoutRepository();

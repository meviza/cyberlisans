import { supabaseAdmin, dbError } from '../db';
import type {
  IEscrowRepository,
  CreateEscrowInput,
  EscrowListFilter,
} from '../../application/ports/escrow';
import type { EscrowEntity, EscrowStatus } from '../../domain/entities/escrow';

type Row = Record<string, unknown>;

function toEntity(r: Row): EscrowEntity {
  return {
    id: r['id'] as string,
    orderId: r['orderId'] as string,
    sellerId: r['sellerId'] as string,
    customerId: r['customerId'] as string,
    amount: Number(r['amount']),
    sellerAmount: Number(r['sellerAmount']),
    commissionAmount: Number(r['commissionAmount']),
    currency: r['currency'] as EscrowEntity['currency'],
    status: r['status'] as EscrowStatus,
    heldAt: new Date(r['heldAt'] as string),
    releaseAt: r['releaseAt'] ? new Date(r['releaseAt'] as string) : null,
    releasedAt: r['releasedAt'] ? new Date(r['releasedAt'] as string) : null,
    refundedAt: r['refundedAt'] ? new Date(r['refundedAt'] as string) : null,
    payoutEligibleAt: new Date(r['payoutEligibleAt'] as string),
    releaseReason: (r['releaseReason'] as string | null) ?? null,
    paymentId: (r['paymentId'] as string | null) ?? null,
    metadata: (r['metadata'] as Record<string, unknown> | null) ?? null,
    createdAt: new Date(r['createdAt'] as string),
    updatedAt: new Date(r['updatedAt'] as string),
  };
}

export class EscrowRepository implements IEscrowRepository {
  async findById(id: string): Promise<EscrowEntity | null> {
    const { data, error } = await supabaseAdmin()
      .from('escrow_transactions')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) {
      if ((error as { code?: string }).code === 'PGRST205') return null;
      throw dbError(error);
    }
    return data ? toEntity(data) : null;
  }

  async findByOrderId(orderId: string): Promise<EscrowEntity | null> {
    const { data, error } = await supabaseAdmin()
      .from('escrow_transactions')
      .select('*')
      .eq('orderId', orderId)
      .maybeSingle();
    if (error) {
      if ((error as { code?: string }).code === 'PGRST205') return null;
      throw dbError(error);
    }
    return data ? toEntity(data) : null;
  }

  async create(data: CreateEscrowInput): Promise<EscrowEntity> {
    const id = crypto.randomUUID();
    const now = new Date();
    const heldAt = (data.heldAt ?? now).toISOString();
    const releaseAt = (
      data.releaseAt ?? new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    ).toISOString();
    const payoutEligibleAt = (data.payoutEligibleAt ?? new Date(releaseAt)).toISOString();
    const insert = {
      id,
      orderId: data.orderId,
      sellerId: data.sellerId,
      customerId: data.customerId,
      amount: data.amount,
      sellerAmount: data.sellerAmount,
      commissionAmount: data.commissionAmount,
      currency: data.currency,
      status: data.status ?? 'HELD',
      heldAt,
      releaseAt,
      payoutEligibleAt,
      paymentId: data.paymentId ?? null,
      metadata: data.metadata ?? null,
    };
    const { data: row, error } = await supabaseAdmin()
      .from('escrow_transactions')
      .insert(insert)
      .select('*')
      .single();
    if (error || !row) throw dbError(error);
    return toEntity(row);
  }

  async list(filter: EscrowListFilter): Promise<{ items: EscrowEntity[]; total: number }> {
    let q = supabaseAdmin().from('escrow_transactions').select('*', { count: 'exact' });
    if (filter.status) q = q.eq('status', filter.status);
    if (filter.sellerId) q = q.eq('sellerId', filter.sellerId);
    if (filter.customerId) q = q.eq('customerId', filter.customerId);
    if (filter.from) q = q.gte('heldAt', filter.from.toISOString());
    if (filter.to) q = q.lte('heldAt', filter.to.toISOString());
    q = q.order('heldAt', { ascending: false });
    const from = (filter.page - 1) * filter.limit;
    q = q.range(from, from + filter.limit - 1);
    const { data, error, count } = await q;
    if (error) throw dbError(error);
    return { items: (data ?? []).map((r) => toEntity(r)), total: count ?? 0 };
  }

  async updateStatus(
    id: string,
    status: EscrowStatus,
    extras?: { releasedAt?: Date; refundedAt?: Date; releaseReason?: string },
  ): Promise<EscrowEntity> {
    const patch: Record<string, unknown> = { status, updatedAt: new Date().toISOString() };
    if (extras?.releasedAt) patch['releasedAt'] = extras.releasedAt.toISOString();
    if (extras?.refundedAt) patch['refundedAt'] = extras.refundedAt.toISOString();
    if (extras?.releaseReason !== undefined) patch['releaseReason'] = extras.releaseReason;
    const { data: row, error } = await supabaseAdmin()
      .from('escrow_transactions')
      .update(patch)
      .eq('id', id)
      .select('*')
      .single();
    if (error || !row) throw dbError(error);
    return toEntity(row);
  }
}

export const escrowRepository = new EscrowRepository();

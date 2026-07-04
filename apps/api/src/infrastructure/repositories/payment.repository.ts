import { supabaseAdmin, dbError } from '../db';
import type { IPaymentRepository } from '../../application/ports/repositories';
import type { PaymentEntity, Currency } from '../../domain/entities/wallet';

type Row = {
  id: string;
  userId: string;
  orderId: string | null;
  provider: string;
  providerRef: string | null;
  amount: string | number;
  currency: string;
  status: string;
  webhookPayload: Record<string, unknown> | null;
  metadata: Record<string, unknown> | null;
  expiresAt: string | null;
  paidAt: string | null;
  refundedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

function toEntity(p: Row): PaymentEntity {
  return {
    id: p.id,
    userId: p.userId,
    orderId: p.orderId,
    provider: p.provider as PaymentEntity['provider'],
    providerRef: p.providerRef,
    amount: Number(p.amount),
    currency: p.currency as Currency,
    status: p.status as PaymentEntity['status'],
    webhookPayload: p.webhookPayload,
    metadata: p.metadata,
    expiresAt: p.expiresAt ? new Date(p.expiresAt) : null,
    paidAt: p.paidAt ? new Date(p.paidAt) : null,
    refundedAt: p.refundedAt ? new Date(p.refundedAt) : null,
    createdAt: new Date(p.createdAt),
    updatedAt: new Date(p.updatedAt),
  };
}

export class PaymentRepository implements IPaymentRepository {
  async create(input: Parameters<IPaymentRepository['create']>[0]): Promise<PaymentEntity> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const insert: Record<string, unknown> = {
      id,
      userId: input.userId,
      orderId: input.orderId ?? null,
      provider: input.provider,
      amount: input.amount,
      currency: input.currency,
      status: 'PENDING',
      createdAt: now,
      updatedAt: now,
    };
    if (input.expiresAt !== undefined) insert['expiresAt'] = input.expiresAt.toISOString();
    if (input.metadata !== undefined) insert['metadata'] = input.metadata;
    const { data, error } = await supabaseAdmin()
      .from('payments')
      .insert(insert)
      .select('*')
      .single();
    if (error || !data) throw dbError(error);
    return toEntity(data as Row);
  }

  async findById(id: string): Promise<PaymentEntity | null> {
    const { data, error } = await supabaseAdmin()
      .from('payments')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw dbError(error);
    return data ? toEntity(data as Row) : null;
  }

  async findByProviderRef(
    provider: PaymentEntity['provider'],
    providerRef: string,
  ): Promise<PaymentEntity | null> {
    const { data, error } = await supabaseAdmin()
      .from('payments')
      .select('*')
      .eq('provider', provider)
      .eq('providerRef', providerRef)
      .maybeSingle();
    if (error) throw dbError(error);
    return data ? toEntity(data as Row) : null;
  }

  async updateStatus(
    id: string,
    status: PaymentEntity['status'],
    extras?: { providerRef?: string; webhookPayload?: Record<string, unknown>; paidAt?: Date },
  ): Promise<PaymentEntity> {
    const patch: Record<string, unknown> = {
      status,
      updatedAt: new Date().toISOString(),
    };
    if (extras?.providerRef !== undefined) patch['providerRef'] = extras.providerRef;
    if (extras?.webhookPayload !== undefined) patch['webhookPayload'] = extras.webhookPayload;
    if (extras?.paidAt) patch['paidAt'] = extras.paidAt.toISOString();
    const { data, error } = await supabaseAdmin()
      .from('payments')
      .update(patch)
      .eq('id', id)
      .select('*')
      .single();
    if (error || !data) throw dbError(error);
    return toEntity(data as Row);
  }

  async listForUser(userId: string, limit: number, cursor?: string): Promise<PaymentEntity[]> {
    let q = supabaseAdmin()
      .from('payments')
      .select('*')
      .eq('userId', userId)
      .order('createdAt', { ascending: false })
      .limit(limit + 1);
    if (cursor) {
      q = q.lt('id', cursor).limit(limit);
    }
    const { data, error } = await q;
    if (error) throw dbError(error);
    return (data ?? []).map((r) => toEntity(r as Row));
  }

  async listPending(limit: number): Promise<PaymentEntity[]> {
    const { data, error } = await supabaseAdmin()
      .from('payments')
      .select('*')
      .in('status', ['PENDING', 'PROCESSING'])
      .order('createdAt', { ascending: true })
      .limit(limit);
    if (error) throw dbError(error);
    return (data ?? []).map((r) => toEntity(r as Row));
  }
}

export const paymentRepository = new PaymentRepository();

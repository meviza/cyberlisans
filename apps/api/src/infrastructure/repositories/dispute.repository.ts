import { supabaseAdmin, dbError } from '../db';
import type {
  IDisputeRepository,
  CreateDisputeInput,
  CreateDisputeMessageInput,
  DisputeListFilter,
} from '../../application/ports/escrow';
import type {
  DisputeEntity,
  DisputeMessageEntity,
  DisputeResolution,
  DisputeRole,
  DisputeStatus,
} from '../../domain/entities/escrow';

type Row = Record<string, unknown>;

function toEntity(r: Row): DisputeEntity {
  return {
    id: r['id'] as string,
    escrowId: r['escrowId'] as string,
    orderId: r['orderId'] as string,
    openedById: r['openedById'] as string,
    openedByRole: r['openedByRole'] as DisputeRole,
    reason: r['reason'] as string,
    status: r['status'] as DisputeStatus,
    resolution: (r['resolution'] as DisputeResolution | null) ?? null,
    resolvedById: (r['resolvedById'] as string | null) ?? null,
    resolvedAt: r['resolvedAt'] ? new Date(r['resolvedAt'] as string) : null,
    createdAt: new Date(r['createdAt'] as string),
    updatedAt: new Date(r['updatedAt'] as string),
  };
}

function toMessageEntity(r: Row): DisputeMessageEntity {
  return {
    id: r['id'] as string,
    disputeId: r['disputeId'] as string,
    senderId: (r['senderId'] as string | null) ?? null,
    senderRole: r['senderRole'] as DisputeRole,
    message: r['message'] as string,
    attachmentUrl: (r['attachmentUrl'] as string | null) ?? null,
    createdAt: new Date(r['createdAt'] as string),
  };
}

export class DisputeRepository implements IDisputeRepository {
  async findById(id: string): Promise<DisputeEntity | null> {
    const { data, error } = await supabaseAdmin()
      .from('disputes')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) {
      if ((error as { code?: string }).code === 'PGRST205') return null;
      throw dbError(error);
    }
    return data ? toEntity(data) : null;
  }

  async findByEscrow(escrowId: string): Promise<DisputeEntity | null> {
    const { data, error } = await supabaseAdmin()
      .from('disputes')
      .select('*')
      .eq('escrowId', escrowId)
      .order('createdAt', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) {
      if ((error as { code?: string }).code === 'PGRST205') return null;
      throw dbError(error);
    }
    return data ? toEntity(data) : null;
  }

  async create(data: CreateDisputeInput): Promise<DisputeEntity> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const insert = {
      id,
      escrowId: data.escrowId,
      orderId: data.orderId,
      openedById: data.openedById,
      openedByRole: data.openedByRole,
      reason: data.reason,
      status: 'OPEN' as DisputeStatus,
      createdAt: now,
      updatedAt: now,
    };
    const { data: row, error } = await supabaseAdmin()
      .from('disputes')
      .insert(insert)
      .select('*')
      .single();
    if (error || !row) throw dbError(error);
    return toEntity(row);
  }

  async list(filter: DisputeListFilter): Promise<{ items: DisputeEntity[]; total: number }> {
    let q = supabaseAdmin().from('disputes').select('*', { count: 'exact' });
    if (filter.customerId) q = q.eq('openedById', filter.customerId);
    if (filter.status) q = q.eq('status', filter.status);
    q = q.order('createdAt', { ascending: false });
    const from = (filter.page - 1) * filter.limit;
    q = q.range(from, from + filter.limit - 1);
    const { data, error, count } = await q;
    if (error) throw dbError(error);
    return { items: (data ?? []).map((r) => toEntity(r)), total: count ?? 0 };
  }

  async resolve(
    id: string,
    resolution: DisputeResolution,
    resolvedById: string,
    note?: string,
  ): Promise<DisputeEntity> {
    const now = new Date();
    const patch: Record<string, unknown> = {
      status: 'RESOLVED' as DisputeStatus,
      resolution,
      resolvedById,
      resolvedAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };
    if (note) patch['reason'] = note;
    const { data: row, error } = await supabaseAdmin()
      .from('disputes')
      .update(patch)
      .eq('id', id)
      .select('*')
      .single();
    if (error || !row) throw dbError(error);
    return toEntity(row);
  }

  async addMessage(data: CreateDisputeMessageInput): Promise<DisputeMessageEntity> {
    const id = crypto.randomUUID();
    const insert = {
      id,
      disputeId: data.disputeId,
      senderId: data.senderId,
      senderRole: data.senderRole,
      message: data.message,
      attachmentUrl: data.attachmentUrl ?? null,
    };
    const { data: row, error } = await supabaseAdmin()
      .from('dispute_messages')
      .insert(insert)
      .select('*')
      .single();
    if (error || !row) throw dbError(error);
    return toMessageEntity(row);
  }

  async listMessages(disputeId: string): Promise<DisputeMessageEntity[]> {
    const { data, error } = await supabaseAdmin()
      .from('dispute_messages')
      .select('*')
      .eq('disputeId', disputeId)
      .order('createdAt', { ascending: true });
    if (error) throw dbError(error);
    return (data ?? []).map((r) => toMessageEntity(r));
  }
}

export const disputeRepository = new DisputeRepository();

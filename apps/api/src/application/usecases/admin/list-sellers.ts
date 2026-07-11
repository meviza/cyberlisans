import { supabaseAdmin, dbError } from '../../../infrastructure/db';
import type {
  ListSellersFilter,
  SellerOutput,
  SellerUserSummary,
  SellerStatusCounts,
  ListPendingSellersDeps,
  SellerEntity,
} from '../../ports/seller';
import { toSellerOutput } from '../seller/apply-seller';

async function loadUsersByIds(userIds: string[]): Promise<Map<string, SellerUserSummary>> {
  const map = new Map<string, SellerUserSummary>();
  const unique = [...new Set(userIds.filter(Boolean))];
  if (unique.length === 0) return map;
  const { data, error } = await supabaseAdmin()
    .from('users')
    .select('id,email,username,displayName')
    .in('id', unique);
  if (error) throw dbError(error);
  for (const row of data ?? []) {
    const r = row as {
      id: string;
      email: string;
      username: string | null;
      displayName?: string | null;
    };
    map.set(r.id, {
      id: r.id,
      email: r.email,
      username: r.username ?? null,
      displayName: r.displayName ?? null,
    });
  }
  return map;
}

function withUser(s: SellerEntity, users: Map<string, SellerUserSummary>): SellerOutput {
  return {
    ...toSellerOutput(s),
    user: users.get(s.userId) ?? null,
  };
}

export class ListAllSellersUseCase {
  constructor(private readonly deps: ListPendingSellersDeps) {}

  async execute(filter: ListSellersFilter): Promise<{ items: SellerOutput[]; total: number }> {
    const { items, total } = await this.deps.sellers.list(filter);
    const users = await loadUsersByIds(items.map((s) => s.userId));
    return { items: items.map((s) => withUser(s, users)), total };
  }
}

export class ListPendingSellersUseCase {
  constructor(private readonly deps: ListPendingSellersDeps) {}

  async execute(page: number, limit: number): Promise<{ items: SellerOutput[]; total: number }> {
    const { items, total } = await this.deps.sellers.list({
      status: 'PENDING',
      page,
      limit,
    });
    const users = await loadUsersByIds(items.map((s) => s.userId));
    return { items: items.map((s) => withUser(s, users)), total };
  }
}

export class GetAdminSellerUseCase {
  constructor(private readonly deps: ListPendingSellersDeps) {}

  async execute(sellerId: string): Promise<SellerOutput> {
    const s = await this.deps.sellers.findById(sellerId);
    if (!s) {
      throw new (await import('../../../domain/errors/seller')).SellerNotFoundError();
    }
    const users = await loadUsersByIds([s.userId]);
    return withUser(s, users);
  }
}

export class GetSellerStatusCountsUseCase {
  constructor(private readonly deps: ListPendingSellersDeps) {}

  async execute(): Promise<SellerStatusCounts> {
    return this.deps.sellers.countByStatus();
  }
}

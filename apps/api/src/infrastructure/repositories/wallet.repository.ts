import { supabaseAdmin, dbError } from '../db';
import { roundCurrency } from '@cyberlisans/payments/currency';
import type { IWalletRepository } from '../../application/ports/repositories';
import type {
  WalletEntity,
  WalletTransactionEntity,
  WalletTxType,
  Currency,
} from '../../domain/entities/wallet';

const MAX_RETRIES = 5;

type WalletRow = {
  id: string;
  userId: string;
  balanceTry: string | number;
  balanceUsd: string | number;
  balanceEur: string | number;
  balanceUsdt: string | number;
  loyaltyCoins: number;
  version: number;
  createdAt: string;
  updatedAt: string;
};

type TxRow = {
  id: string;
  userId: string;
  type: string;
  currency: string;
  amount: string | number;
  balanceAfter: string | number;
  referenceType: string | null;
  referenceId: string | null;
  description: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
};

function toEntity(w: WalletRow): WalletEntity {
  return {
    id: w.id,
    userId: w.userId,
    balanceTry: Number(w.balanceTry),
    balanceUsd: Number(w.balanceUsd),
    balanceEur: Number(w.balanceEur),
    balanceUsdt: Number(w.balanceUsdt),
    loyaltyCoins: w.loyaltyCoins,
    version: w.version,
    createdAt: new Date(w.createdAt),
    updatedAt: new Date(w.updatedAt),
  };
}

function toTxEntity(t: TxRow): WalletTransactionEntity {
  return {
    id: t.id,
    userId: t.userId,
    type: t.type as WalletTxType,
    currency: t.currency as Currency,
    amount: Number(t.amount),
    balanceAfter: Number(t.balanceAfter),
    referenceType: t.referenceType,
    referenceId: t.referenceId,
    description: t.description,
    metadata: t.metadata,
    createdAt: new Date(t.createdAt),
  };
}

const currencyField: Record<Currency, string> = {
  TRY: 'balanceTry',
  USD: 'balanceUsd',
  EUR: 'balanceEur',
  USDT: 'balanceUsdt',
};

export class WalletRepository implements IWalletRepository {
  async findByUserId(userId: string): Promise<WalletEntity | null> {
    const { data, error } = await supabaseAdmin()
      .from('wallets')
      .select('*')
      .eq('userId', userId)
      .maybeSingle();
    if (error) throw dbError(error);
    return data ? toEntity(data as WalletRow) : null;
  }

  async findById(id: string): Promise<WalletEntity | null> {
    const { data, error } = await supabaseAdmin()
      .from('wallets')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw dbError(error);
    return data ? toEntity(data as WalletRow) : null;
  }

  async credit(input: Parameters<IWalletRepository['credit']>[0]) {
    return this.atomicUpdate(input, 'credit');
  }

  async debit(input: Parameters<IWalletRepository['debit']>[0]) {
    return this.atomicUpdate(input, 'debit');
  }

  private async atomicUpdate(
    input: {
      userId: string;
      currency: Currency;
      amount: number;
      type: WalletTxType;
      description?: string;
      referenceType?: string;
      referenceId?: string;
      metadata?: Record<string, unknown>;
    },
    op: 'credit' | 'debit',
  ): Promise<{ wallet: WalletEntity; transaction: WalletTransactionEntity }> {
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      const { data: w, error: wErr } = await supabaseAdmin()
        .from('wallets')
        .select('*')
        .eq('userId', input.userId)
        .maybeSingle();
      if (wErr) throw dbError(wErr);
      if (!w) throw new Error('WALLET_NOT_FOUND');
      const wr = w as WalletRow;
      const field = currencyField[input.currency];
      const current = Number(wr[field as keyof WalletRow]);
      const next = op === 'credit' ? current + input.amount : current - input.amount;
      if (op === 'debit' && next < 0) throw new Error('INSUFFICIENT_BALANCE');
      const nextRounded = roundCurrency(next, input.currency);
      const { data: upd, error: uErr } = await supabaseAdmin()
        .from('wallets')
        .update({
          [field]: nextRounded,
          version: wr.version + 1,
          updatedAt: new Date().toISOString(),
        })
        .eq('id', wr.id)
        .eq('version', wr.version)
        .select('*')
        .maybeSingle();
      if (uErr) throw dbError(uErr);
      if (!upd) {
        if (attempt < MAX_RETRIES - 1) continue;
        throw new Error('CONCURRENT_UPDATE_FAILED');
      }
      const txInsert: Record<string, unknown> = {
        id: crypto.randomUUID(),
        userId: input.userId,
        type: input.type,
        currency: input.currency,
        amount: input.amount,
        balanceAfter: nextRounded,
      };
      if (input.referenceType !== undefined) txInsert['referenceType'] = input.referenceType;
      if (input.referenceId !== undefined) txInsert['referenceId'] = input.referenceId;
      if (input.description !== undefined) txInsert['description'] = input.description;
      if (input.metadata !== undefined) txInsert['metadata'] = input.metadata;
      const { data: tx, error: tErr } = await supabaseAdmin()
        .from('wallet_transactions')
        .insert(txInsert)
        .select('*')
        .single();
      if (tErr || !tx) throw dbError(tErr);
      return { wallet: toEntity(upd as WalletRow), transaction: toTxEntity(tx as TxRow) };
    }
    throw new Error('CONCURRENT_UPDATE_FAILED');
  }

  async transfer(input: {
    fromUserId: string;
    toUserId: string;
    currency: Currency;
    amount: number;
    description?: string;
  }): Promise<void> {
    await this.debit({
      userId: input.fromUserId,
      currency: input.currency,
      amount: input.amount,
      type: 'GIFT_SENT',
      description: input.description,
      referenceType: 'transfer',
      referenceId: input.toUserId,
    });
    await this.credit({
      userId: input.toUserId,
      currency: input.currency,
      amount: input.amount,
      type: 'GIFT_RECEIVED',
      description: input.description,
      referenceType: 'transfer',
      referenceId: input.fromUserId,
    });
  }

  async listTransactions(input: {
    userId: string;
    type?: WalletTxType;
    cursor?: string;
    limit: number;
  }): Promise<WalletTransactionEntity[]> {
    let q = supabaseAdmin().from('wallet_transactions').select('*').eq('userId', input.userId);
    if (input.type) q = q.eq('type', input.type);
    q = q.order('createdAt', { ascending: false }).limit(input.limit + 1);
    if (input.cursor) {
      q = q.lt('id', input.cursor).limit(input.limit);
    }
    const { data, error } = await q;
    if (error) throw dbError(error);
    return (data ?? []).map((r) => toTxEntity(r as TxRow));
  }

  async addLoyaltyCoins(userId: string, coins: number): Promise<WalletEntity> {
    const { data: w, error: wErr } = await supabaseAdmin()
      .from('wallets')
      .select('loyaltyCoins')
      .eq('userId', userId)
      .maybeSingle();
    if (wErr) throw dbError(wErr);
    if (!w) throw new Error('WALLET_NOT_FOUND');
    const next = (w as { loyaltyCoins: number }).loyaltyCoins + coins;
    const { data, error } = await supabaseAdmin()
      .from('wallets')
      .update({ loyaltyCoins: next, updatedAt: new Date().toISOString() })
      .eq('userId', userId)
      .select('*')
      .single();
    if (error || !data) throw dbError(error);
    return toEntity(data as WalletRow);
  }
}

export const walletRepository = new WalletRepository();

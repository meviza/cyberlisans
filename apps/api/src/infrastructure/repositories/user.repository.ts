import { supabaseAdmin, dbError } from '../../infrastructure/db';
import type { IUserRepository, CreateUserInput } from '../../application/ports/repositories';
import type { UserEntity, UserStatus } from '../../domain/entities/user';

type Row = {
  id: string;
  email: string;
  emailVerified: boolean;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  locale: string;
  currency: string;
  role: string;
  status: string;
  twoFactorEnabled: boolean;
  twoFactorSecret: string | null;
  isAdult: boolean;
  marketingOptIn: boolean;
  referralCode: string;
  referredById: string | null;
  createdAt: string;
  lastLoginAt: string | null;
};

function toEntity(u: Row): UserEntity {
  return {
    id: u.id,
    email: u.email,
    emailVerified: u.emailVerified,
    username: u.username,
    displayName: u.displayName,
    avatarUrl: u.avatarUrl,
    locale: u.locale as UserEntity['locale'],
    currency: u.currency as UserEntity['currency'],
    role: u.role as UserEntity['role'],
    status: u.status as UserStatus,
    twoFactorEnabled: u.twoFactorEnabled,
    twoFactorSecret: u.twoFactorSecret,
    isAdult: u.isAdult,
    marketingOptIn: u.marketingOptIn,
    referralCode: u.referralCode,
    referredById: u.referredById,
    createdAt: new Date(u.createdAt),
    lastLoginAt: u.lastLoginAt ? new Date(u.lastLoginAt) : null,
  };
}

const COLS =
  'id,email,emailVerified,username,displayName,avatarUrl,locale,currency,role,status,twoFactorEnabled,twoFactorSecret,isAdult,marketingOptIn,referralCode,referredById,createdAt,lastLoginAt';

export class UserRepository implements IUserRepository {
  async findById(id: string): Promise<UserEntity | null> {
    const { data, error } = await supabaseAdmin()
      .from('users')
      .select(COLS)
      .eq('id', id)
      .maybeSingle();
    if (error) throw dbError(error);
    return data ? toEntity(data as Row) : null;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const { data, error } = await supabaseAdmin()
      .from('users')
      .select(COLS)
      .eq('email', email.toLowerCase())
      .maybeSingle();
    if (error) throw dbError(error);
    return data ? toEntity(data as Row) : null;
  }

  async findByUsername(username: string): Promise<UserEntity | null> {
    const { data, error } = await supabaseAdmin()
      .from('users')
      .select(COLS)
      .eq('username', username.toLowerCase())
      .maybeSingle();
    if (error) throw dbError(error);
    return data ? toEntity(data as Row) : null;
  }

  async findByReferralCode(code: string): Promise<UserEntity | null> {
    const { data, error } = await supabaseAdmin()
      .from('users')
      .select(COLS)
      .eq('referralCode', code)
      .maybeSingle();
    if (error) throw dbError(error);
    return data ? toEntity(data as Row) : null;
  }

  async create(data: CreateUserInput): Promise<UserEntity> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const userInsert = {
      id,
      email: data.email.toLowerCase(),
      username: data.username.toLowerCase(),
      displayName: data.displayName ?? null,
      locale: data.locale,
      currency: data.currency,
      isAdult: data.isAdult,
      marketingOptIn: data.marketingOptIn,
      referralCode: data.referralCode,
      referredById: data.referredById,
      createdAt: now,
      updatedAt: now,
    };
    const { data: u, error: uErr } = await supabaseAdmin()
      .from('users')
      .insert(userInsert)
      .select(COLS)
      .single();
    if (uErr || !u) throw dbError(uErr);
    const { error: credErr } = await supabaseAdmin().from('user_credentials').insert({
      id: crypto.randomUUID(),
      userId: id,
      passwordHash: data.passwordHash,
      createdAt: now,
      updatedAt: now,
    });
    if (credErr) throw dbError(credErr);
    const { error: walErr } = await supabaseAdmin().from('wallets').insert({
      id: crypto.randomUUID(),
      userId: id,
      createdAt: now,
      updatedAt: now,
    });
    if (walErr) throw dbError(walErr);
    return toEntity(u as Row);
  }

  async update(id: string, data: Partial<UserEntity>): Promise<UserEntity> {
    const patch: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(data)) {
      if (v === undefined) continue;
      patch[k] = k === 'lastLoginAt' && v instanceof Date ? v.toISOString() : v;
    }
    patch['updatedAt'] = new Date().toISOString();
    const { data: u, error } = await supabaseAdmin()
      .from('users')
      .update(patch)
      .eq('id', id)
      .select(COLS)
      .single();
    if (error || !u) throw dbError(error);
    return toEntity(u as Row);
  }

  async setEmailVerified(id: string): Promise<void> {
    const { error } = await supabaseAdmin()
      .from('users')
      .update({ emailVerified: true, status: 'ACTIVE', updatedAt: new Date().toISOString() })
      .eq('id', id);
    if (error) throw dbError(error);
  }

  async setTwoFactor(id: string, secret: string | null, enabled: boolean): Promise<void> {
    const { error } = await supabaseAdmin()
      .from('users')
      .update({
        twoFactorSecret: secret,
        twoFactorEnabled: enabled,
        updatedAt: new Date().toISOString(),
      })
      .eq('id', id);
    if (error) throw dbError(error);
  }

  async setLastLogin(id: string, date: Date): Promise<void> {
    const { error } = await supabaseAdmin()
      .from('users')
      .update({ lastLoginAt: date.toISOString(), updatedAt: new Date().toISOString() })
      .eq('id', id);
    if (error) throw dbError(error);
  }

  async setPassword(id: string, hash: string): Promise<void> {
    const { data: existing } = await supabaseAdmin()
      .from('user_credentials')
      .select('userId')
      .eq('userId', id)
      .maybeSingle();
    const now = new Date().toISOString();
    if (existing) {
      const { error } = await supabaseAdmin()
        .from('user_credentials')
        .update({ passwordHash: hash, updatedAt: now })
        .eq('userId', id);
      if (error) throw dbError(error);
    } else {
      const { error } = await supabaseAdmin()
        .from('user_credentials')
        .insert({
          id: crypto.randomUUID(),
          userId: id,
          passwordHash: hash,
          createdAt: now,
          updatedAt: now,
        });
      if (error) throw dbError(error);
    }
  }

  async setStatus(id: string, status: UserStatus): Promise<void> {
    const { error } = await supabaseAdmin()
      .from('users')
      .update({ status, updatedAt: new Date().toISOString() })
      .eq('id', id);
    if (error) throw dbError(error);
  }

  async getPasswordHash(id: string): Promise<string | null> {
    const { data, error } = await supabaseAdmin()
      .from('user_credentials')
      .select('passwordHash')
      .eq('userId', id)
      .maybeSingle();
    if (error) throw dbError(error);
    return (data as { passwordHash: string } | null)?.passwordHash ?? null;
  }
}

export const userRepository = new UserRepository();

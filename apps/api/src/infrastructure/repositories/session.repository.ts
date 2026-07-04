import { supabaseAdmin, dbError } from '../../infrastructure/db';
import type { ISessionRepository, CreateSessionInput } from '../../application/ports/repositories';
import type { SessionEntity } from '../../domain/entities/session';

type Row = {
  id: string;
  userId: string;
  refreshToken: string;
  refreshTokenHash: string | null;
  userAgent: string | null;
  ipAddress: string | null;
  expiresAt: string;
  createdAt: string;
};

function toEntity(s: Row): SessionEntity {
  return {
    id: s.id,
    userId: s.userId,
    refreshToken: s.refreshToken,
    refreshTokenHash: s.refreshTokenHash,
    userAgent: s.userAgent,
    ipAddress: s.ipAddress,
    expiresAt: new Date(s.expiresAt),
    createdAt: new Date(s.createdAt),
  };
}

export class SessionRepository implements ISessionRepository {
  async create(data: CreateSessionInput): Promise<SessionEntity> {
    const insert: Record<string, unknown> = {
      userId: data.userId,
      refreshToken: data.refreshToken,
      refreshTokenHash: data.refreshTokenHash,
      expiresAt: data.expiresAt.toISOString(),
    };
    if (data.userAgent !== undefined) insert['userAgent'] = data.userAgent;
    if (data.ipAddress !== undefined) insert['ipAddress'] = data.ipAddress;
    const { data: row, error } = await supabaseAdmin()
      .from('sessions')
      .insert(insert)
      .select('*')
      .single();
    if (error || !row) throw dbError(error);
    return toEntity(row as Row);
  }

  async findByRefreshTokenHash(hash: string): Promise<SessionEntity | null> {
    const { data, error } = await supabaseAdmin()
      .from('sessions')
      .select('*')
      .eq('refreshTokenHash', hash)
      .maybeSingle();
    if (error) throw dbError(error);
    return data ? toEntity(data as Row) : null;
  }

  async deleteById(id: string): Promise<void> {
    const { error } = await supabaseAdmin().from('sessions').delete().eq('id', id);
    if (error) throw dbError(error);
  }

  async deleteAllForUser(userId: string): Promise<void> {
    const { error } = await supabaseAdmin().from('sessions').delete().eq('userId', userId);
    if (error) throw dbError(error);
  }

  async listForUser(userId: string): Promise<SessionEntity[]> {
    const { data, error } = await supabaseAdmin()
      .from('sessions')
      .select('*')
      .eq('userId', userId)
      .gt('expiresAt', new Date().toISOString())
      .order('createdAt', { ascending: false });
    if (error) throw dbError(error);
    return (data ?? []).map((r) => toEntity(r as Row));
  }
}

export const sessionRepository = new SessionRepository();

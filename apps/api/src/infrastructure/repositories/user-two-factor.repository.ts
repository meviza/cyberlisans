import { supabaseAdmin, dbError } from '../../infrastructure/db';
import type { EncryptedData } from '@cyberlisans/auth/crypto';

export interface TwoFactorRecord {
  userId: string;
  secretCipher: string;
  backupCodesHash: string[];
  enabled: boolean;
}

type Row = {
  userId: string;
  secretCipher: string;
  backupCodesHash: string[] | null;
  enabled: boolean;
};

export class UserTwoFactorRepository {
  async findByUserId(userId: string): Promise<TwoFactorRecord | null> {
    const { data, error } = await supabaseAdmin()
      .from('user_two_factors')
      .select('userId,secretCipher,backupCodesHash,enabled')
      .eq('userId', userId)
      .maybeSingle();
    if (error) throw dbError(error);
    if (!data) return null;
    const r = data as Row;
    return {
      userId: r.userId,
      secretCipher: r.secretCipher,
      backupCodesHash: r.backupCodesHash ?? [],
      enabled: r.enabled,
    };
  }

  async upsert(
    userId: string,
    data: { secretCipher: EncryptedData | string; backupCodesHash: string[]; enabled: boolean },
  ): Promise<void> {
    const cipherStr =
      typeof data.secretCipher === 'string' ? data.secretCipher : JSON.stringify(data.secretCipher);
    const payload = {
      userId,
      secretCipher: cipherStr,
      backupCodesHash: data.backupCodesHash,
      enabled: data.enabled,
      updatedAt: new Date().toISOString(),
    };
    const { data: existing } = await supabaseAdmin()
      .from('user_two_factors')
      .select('userId')
      .eq('userId', userId)
      .maybeSingle();
    if (existing) {
      const { error } = await supabaseAdmin()
        .from('user_two_factors')
        .update({
          secretCipher: cipherStr,
          backupCodesHash: data.backupCodesHash,
          enabled: data.enabled,
          updatedAt: payload.updatedAt,
        })
        .eq('userId', userId);
      if (error) throw dbError(error);
    } else {
      const { error } = await supabaseAdmin().from('user_two_factors').insert(payload);
      if (error) throw dbError(error);
    }
  }

  async disable(userId: string): Promise<void> {
    const { error } = await supabaseAdmin().from('user_two_factors').delete().eq('userId', userId);
    if (error) throw dbError(error);
  }
}

export const userTwoFactorRepository = new UserTwoFactorRepository();

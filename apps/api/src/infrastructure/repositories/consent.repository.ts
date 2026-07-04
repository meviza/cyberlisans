import { supabaseAdmin, dbError } from '../../infrastructure/db';
import type { IConsentRepository, ConsentRecordInput } from '../../application/ports/repositories';

export class ConsentRepository implements IConsentRepository {
  async record(data: ConsentRecordInput): Promise<void> {
    const insert: Record<string, unknown> = {
      userId: data.userId,
      type: data.type,
      granted: data.granted,
      documentVersion: data.documentVersion,
    };
    if (data.email !== undefined) insert['email'] = data.email;
    if (data.ipAddress !== undefined) insert['ipAddress'] = data.ipAddress;
    if (data.userAgent !== undefined) insert['userAgent'] = data.userAgent;
    const { error } = await supabaseAdmin().from('consent_records').insert(insert);
    if (error) throw dbError(error);
  }
}

export const consentRepository = new ConsentRepository();

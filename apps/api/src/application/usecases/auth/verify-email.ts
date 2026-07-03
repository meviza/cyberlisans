import type { RequestMeta } from '../../ports/auth';
import type { IUserRepository, IAuditRepository } from '../../ports/repositories';
import type { TokenSignerPort } from '../../ports/auth';
import { InvalidTokenError, UserNotFoundError } from '../../../domain/errors';

export interface VerifyEmailDeps {
  users: IUserRepository;
  audit: IAuditRepository;
  tokens: TokenSignerPort;
}

export class VerifyEmailUseCase {
  constructor(private readonly deps: VerifyEmailDeps) {}

  async execute(token: string, meta: RequestMeta): Promise<void> {
    const payload = await this.deps.tokens.verifyEmailVerify(token);
    if (!payload) throw new InvalidTokenError('Doğrulama tokenı geçersiz veya süresi dolmuş');

    const user = await this.deps.users.findById(payload.sub);
    if (!user) throw new UserNotFoundError();
    if (!user.emailVerified) await this.deps.users.setEmailVerified(user.id);

    await this.deps.audit.log({
      actorId: user.id,
      action: 'STATUS_CHANGE',
      targetType: 'user',
      targetId: user.id,
      payload: { event: 'email_verified' },
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    });
  }
}

import { createHash, randomBytes } from 'crypto';
import type { LoginInput } from '../../../interface/schemas/auth';
import type { UserEntity } from '../../../domain/entities/user';
import type { LoginOutput, LoginUserDeps, RequestMeta } from '../../ports/auth';
import {
  InvalidCredentialsError,
  AccountLockedError,
  AccountBannedError,
  AccountPendingError,
  TwoFactorRequiredError,
  InvalidTwoFactorError,
} from '../../../domain/errors';

const REFRESH_TTL_MS = 7 * 24 * 60 * 60 * 1000;
export const SESSION_LIMITS = {
  REFRESH_TTL_MS,
  IDLE_TIMEOUT_MS: 24 * 60 * 60 * 1000,
  ABSOLUTE_TTL_MS: REFRESH_TTL_MS,
} as const;

const DUMMY_HASH = '$2a$12$abcdefghijklmnopqrstuv';

export class LoginUserUseCase {
  constructor(private readonly deps: LoginUserDeps) {}

  async execute(input: LoginInput, meta: RequestMeta): Promise<LoginOutput> {
    const {
      bruteForce,
      users,
      hasher,
      twoFactor,
      tokens,
      sessions,
      audit,
      adminMailer,
      twoFactorVerifier,
    } = this.deps;
    await bruteForce.ensureNotLocked(input.email);

    const user = await users.findByEmail(input.email);
    if (!user) {
      await hasher.verify(input.password, DUMMY_HASH);
      await bruteForce.recordFailed(input.email, meta);
      throw new InvalidCredentialsError();
    }

    const hash = await users.getPasswordHash(user.id);
    if (!hash || !(await hasher.verify(input.password, hash))) {
      await bruteForce.recordFailed(input.email, meta);
      throw new InvalidCredentialsError();
    }

    if (user.status === 'BANNED') {
      void bruteForce.recordFailed(input.email, meta);
      throw new AccountBannedError();
    }
    if (user.status === 'SUSPENDED') throw new AccountLockedError();
    if (user.status === 'PENDING_VERIFICATION') throw new AccountPendingError();

    const record = await twoFactor.findByUserId(user.id);
    let twoFactorEnabled = false;
    if (record?.enabled) {
      twoFactorEnabled = true;
      const secret = record.secretCipher ? twoFactorVerifier.decrypt(record.secretCipher) : null;
      if (!input.twoFactorToken || !secret) throw new TwoFactorRequiredError();
      if (!twoFactorVerifier.verify(input.twoFactorToken, secret)) {
        await bruteForce.recordFailed(input.email, meta);
        throw new InvalidTwoFactorError();
      }
    }

    const session = await this.issueSession(user, meta);
    await users.setLastLogin(user.id, new Date());
    await bruteForce.clear(input.email);
    await audit.login({
      userId: user.id,
      sessionId: session.id,
      accessJti: session.accessJti,
      twoFactorUsed: twoFactorEnabled,
      meta,
    });
    if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
      await adminMailer.sendNewDeviceLogin(user, meta);
    }

    const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';
    const setupRequired = isAdmin && !twoFactorEnabled;
    return {
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
      sessionId: session.id,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        displayName: user.displayName,
        role: user.role,
        twoFactorEnabled,
        emailVerified: user.emailVerified,
      },
      twoFactorSetupRequired: setupRequired || undefined,
      twoFactorSetupUrl: setupRequired ? '/auth/2fa/setup' : undefined,
    };
  }

  private async issueSession(user: UserEntity, meta: RequestMeta) {
    await this.deps.sessions.deleteAllForUser(user.id);
    const refreshToken = await this.deps.tokens.signRefresh({
      sub: user.id,
      jti: randomBytes(16).toString('hex'),
    });
    const accessToken = await this.deps.tokens.signAccess({
      sub: user.id,
      email: user.email,
      role: user.role,
      username: user.username,
    });
    const session = await this.deps.sessions.create({
      userId: user.id,
      refreshToken,
      refreshTokenHash: createHash('sha256').update(refreshToken).digest('hex'),
      userAgent: meta.userAgent,
      ipAddress: meta.ipAddress,
      expiresAt: new Date(Date.now() + REFRESH_TTL_MS),
    });
    return {
      id: session.id,
      accessToken,
      refreshToken,
      accessJti: randomBytes(16).toString('hex'),
    };
  }
}

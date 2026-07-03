import { randomBytes } from 'crypto';
import type { RegisterInput } from '../../../infrastructure/validators';
import type { RequestMeta, TokenSignerPort } from '../../ports/auth';
import type {
  IUserRepository,
  IConsentRepository,
  IAuditRepository,
} from '../../ports/repositories';
import type { MailServicePort } from '../../ports/services';
import {
  EmailAlreadyExistsError,
  UsernameTakenError,
  InvalidReferralError,
  AgeRestrictionError,
  MissingConsentError,
} from '../../../domain/errors';

export interface RegisterUserDeps {
  users: IUserRepository;
  consent: IConsentRepository;
  audit: IAuditRepository;
  hasher: { hash(password: string): Promise<string> };
  mail: MailServicePort;
  tokens: TokenSignerPort;
}

export interface RegisterUserOutput {
  userId: string;
  email: string;
  message: string;
}

const APP_URL = process.env['NEXT_PUBLIC_APP_URL'] ?? 'http://localhost:3000';

export class RegisterUserUseCase {
  constructor(private readonly deps: RegisterUserDeps) {}

  async execute(input: RegisterInput, meta: RequestMeta): Promise<RegisterUserOutput> {
    this.validate(input);
    if (await this.deps.users.findByEmail(input.email)) throw new EmailAlreadyExistsError();
    if (await this.deps.users.findByUsername(input.username)) throw new UsernameTakenError();

    const referredById = await this.resolveReferral(input.referralCode);
    const user = await this.deps.users.create({
      email: input.email,
      username: input.username,
      displayName: input.displayName,
      passwordHash: await this.deps.hasher.hash(input.password),
      locale: input.locale,
      currency: input.currency,
      isAdult: input.isAdult,
      marketingOptIn: false,
      referralCode: await this.makeCode(),
      referredById,
    });

    await this.recordConsents(user.id, user.email, input, meta);
    await this.deps.audit.log({
      actorId: user.id,
      action: 'CREATE',
      targetType: 'user',
      targetId: user.id,
      payload: { event: 'register', referralCode: user.referralCode },
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    });
    await this.sendVerification(user.id, user.email);
    return {
      userId: user.id,
      email: user.email,
      message: 'Kayıt başarılı. E-posta adresinizi doğrulayın.',
    };
  }

  private validate(input: RegisterInput): void {
    if (!input.isAdult) throw new AgeRestrictionError();
    if (!input.consentKvkk || !input.consentTerms) throw new MissingConsentError();
  }

  private async resolveReferral(code?: string): Promise<string | null> {
    if (!code) return null;
    const ref = await this.deps.users.findByReferralCode(code);
    if (!ref) throw new InvalidReferralError();
    return ref.id;
  }

  private async makeCode(): Promise<string> {
    for (let i = 0; i < 5; i++) {
      const code = randomBytes(8).toString('hex').toUpperCase();
      const exists = await this.deps.users.findByReferralCode(code);
      if (!exists) return code;
    }
    return randomBytes(8).toString('hex').toUpperCase();
  }

  private async recordConsents(
    uid: string,
    email: string,
    input: RegisterInput,
    meta: RequestMeta,
  ) {
    const base = { documentVersion: '1.0', ipAddress: meta.ipAddress, userAgent: meta.userAgent };
    await this.deps.consent.record({
      userId: uid,
      email,
      type: 'KVKK',
      granted: input.consentKvkk,
      ...base,
    });
    await this.deps.consent.record({
      userId: uid,
      email,
      type: 'TERMS',
      granted: input.consentTerms,
      ...base,
    });
  }

  private async sendVerification(uid: string, email: string): Promise<void> {
    const token = await this.deps.tokens.signEmailVerify({ sub: uid, email });
    await this.deps.mail
      .sendVerification(email, `${APP_URL}/verify-email?token=${token}`)
      .catch((err) => {
        console.error('[register] email send failed', err);
      });
  }
}

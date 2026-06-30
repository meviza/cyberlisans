import { registerSchema } from '../../../infrastructure/validators';
import type { RegisterInput } from '../../../infrastructure/validators';
import { hashPassword, signEmailVerifyToken } from '../../../infrastructure/auth';

import { mailTemplates, getMailService } from '../../../infrastructure/mail';
import { userRepository } from '../../../infrastructure/repositories/user.repository';
import { consentRepository } from '../../../infrastructure/repositories/consent.repository';
import { auditRepository } from '../../../infrastructure/repositories/audit.repository';
import { randomBytes } from 'crypto';
import {
  EmailAlreadyExistsError,
  UsernameTakenError,
  InvalidReferralError,
  AgeRestrictionError,
  MissingConsentError,
} from '../../errors';

export interface RequestMeta {
  ipAddress?: string;
  userAgent?: string;
}

export interface RegisterResult {
  userId: string;
  email: string;
  message: string;
}

function generateUniqueReferralCode(): string {
  return 'CL-' + randomBytes(4).toString('hex').toUpperCase();
}

function generateUniqueCode(): string {
  return randomBytes(8).toString('hex').toUpperCase();
}

export async function registerUser(
  input: RegisterInput,
  meta: RequestMeta,
): Promise<RegisterResult> {
  const data = registerSchema.parse(input);

  if (!data.isAdult) throw new AgeRestrictionError();
  if (!data.consentKvkk || !data.consentTerms) throw new MissingConsentError();

  const existing = await userRepository.findByEmail(data.email);
  if (existing) throw new EmailAlreadyExistsError();

  const existingUser = await userRepository.findByUsername(data.username);
  if (existingUser) throw new UsernameTakenError();

  let referredById: string | null = null;
  if (data.referralCode) {
    const ref = await userRepository.findByReferralCode(data.referralCode);
    if (!ref) throw new InvalidReferralError();
    referredById = ref.id;
  }

  const passwordHash = await hashPassword(data.password);
  let referralCode = generateUniqueCode();
  for (let i = 0; i < 5; i++) {
    const exists = await userRepository.findByReferralCode(referralCode);
    if (!exists) break;
    referralCode = generateUniqueCode();
  }

  const user = await userRepository.create({
    email: data.email,
    username: data.username,
    displayName: data.displayName,
    passwordHash,
    locale: data.locale,
    currency: data.currency,
    isAdult: data.isAdult,
    marketingOptIn: false,
    referralCode,
    referredById,
  });

  await consentRepository.record({
    userId: user.id,
    email: user.email,
    type: 'KVKK',
    granted: data.consentKvkk,
    documentVersion: '1.0',
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });
  await consentRepository.record({
    userId: user.id,
    email: user.email,
    type: 'TERMS',
    granted: data.consentTerms,
    documentVersion: '1.0',
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });

  await auditRepository.log({
    actorId: user.id,
    action: 'CREATE',
    targetType: 'user',
    targetId: user.id,
    payload: { event: 'register', referralCode: user.referralCode },
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });

  const token = await signEmailVerifyToken({ sub: user.id, email: user.email });
  const appUrl = process.env['NEXT_PUBLIC_APP_URL'] ?? 'http://localhost:3000';
  const link = `${appUrl}/verify-email?token=${token}`;
  try {
    const tpl = mailTemplates.emailVerify(link);
    await getMailService().send({ to: user.email, ...tpl });
  } catch (err) {
    console.error('[register] email send failed', err);
  }

  return {
    userId: user.id,
    email: user.email,
    message: 'Kayıt başarılı. E-posta adresinizi doğrulayın.',
  };
}

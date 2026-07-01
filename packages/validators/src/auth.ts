import { z } from 'zod';
import { COMMON_PASSWORDS } from './password';

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .max(254)
  .regex(
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/,
    'Geçersiz e-posta',
  );

export const passwordSchema = z
  .string()
  .min(12, 'Şifre en az 12 karakter olmalı')
  .max(128)
  .regex(/[A-Z]/, 'En az bir büyük harf')
  .regex(/[a-z]/, 'En az bir küçük harf')
  .regex(/[0-9]/, 'En az bir rakam')
  .regex(/[^A-Za-z0-9]/, 'En az bir özel karakter')
  .refine((p) => !COMMON_PASSWORDS.has(p), {
    message: 'Bu şifre çok yaygın, lütfen farklı bir şifre seçin',
  });

export const usernameSchema = z
  .string()
  .min(3, 'Kullanıcı adı en az 3 karakter')
  .max(20, 'En fazla 20 karakter')
  .regex(/^[a-zA-Z0-9_]+$/, 'Sadece harf, rakam ve alt çizgi')
  .toLowerCase();

export const localeSchema = z.enum(['TR', 'EN', 'DE', 'AR', 'RU']);
export const currencySchema = z.enum(['TRY', 'USD', 'EUR', 'USDT']);

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  username: usernameSchema,
  displayName: z.string().trim().min(2).max(50).optional(),
  locale: localeSchema.default('TR'),
  currency: currencySchema.default('TRY'),
  referralCode: z.string().trim().max(60).optional(),
  isAdult: z.literal(true, { errorMap: () => ({ message: '18 yaş üstü olmalısınız' }) }),
  consentKvkk: z.literal(true),
  consentTerms: z.literal(true),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1).max(128),
  twoFactorToken: z
    .string()
    .regex(/^\d{6}$/)
    .optional(),
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z.object({
  token: z.string().min(20).max(2048),
  password: passwordSchema,
});

export const verifyEmailSchema = z.object({
  token: z.string().min(20).max(2048),
});

export const enable2FASchema = z.object({
  token: z.string().regex(/^\d{6}$/, '6 haneli kod'),
  backupCode: z
    .string()
    .regex(/^[A-Z0-9]{8,12}$/)
    .optional(),
});

export const updateProfileSchema = z.object({
  displayName: z.string().trim().min(2).max(50).optional(),
  avatarUrl: z
    .string()
    .max(2048)
    .refine(
      (val) => /^https?:\/\//i.test(val) || /^data:image\/(png|jpe?g|gif|webp);base64,/i.test(val),
      'Geçersiz avatar URL',
    )
    .optional(),
  locale: localeSchema.optional(),
  currency: currencySchema.optional(),
  marketingOptIn: z.boolean().optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1).max(128),
  newPassword: passwordSchema,
});

export const consentSchema = z.object({
  type: z.enum(['KVKK', 'TERMS', 'MARKETING', 'COOKIES_ANALYTICS', 'COOKIES_MARKETING']),
  granted: z.boolean(),
  documentVersion: z.string().min(1).max(20),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
export type Enable2FAInput = z.infer<typeof enable2FASchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type ConsentInput = z.infer<typeof consentSchema>;

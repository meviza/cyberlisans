import { z } from 'zod';

export const emailSchema = z.string().email().max(255).toLowerCase().trim();

export const passwordSchema = z
  .string()
  .min(8, 'Şifre en az 8 karakter olmalı')
  .max(128)
  .regex(/[A-Z]/, 'En az bir büyük harf')
  .regex(/[a-z]/, 'En az bir küçük harf')
  .regex(/[0-9]/, 'En az bir rakam')
  .regex(/[^A-Za-z0-9]/, 'En az bir özel karakter');

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
  displayName: z.string().min(2).max(50).optional(),
  locale: localeSchema.default('TR'),
  currency: currencySchema.default('TRY'),
  referralCode: z.string().optional(),
  isAdult: z.literal(true, { errorMap: () => ({ message: '18 yaş üstü olmalısınız' }) }),
  consentKvkk: z.literal(true),
  consentTerms: z.literal(true),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1),
  twoFactorToken: z.string().regex(/^\d{6}$/).optional(),
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z.object({
  token: z.string().min(20),
  password: passwordSchema,
});

export const verifyEmailSchema = z.object({
  token: z.string().min(20),
});

export const enable2FASchema = z.object({
  token: z.string().regex(/^\d{6}$/, '6 haneli kod'),
});

export const updateProfileSchema = z.object({
  displayName: z.string().min(2).max(50).optional(),
  avatarUrl: z.string().url().optional(),
  locale: localeSchema.optional(),
  currency: currencySchema.optional(),
  marketingOptIn: z.boolean().optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: passwordSchema,
});

export const consentSchema = z.object({
  type: z.enum(['KVKK', 'TERMS', 'MARKETING', 'COOKIES_ANALYTICS', 'COOKIES_MARKETING']),
  granted: z.boolean(),
  documentVersion: z.string(),
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
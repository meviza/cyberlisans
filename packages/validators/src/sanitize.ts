import { z } from 'zod';

const SAFE_URL_PROTOCOLS = ['http:', 'https:', 'data:image', 'data:application'];

export const safeUrlSchema = z
  .string()
  .max(2048)
  .refine(
    (val) => {
      const trimmed = val.trim();
      if (!trimmed) return false;
      if (trimmed.startsWith('javascript:')) return false;
      if (trimmed.startsWith('vbscript:')) return false;
      if (trimmed.startsWith('file:')) return false;
      try {
        const u = new URL(trimmed);
        if (u.protocol === 'data:') {
          return /data:image\/(png|jpe?g|gif|webp|svg\+xml);/i.test(trimmed);
        }
        return SAFE_URL_PROTOCOLS.includes(u.protocol);
      } catch {
        return /^[a-zA-Z0-9._/-]+$/.test(trimmed);
      }
    },
    { message: 'Geçersiz URL' },
  );

export const trimmedStringSchema = (min: number, max: number) =>
  z
    .string()
    .transform((s) => s.trim())
    .pipe(z.string().min(min).max(max));

export const emailRfcSchema = z
  .string()
  .trim()
  .toLowerCase()
  .max(254)
  .regex(
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/,
    'Geçersiz e-posta',
  );

export const usernameSanitizedSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3)
  .max(20)
  .regex(/^[a-zA-Z0-9_]+$/, 'Sadece harf, rakam ve alt çizgi');

export function basicTextSanitize(input: string): string {
  return input
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/vbscript:/gi, '')
    .replace(/data:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
}

export function sanitizeHtmlServer(input: string): string {
  return basicTextSanitize(input)
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<[^>]+>/g, '')
    .slice(0, 5000);
}

import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { prisma } from '@cyberlisans/db';
import { forgotPasswordSchema } from '@cyberlisans/validators/auth';
import { signPasswordResetToken } from '@cyberlisans/auth/jwt';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = forgotPasswordSchema.parse(body);

    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (user) {
      try {
        const token = await signPasswordResetToken({ sub: user.id, email: user.email });
        const appUrl = process.env['NEXT_PUBLIC_APP_URL'] ?? 'http://localhost:3000';
        const link = `${appUrl}/reset-password?token=${token}`;
        console.log('[forgot] reset link:', link);
      } catch (err) {
        console.error('[forgot] token failed', err);
      }
    }

    return NextResponse.json(
      { message: 'Eğer e-posta kayıtlıysa şifre sıfırlama bağlantısı gönderildi.' },
      { status: 200 },
    );
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json(
        { error: 'Geçersiz e-posta', code: 'VALIDATION_ERROR' },
        { status: 400 },
      );
    }
    console.error('[forgot] error', err);
    return NextResponse.json(
      { error: 'Bir hata oluştu, lütfen tekrar deneyin', code: 'INTERNAL_ERROR' },
      { status: 500 },
    );
  }
}

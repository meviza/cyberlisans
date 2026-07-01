import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { prisma } from '@cyberlisans/db';
import { loginSchema } from '@cyberlisans/validators/auth';
import { verifyPassword } from '@cyberlisans/auth/password';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '@cyberlisans/auth/jwt';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = loginSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email: data.email },
      include: { credential: true },
    });

    if (!user || !user.credential) {
      return NextResponse.json(
        { error: 'E-posta veya şifre hatalı', code: 'INVALID_CREDENTIALS' },
        { status: 401 },
      );
    }

    const ok = await verifyPassword(data.password, user.credential.passwordHash);
    if (!ok) {
      return NextResponse.json(
        { error: 'E-posta veya şifre hatalı', code: 'INVALID_CREDENTIALS' },
        { status: 401 },
      );
    }

    if (user.status === 'SUSPENDED') {
      return NextResponse.json(
        { error: 'Hesabınız askıya alınmış', code: 'ACCOUNT_SUSPENDED' },
        { status: 403 },
      );
    }

    if (user.twoFactorEnabled) {
      const tempToken = await signRefreshToken({ sub: user.id, jti: '2fa-' + Date.now() });
      return NextResponse.json(
        {
          message: 'İki faktörlü doğrulama gerekli',
          requires2fa: true,
          tempToken,
        },
        { status: 200 },
      );
    }

    const accessToken = await signAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role,
      username: user.username,
    });
    const refreshToken = await signRefreshToken({ sub: user.id, jti: crypto.randomUUID() });

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return NextResponse.json(
      {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          displayName: user.displayName,
          role: user.role,
          status: user.status,
          twoFactorEnabled: user.twoFactorEnabled,
          locale: user.locale,
          currency: user.currency,
          avatarUrl: user.avatarUrl,
        },
      },
      { status: 200 },
    );
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json(
        {
          error: err.issues[0]?.message ?? 'Geçersiz veri',
          code: 'VALIDATION_ERROR',
          issues: err.issues,
        },
        { status: 400 },
      );
    }
    console.error('[login] error', err);
    return NextResponse.json(
      { error: 'Bir hata oluştu, lütfen tekrar deneyin', code: 'INTERNAL_ERROR' },
      { status: 500 },
    );
  }
}

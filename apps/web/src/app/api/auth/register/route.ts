import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { prisma } from '@cyberlisans/db';
import { registerSchema } from '@cyberlisans/validators/auth';
import { hashPassword } from '@cyberlisans/auth/password';
import { signEmailVerifyToken } from '@cyberlisans/auth/jwt';
import { randomBytes } from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = registerSchema.parse(body);

    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      return NextResponse.json(
        { error: 'Bu e-posta adresi zaten kayıtlı', code: 'EMAIL_TAKEN' },
        { status: 409 },
      );
    }

    const existingUsername = await prisma.user.findUnique({ where: { username: data.username } });
    if (existingUsername) {
      return NextResponse.json(
        { error: 'Bu kullanıcı adı alınmış', code: 'USERNAME_TAKEN' },
        { status: 409 },
      );
    }

    let referredById: string | null = null;
    if (data.referralCode) {
      const ref = await prisma.user.findUnique({ where: { referralCode: data.referralCode } });
      if (!ref) {
        return NextResponse.json(
          { error: 'Geçersiz davet kodu', code: 'INVALID_REFERRAL' },
          { status: 400 },
        );
      }
      referredById = ref.id;
    }

    const passwordHash = await hashPassword(data.password);

    let referralCode = randomBytes(8).toString('hex').toUpperCase();
    for (let i = 0; i < 5; i++) {
      const exists = await prisma.user.findUnique({ where: { referralCode } });
      if (!exists) break;
      referralCode = randomBytes(8).toString('hex').toUpperCase();
    }

    const user = await prisma.user.create({
      data: {
        email: data.email,
        username: data.username,
        displayName: data.displayName ?? null,
        locale: data.locale,
        currency: data.currency,
        isAdult: data.isAdult,
        marketingOptIn: false,
        referralCode,
        referredById,
        status: 'PENDING_VERIFICATION',
        credential: {
          create: { passwordHash },
        },
        wallet: {
          create: { balanceTry: 0, balanceUsd: 0, balanceEur: 0, balanceUsdt: 0 },
        },
      },
    });

    const ip = req.headers.get('x-forwarded-for') ?? null;
    const ua = req.headers.get('user-agent') ?? null;
    await prisma.consentRecord.createMany({
      data: [
        {
          userId: user.id,
          email: user.email,
          type: 'KVKK',
          granted: data.consentKvkk,
          documentVersion: '1.0',
          ipAddress: ip,
          userAgent: ua,
        },
        {
          userId: user.id,
          email: user.email,
          type: 'TERMS',
          granted: data.consentTerms,
          documentVersion: '1.0',
          ipAddress: ip,
          userAgent: ua,
        },
        {
          userId: user.id,
          email: user.email,
          type: 'AGE_VERIFICATION',
          granted: data.isAdult,
          documentVersion: '1.0',
          ipAddress: ip,
          userAgent: ua,
        },
      ],
    });

    try {
      const token = await signEmailVerifyToken({ sub: user.id, email: user.email });
      const appUrl = process.env['NEXT_PUBLIC_APP_URL'] ?? 'http://localhost:3000';
      const link = `${appUrl}/verify-email?token=${token}`;
      console.log('[register] verify link:', link);
    } catch (err) {
      console.error('[register] email verify token failed', err);
    }

    return NextResponse.json(
      {
        message: 'Kayıt başarılı. E-posta adresinizi doğrulayın.',
        userId: user.id,
        email: user.email,
      },
      { status: 201 },
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
    console.error('[register] error', err);
    return NextResponse.json(
      { error: 'Bir hata oluştu, lütfen tekrar deneyin', code: 'INTERNAL_ERROR' },
      { status: 500 },
    );
  }
}

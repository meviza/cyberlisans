import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { prisma } from '@cyberlisans/db';
import { resetPasswordSchema } from '@cyberlisans/validators/auth';
import { hashPassword } from '@cyberlisans/auth/password';
import { verifyPasswordResetToken } from '@cyberlisans/auth/jwt';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = resetPasswordSchema.parse(body);

    const payload = await verifyPasswordResetToken(data.token);
    if (!payload || payload.type !== 'password_reset') {
      return NextResponse.json(
        { error: 'Geçersiz veya süresi dolmuş token', code: 'INVALID_TOKEN' },
        { status: 401 },
      );
    }

    const passwordHash = await hashPassword(data.password);

    await prisma.userCredential.update({
      where: { userId: payload.sub },
      data: { passwordHash },
    });

    return NextResponse.json({ message: 'Şifreniz başarıyla sıfırlandı' }, { status: 200 });
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
    console.error('[reset-password] error', err);
    return NextResponse.json(
      { error: 'Geçersiz veya süresi dolmuş token', code: 'INVALID_TOKEN' },
      { status: 401 },
    );
  }
}

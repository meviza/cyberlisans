import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@cyberlisans/db';
import { verifyEmailVerifyToken } from '@cyberlisans/auth/jwt';

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();
    if (!token) {
      return NextResponse.json({ error: 'Token gerekli', code: 'NO_TOKEN' }, { status: 400 });
    }

    const payload = await verifyEmailVerifyToken(token);
    if (!payload || payload.type !== 'email_verify') {
      return NextResponse.json({ error: 'Geçersiz token', code: 'INVALID_TOKEN' }, { status: 401 });
    }

    await prisma.user.update({
      where: { id: payload.sub },
      data: { emailVerified: true, status: 'ACTIVE' },
    });

    return NextResponse.json({ message: 'E-posta doğrulandı' }, { status: 200 });
  } catch (err) {
    console.error('[verify-email] error', err);
    return NextResponse.json(
      { error: 'Geçersiz veya süresi dolmuş token', code: 'INVALID_TOKEN' },
      { status: 401 },
    );
  }
}

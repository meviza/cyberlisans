import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@cyberlisans/db';
import { verifyAccessToken } from '@cyberlisans/auth/jwt';

export async function GET(req: NextRequest) {
  try {
    const auth = req.headers.get('authorization');
    if (!auth?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized', code: 'NO_TOKEN' }, { status: 401 });
    }
    const token = auth.slice(7);
    const payload = await verifyAccessToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized', code: 'INVALID_TOKEN' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        role: true,
        status: true,
        twoFactorEnabled: true,
        locale: true,
        currency: true,
        avatarUrl: true,
        emailVerified: true,
      },
    });
    if (!user) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı', code: 'USER_NOT_FOUND' },
        { status: 401 },
      );
    }
    return NextResponse.json({ user }, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Unauthorized', code: 'INVALID_TOKEN' }, { status: 401 });
  }
}

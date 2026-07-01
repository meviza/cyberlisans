import { NextRequest, NextResponse } from 'next/server';
import { verifyRefreshToken, signAccessToken } from '@cyberlisans/auth/jwt';
import { prisma } from '@cyberlisans/db';

export async function POST(req: NextRequest) {
  try {
    const { refreshToken } = await req.json();
    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Refresh token gerekli', code: 'NO_TOKEN' },
        { status: 400 },
      );
    }

    const payload = await verifyRefreshToken(refreshToken);
    if (!payload || payload.type !== 'refresh') {
      return NextResponse.json({ error: 'Geçersiz token', code: 'INVALID_TOKEN' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı', code: 'USER_NOT_FOUND' },
        { status: 401 },
      );
    }

    const accessToken = await signAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role,
      username: user.username,
    });

    return NextResponse.json({ accessToken }, { status: 200 });
  } catch (err) {
    console.error('[refresh] error', err);
    return NextResponse.json(
      { error: 'Geçersiz veya süresi dolmuş token', code: 'INVALID_TOKEN' },
      { status: 401 },
    );
  }
}

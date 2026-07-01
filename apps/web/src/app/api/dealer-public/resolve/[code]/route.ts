import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const API_URL =
  process.env['NEXT_PUBLIC_API_URL'] ?? process.env['API_INTERNAL_URL'] ?? 'http://localhost:3001';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  if (!code || code.length < 3) {
    return NextResponse.json({ error: 'Invalid code' }, { status: 400 });
  }
  try {
    const res = await fetch(`${API_URL}/dealer-public/resolve/${code}`, {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });
    const contentType = res.headers.get('content-type') ?? '';
    const data = contentType.includes('application/json') ? await res.json() : await res.text();
    if (!res.ok) {
      return NextResponse.json(
        typeof data === 'object' && data !== null ? data : { error: String(data) },
        { status: res.status },
      );
    }
    return NextResponse.json(data, { headers: { 'Cache-Control': 'public, max-age=60' } });
  } catch (err) {
    console.error('[API /dealer-public/resolve] forward error', err);
    return NextResponse.json({ error: 'Upstream error' }, { status: 502 });
  }
}

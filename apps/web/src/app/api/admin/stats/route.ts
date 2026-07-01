import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 300;

const API_URL =
  process.env['NEXT_PUBLIC_API_URL'] ?? process.env['API_INTERNAL_URL'] ?? 'http://localhost:3001';

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized', code: 'NO_TOKEN' }, { status: 401 });
  }

  try {
    const res = await fetch(`${API_URL}/admin/stats`, {
      headers: {
        Authorization: auth,
        'Content-Type': 'application/json',
      },
      next: { revalidate: 300 },
    });

    const contentType = res.headers.get('content-type') ?? '';
    const data = contentType.includes('application/json') ? await res.json() : await res.text();

    if (!res.ok) {
      return NextResponse.json(typeof data === 'object' ? data : { error: String(data) }, {
        status: res.status,
      });
    }

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'private, max-age=300, stale-while-revalidate=600',
      },
    });
  } catch (err) {
    console.error('[API /admin/stats] forward error', err);
    return NextResponse.json({ error: 'Upstream error' }, { status: 502 });
  }
}

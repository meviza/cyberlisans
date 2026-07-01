import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const API_URL =
  process.env['NEXT_PUBLIC_API_URL'] ?? process.env['API_INTERNAL_URL'] ?? 'http://localhost:3001';

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized', code: 'NO_TOKEN' }, { status: 401 });
  }

  const url = new URL(req.url);
  const limit = url.searchParams.get('limit') ?? '20';
  const maxStock = url.searchParams.get('maxStock');
  const search = url.searchParams.get('search');
  const page = url.searchParams.get('page') ?? '1';

  const qs = new URLSearchParams();
  qs.set('limit', limit);
  qs.set('page', page);
  if (maxStock) qs.set('maxStock', maxStock);
  if (search) qs.set('search', search);

  try {
    const res = await fetch(`${API_URL}/admin/products?${qs.toString()}`, {
      headers: {
        Authorization: auth,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
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
        'Cache-Control': 'private, no-store',
      },
    });
  } catch (err) {
    console.error('[API /admin/products] forward error', err);
    return NextResponse.json({ error: 'Upstream error' }, { status: 502 });
  }
}

import { NextRequest, NextResponse } from 'next/server';

const API_URL =
  process.env['NEXT_PUBLIC_API_URL'] ?? process.env['API_INTERNAL_URL'] ?? 'http://localhost:3001';

export interface ForwardOptions {
  method?: string;
  body?: unknown;
  searchParams?: Record<string, string | undefined>;
  headers?: Record<string, string>;
}

export async function forwardDealer(
  req: NextRequest,
  upstream: string,
  opts: ForwardOptions = {},
): Promise<NextResponse> {
  const auth = req.headers.get('authorization');
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized', code: 'NO_TOKEN' }, { status: 401 });
  }

  let url = `${API_URL}${upstream}`;
  if (opts.searchParams) {
    const qs = new URLSearchParams();
    Object.entries(opts.searchParams).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') qs.set(k, v);
    });
    const qstr = qs.toString();
    if (qstr) url += `?${qstr}`;
  }

  const headers: Record<string, string> = {
    Authorization: auth,
    'Content-Type': 'application/json',
    ...(opts.headers ?? {}),
  };

  const fetchOpts: RequestInit = {
    method: opts.method ?? 'GET',
    headers,
    cache: 'no-store',
  };
  if (opts.body !== undefined) {
    fetchOpts.body = typeof opts.body === 'string' ? opts.body : JSON.stringify(opts.body);
  }

  try {
    const res = await fetch(url, fetchOpts);

    const contentType = res.headers.get('content-type') ?? '';
    const isJson = contentType.includes('application/json');
    const isCsv = contentType.includes('text/csv');

    if (isCsv) {
      const text = await res.text();
      return new NextResponse(text, {
        status: res.status,
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': res.headers.get('content-disposition') ?? '',
          'Cache-Control': 'no-store',
        },
      });
    }

    const data = isJson ? await res.json() : await res.text();

    if (!res.ok) {
      return NextResponse.json(
        typeof data === 'object' && data !== null ? data : { error: String(data) },
        { status: res.status },
      );
    }

    return NextResponse.json(data, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (err) {
    console.error(`[API ${upstream}] forward error`, err);
    return NextResponse.json({ error: 'Upstream error' }, { status: 502 });
  }
}

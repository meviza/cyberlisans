import type { NextRequest } from 'next/server';
import app from '@cyberlisans/api/app';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function readBody(req: NextRequest): Promise<Uint8Array | undefined> {
  if (req.method === 'GET' || req.method === 'HEAD') return undefined;
  if (!req.body) return undefined;
  const chunks: Buffer[] = [];
  const reader = req.body.getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) chunks.push(Buffer.from(value));
  }
  return chunks.length ? new Uint8Array(Buffer.concat(chunks)) : undefined;
}

function stripApiPrefix(pathname: string): string {
  if (pathname === '/api') return '/';
  if (pathname.startsWith('/api/')) return pathname.slice(4);
  return pathname;
}

function buildFetchRequest(req: NextRequest, body: Uint8Array | undefined): Request {
  const headers = new Headers();
  req.headers.forEach((value, key) => headers.set(key, value));
  const init: RequestInit = {
    method: req.method,
    headers,
  };
  if (body !== undefined) {
    init.body = body;
    (init as RequestInit & { duplex?: 'half' }).duplex = 'half';
  }
  const url = new URL(req.url);
  url.pathname = stripApiPrefix(url.pathname);
  return new Request(url.toString(), init);
}

async function handle(req: NextRequest): Promise<Response> {
  try {
    const body = await readBody(req);
    const honoReq = buildFetchRequest(req, body);
    const response = await app.fetch(honoReq);
    return response;
  } catch (err) {
    console.error('[api/[...path]] error', err);
    return new Response(
      JSON.stringify({ error: 'Internal Server Error', code: 'INTERNAL_ERROR' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const PATCH = handle;
export const DELETE = handle;
export const OPTIONS = handle;
export const HEAD = handle;

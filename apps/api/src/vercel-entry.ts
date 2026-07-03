import type { IncomingMessage, ServerResponse } from 'http';
import app from './app.js';

type VercelRequest = IncomingMessage & {
  method?: string;
  url?: string;
  headers: IncomingMessage['headers'];
};

type VercelResponse = ServerResponse;

function readBody(req: IncomingMessage): Promise<Uint8Array | undefined> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', () => resolve(chunks.length ? new Uint8Array(Buffer.concat(chunks)) : undefined));
    req.on('error', reject);
  });
}

function buildFetchRequest(req: VercelRequest, body: Uint8Array | undefined): Request {
  const protocol = (req.headers['x-forwarded-proto'] as string) ?? 'https';
  const host =
    (req.headers['x-forwarded-host'] as string) ?? (req.headers['host'] as string) ?? 'localhost';
  const url = `${protocol}://${host}${req.url ?? '/'}`;

  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) headers.set(key, value.join(', '));
    else headers.set(key, value);
  }

  const init: RequestInit = {
    method: req.method ?? 'GET',
    headers,
  };

  if (body !== undefined && req.method && !['GET', 'HEAD'].includes(req.method.toUpperCase())) {
    init.body = body;
    (init as RequestInit & { duplex?: 'half' }).duplex = 'half';
  }

  return new Request(url, init);
}

function setHeaders(res: VercelResponse, response: Response): void {
  response.headers.forEach((value, key) => {
    if (key.toLowerCase() === 'set-cookie') {
      res.appendHeader(key, value);
      return;
    }
    res.setHeader(key, value);
  });
}

async function streamBody(res: VercelResponse, response: Response): Promise<void> {
  if (!response.body) {
    res.end();
    return;
  }
  const reader = response.body.getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    res.write(Buffer.from(value));
  }
  res.end();
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  try {
    const body = await readBody(req);
    const honoReq = buildFetchRequest(req, body);
    const response = await app.fetch(honoReq);
    res.statusCode = response.status;
    setHeaders(res, response);
    await streamBody(res, response);
  } catch (err) {
    console.error('[vercel-entry] unhandled error', err);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
    }
    res.end(JSON.stringify({ error: 'Internal Server Error', code: 'INTERNAL_ERROR' }));
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};

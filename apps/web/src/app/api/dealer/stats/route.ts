import { NextRequest } from 'next/server';
import { forwardDealer } from '../_forward';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const params: Record<string, string | undefined> = {
    from: url.searchParams.get('from') ?? undefined,
    to: url.searchParams.get('to') ?? undefined,
  };
  return forwardDealer(req, '/dealer/stats', { searchParams: params });
}

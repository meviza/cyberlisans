import { NextRequest } from 'next/server';
import { forwardDealer } from '../_forward';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const params: Record<string, string | undefined> = {
    page: url.searchParams.get('page') ?? '1',
    limit: url.searchParams.get('limit') ?? '20',
    status: url.searchParams.get('status') ?? undefined,
  };
  return forwardDealer(req, '/dealer/commissions', { searchParams: params });
}

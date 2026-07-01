import { NextRequest } from 'next/server';
import { forwardAdmin } from '../../../_forward';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return forwardAdmin(req, `/admin/payments/${id}/retry`, { method: 'POST' });
}

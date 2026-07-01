import { NextRequest } from 'next/server';
import { forwardAdmin } from '../../../_forward';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let body: unknown = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  return forwardAdmin(req, `/admin/users/${id}/wallet-adjust`, { method: 'POST', body });
}

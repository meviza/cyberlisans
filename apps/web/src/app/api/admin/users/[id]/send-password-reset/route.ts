import { NextRequest } from 'next/server';
import { forwardAdmin } from '../../../_forward';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return forwardAdmin(req, `/admin/users/${id}/send-password-reset`, { method: 'POST' });
}

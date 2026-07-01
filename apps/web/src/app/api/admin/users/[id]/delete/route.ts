import { NextRequest } from 'next/server';
import { forwardAdmin } from '../../../_forward';

export const dynamic = 'force-dynamic';

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return forwardAdmin(req, `/admin/users/${id}`, { method: 'DELETE' });
}

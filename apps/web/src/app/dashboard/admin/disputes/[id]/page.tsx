import { redirect } from 'next/navigation';

export default async function LegacyAdminDisputeDetailRedirect({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/admin/disputes/${id}`);
}

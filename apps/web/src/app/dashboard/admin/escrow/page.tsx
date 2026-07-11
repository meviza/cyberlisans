import { redirect } from 'next/navigation';

export default function LegacyAdminEscrowRedirect() {
  redirect('/admin/escrow');
}

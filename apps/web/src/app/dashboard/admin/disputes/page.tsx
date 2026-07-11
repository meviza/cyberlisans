import { redirect } from 'next/navigation';

export default function LegacyAdminDisputesRedirect() {
  redirect('/admin/disputes');
}

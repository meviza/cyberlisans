import { redirect } from 'next/navigation';

export default function LegacyAdminProductsRedirect() {
  redirect('/admin/product-approvals');
}

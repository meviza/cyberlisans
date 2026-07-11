import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  Package,
  Wallet,
  Receipt,
  Settings,
  Store,
  Gavel,
  ShieldCheck,
  Tags,
  Award,
  ShoppingCart,
  CreditCard,
  Users,
  ScrollText,
  Boxes,
  UserCheck,
} from 'lucide-react';

export type ShellVariant = 'customer' | 'seller' | 'admin';

export interface ShellNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
  group?: string;
}

export const CUSTOMER_NAV: ShellNavItem[] = [
  { href: '/dashboard', label: 'Genel bakış', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/orders', label: 'Siparişler', icon: Receipt },
  { href: '/dashboard/wallet', label: 'Cüzdan', icon: Wallet },
  { href: '/dashboard/settings', label: 'Ayarlar', icon: Settings },
  { href: '/dashboard/seller', label: 'Satıcı ol', icon: Store },
];

export const SELLER_NAV: ShellNavItem[] = [
  { href: '/dashboard/seller', label: 'Özet', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/seller/products', label: 'Ürünler', icon: Package },
  { href: '/dashboard/seller/payouts', label: 'Payout', icon: Wallet },
  { href: '/dashboard/orders', label: 'Siparişler', icon: Receipt },
  { href: '/dashboard/settings', label: 'Ayarlar', icon: Settings },
];

export const ADMIN_NAV: ShellNavItem[] = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true, group: 'Genel' },
  {
    href: '/admin/sellers',
    label: 'Satıcılar / KYC',
    icon: UserCheck,
    group: 'Marketplace',
  },
  {
    href: '/admin/product-approvals',
    label: 'Ürün onayları',
    icon: Boxes,
    group: 'Marketplace',
  },
  { href: '/admin/escrow', label: 'Escrow', icon: ShieldCheck, group: 'Marketplace' },
  { href: '/admin/disputes', label: 'Disputes', icon: Gavel, group: 'Marketplace' },
  { href: '/admin/products', label: 'Ürünler', icon: Package, group: 'Katalog' },
  { href: '/admin/categories', label: 'Kategoriler', icon: Tags, group: 'Katalog' },
  { href: '/admin/brands', label: 'Markalar', icon: Award, group: 'Katalog' },
  { href: '/admin/orders', label: 'Siparişler', icon: ShoppingCart, group: 'Operasyon' },
  { href: '/admin/payments', label: 'Ödemeler', icon: CreditCard, group: 'Operasyon' },
  { href: '/admin/users', label: 'Kullanıcılar', icon: Users, group: 'Operasyon' },
  { href: '/admin/audit', label: 'Audit log', icon: ScrollText, group: 'Sistem' },
  { href: '/admin/privacy', label: 'KVKK / GDPR', icon: ShieldCheck, group: 'Sistem' },
  { href: '/admin/settings', label: 'Ayarlar', icon: Settings, group: 'Sistem' },
];

export function navForVariant(variant: ShellVariant): ShellNavItem[] {
  if (variant === 'seller') return SELLER_NAV;
  if (variant === 'admin') return ADMIN_NAV;
  return CUSTOMER_NAV;
}

export function isNavActive(pathname: string, item: ShellNavItem): boolean {
  if (item.exact) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export const VARIANT_LABEL: Record<ShellVariant, string> = {
  customer: 'Alıcı',
  seller: 'Satıcı',
  admin: 'Super Admin',
};

export const VARIANT_HOME: Record<ShellVariant, string> = {
  customer: '/dashboard',
  seller: '/dashboard/seller',
  admin: '/admin',
};

import type { Metadata } from 'next';
import Link from 'next/link';
import { StorefrontHeader } from '@/components/store/storefront-header';
import { FooterSection } from '@/components/sections/footer-section';

export const metadata: Metadata = {
  title: 'Kariyer',
  description: 'CyberLisans ekibine katıl.',
};

export default function CareersPage() {
  return (
    <>
      <StorefrontHeader />
      <main className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
        <p className="text-sm font-semibold text-brand-accent">Kariyer</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white">Açık pozisyonlar</h1>
        <p className="mt-4 text-brand-text-secondary">
          Şu an yayında açık ilan yok. Yetenekli mühendis ve operasyon adayları için{' '}
          <Link href="/contact" className="text-brand-accent hover:underline">
            iletişim
          </Link>{' '}
          formundan bize yazabilirsin.
        </p>
      </main>
      <FooterSection />
    </>
  );
}

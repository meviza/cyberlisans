import type { Metadata } from 'next';
import Link from 'next/link';
import { StorefrontHeader } from '@/components/store/storefront-header';
import { FooterSection } from '@/components/sections/footer-section';

export const metadata: Metadata = {
  title: 'Çerez Politikası',
  description: 'CyberLisans çerez kullanımı.',
};

export default function CookiesPage() {
  return (
    <>
      <StorefrontHeader />
      <main className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
        <p className="text-sm font-semibold text-brand-accent">Yasal</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white">Çerez Politikası</h1>
        <div className="prose prose-invert mt-8 max-w-none space-y-4 text-sm leading-relaxed text-brand-text-secondary">
          <p>
            CyberLisans, oturum yönetimi, sepet, dil/para birimi tercihi ve güvenlik için zorunlu
            çerezler kullanır. Analitik çerezler yalnızca onayınızla etkinleşir.
          </p>
          <p>
            Detaylı kişisel veri işleme metni için{' '}
            <Link href="/legal/kvkk" className="text-brand-accent hover:underline">
              KVKK
            </Link>{' '}
            ve{' '}
            <Link href="/legal/privacy" className="text-brand-accent hover:underline">
              Gizlilik
            </Link>{' '}
            sayfalarına bakın.
          </p>
        </div>
      </main>
      <FooterSection />
    </>
  );
}

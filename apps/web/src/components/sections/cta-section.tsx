import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function CTASection() {
  return (
    <section className="section-pad">
      <div className="mx-auto max-w-7xl">
        <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-brand-surface px-6 py-14 sm:px-12">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-hero-glow opacity-70"
          />
          <div className="relative mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Hemen başla — alıcı veya satıcı
            </h2>
            <p className="mt-4 text-brand-text-secondary">
              Hesabını oluştur, mağazadan alışveriş yap veya KYC ile satıcı paneline başvur.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link href="/register" className="btn-primary-solid">
                Ücretsiz kayıt
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/products" className="btn-secondary-outline">
                Ürünleri incele
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

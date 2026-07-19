import type { Metadata } from 'next';
import Link from 'next/link';
import { Shield, Zap, Building2, ArrowRight } from 'lucide-react';
import { StorefrontHeader } from '@/components/store/storefront-header';
import { FooterSection } from '@/components/sections/footer-section';

export const metadata: Metadata = {
  title: 'Hakkımızda',
  description:
    'CyberLisans — yazılım ve API lisanslarının doğrudan satışı. Kurumsal faturalandırma ve anında dijital teslimat.',
};

const VALUES = [
  {
    icon: Shield,
    title: 'Doğrudan satış',
    desc: 'Ürünler şirket envanterinden sağlanır. Tek satıcı: CyberLisans.',
  },
  {
    icon: Zap,
    title: 'Anında teslim',
    desc: 'Stoktaki lisans ve API paketleri saniyeler içinde hesaba düşer.',
  },
  {
    icon: Building2,
    title: 'Kurumsal uyum',
    desc: 'Faturalı satış, KVKK uyumlu altyapı ve şeffaf fiyatlandırma.',
  },
];

export default function AboutPage() {
  return (
    <>
      <StorefrontHeader />
      <main>
        <section className="relative overflow-hidden border-b border-white/[0.06]">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-hero-glow opacity-70"
          />
          <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
            <p className="text-sm font-semibold text-brand-accent">Hakkımızda</p>
            <h1 className="mt-3 max-w-2xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Yazılım ve API lisansı — doğrudan satış
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-brand-text-secondary">
              CyberLisans, yazılım lisansları ve API erişim paketlerini kendi stokundan doğrudan
              satan dijital bir mağazadır. Güvenli ödeme, faturalandırma ve anında teslimat.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/products" className="btn-primary-solid">
                Lisansları incele
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/contact" className="btn-secondary-outline">
                İletişim
              </Link>
            </div>
          </div>
        </section>

        <section className="section-pad">
          <div className="mx-auto max-w-7xl">
            <h2 className="section-title">Neyi farklı yapıyoruz?</h2>
            <p className="section-lead">
              Aracı model yok. Tek satıcı, net fiyat, kurumsal faturalandırma.
            </p>
            <div className="mt-12 grid gap-4 md:grid-cols-3">
              {VALUES.map((v) => (
                <div key={v.title} className="surface-card p-6">
                  <v.icon className="mb-3 h-5 w-5 text-brand-accent" />
                  <h3 className="font-semibold text-white">{v.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-brand-text-secondary">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="band-light section-pad">
          <div className="relative mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-semibold tracking-tight text-brand-ink sm:text-3xl">
              Kurumsal lisans ihtiyacınız mı var?
            </h2>
            <p className="mt-4 text-brand-ink-muted">
              Toplu yazılım lisansı veya API paketleri için faturalı teklif alın.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/contact" className="btn-on-light">
                Teklif iste
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/products" className="btn-on-light-outline">
                Mağazaya git
              </Link>
            </div>
          </div>
        </section>
      </main>
      <FooterSection />
    </>
  );
}

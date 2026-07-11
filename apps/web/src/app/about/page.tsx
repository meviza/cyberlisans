import type { Metadata } from 'next';
import Link from 'next/link';
import { Shield, Zap, Users, ArrowRight } from 'lucide-react';
import { StorefrontHeader } from '@/components/store/storefront-header';
import { FooterSection } from '@/components/sections/footer-section';

export const metadata: Metadata = {
  title: 'Hakkımızda',
  description: 'CyberLisans — escrow korumalı dijital lisans marketplace.',
};

const VALUES = [
  {
    icon: Shield,
    title: 'Escrow güveni',
    desc: 'Ödeme 7 gün platform kasasında tutulur. Alıcı ve satıcı aynı korumada.',
  },
  {
    icon: Zap,
    title: 'Anında teslim',
    desc: 'Stoktaki key ve lisanslar saniyeler içinde hesaba düşer.',
  },
  {
    icon: Users,
    title: 'Onaylı satıcılar',
    desc: 'KYC ve ürün onayı olmadan vitrine çıkılmaz. Kalite kontrolü platformda.',
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
              Dijital lisansları güvenle alıp satmanın modern yolu
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-brand-text-secondary">
              CyberLisans, Türkiye odaklı P2P dijital ürün marketplace’idir. Oyun key’leri, yazılım
              lisansları ve AI API kredileri — escrow, şeffaf komisyon ve net roller ile.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/products" className="btn-primary-solid">
                Mağazaya git
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/seller" className="btn-secondary-outline">
                Satıcı ol
              </Link>
            </div>
          </div>
        </section>

        <section className="section-pad">
          <div className="mx-auto max-w-7xl">
            <h2 className="section-title">Neyi farklı yapıyoruz?</h2>
            <p className="section-lead">
              FunPay / GamsGo modelini Türkiye pazarına uyarladık — sade arayüz, kurumsal güven.
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
            <h2 className="text-3xl font-semibold tracking-tight text-brand-ink">
              Üç rol, tek platform
            </h2>
            <p className="mt-4 text-brand-ink-muted">
              Alıcılar güvenle alışveriş yapar, satıcılar stok ve payout yönetir, admin ekibi KYC,
              ürün onayı ve dispute süreçlerini yürütür.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/register" className="btn-on-light">
                Ücretsiz kayıt
              </Link>
              <Link href="/contact" className="btn-on-light-outline">
                İletişim
              </Link>
            </div>
          </div>
        </section>
      </main>
      <FooterSection />
    </>
  );
}

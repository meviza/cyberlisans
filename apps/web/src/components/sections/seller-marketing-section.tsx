'use client';

import Link from 'next/link';
import { ArrowRight, KeyRound, Building2, HeadphonesIcon } from 'lucide-react';
import { ScrollReveal } from '@/components/motion/scroll-reveal';

const STEPS = [
  {
    icon: KeyRound,
    title: 'Lisans seç',
    desc: 'Yazılım veya API paketini mağazadan seçin.',
  },
  {
    icon: Building2,
    title: 'Güvenle öde',
    desc: 'Kart ile ödeme yapın; fatura dijital iletilir.',
  },
  {
    icon: HeadphonesIcon,
    title: 'Teslim al',
    desc: 'Lisans anahtarı veya erişim bilgisi hesabınıza düşer.',
  },
];

/** Kept for optional reuse; homepage no longer promotes multi-party selling. */
export function SellerMarketingSection() {
  return (
    <section className="band-light section-pad">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-brand-accent/15 blur-3xl animate-soft-blob"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 bottom-0 h-80 w-80 rounded-full bg-sky-300/30 blur-3xl animate-soft-blob animation-delay-500"
      />

      <div className="relative mx-auto max-w-7xl">
        <ScrollReveal className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold text-brand-accent">Doğrudan satış</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-brand-ink sm:text-4xl">
            Yazılım ve API lisansı tek yerden
          </h2>
          <p className="mt-4 text-base leading-relaxed text-brand-ink-muted sm:text-lg">
            CyberLisans kendi stokundan lisans satar. Şeffaf fiyat, anında dijital teslimat ve
            kurumsal faturalandırma.
          </p>
        </ScrollReveal>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <ScrollReveal key={s.title} delayMs={i * 100}>
              <div className="surface-light-card h-full p-6">
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-accent/10 text-brand-accent">
                  <s.icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-brand-ink">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-brand-ink-muted">{s.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal delayMs={200} className="mt-12">
          <div className="surface-light-card flex flex-col items-start justify-between gap-6 p-6 sm:flex-row sm:items-center sm:p-8">
            <div>
              <p className="font-semibold text-brand-ink">Kurumsal toplu alım</p>
              <p className="mt-1 text-sm text-brand-ink-muted">
                Faturalı teklif için iletişim formunu kullanın.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/products" className="btn-on-light">
                Lisansları incele
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/contact" className="btn-on-light-outline">
                İletişim
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

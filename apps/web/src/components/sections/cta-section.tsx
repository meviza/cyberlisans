'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ScrollReveal } from '@/components/motion/scroll-reveal';

export function CTASection() {
  return (
    <section className="band-light section-pad">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-20 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-brand-accent/20 blur-3xl animate-soft-blob"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 bottom-0 h-56 w-56 rounded-full bg-indigo-200/50 blur-3xl animate-soft-blob animation-delay-300"
      />

      <div className="relative mx-auto max-w-7xl">
        <ScrollReveal>
          <div className="surface-light-card relative overflow-hidden px-6 py-14 sm:px-12">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-accent/40 to-transparent"
            />
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-semibold tracking-tight text-brand-ink sm:text-4xl">
                Yazılım ve API lisansına hemen başla
              </h2>
              <p className="mt-4 text-brand-ink-muted">
                Mağazadan lisans seçin veya kurumsal toplu alım için bizimle iletişime geçin.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Link href="/products" className="btn-on-light">
                  Lisansları incele
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/contact" className="btn-on-light-outline">
                  İletişim
                </Link>
                <Link
                  href="/about"
                  className="text-sm font-medium text-brand-ink-muted underline-offset-4 hover:text-brand-accent hover:underline"
                >
                  Hakkımızda
                </Link>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

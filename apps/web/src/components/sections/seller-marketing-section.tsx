'use client';

import Link from 'next/link';
import { ArrowRight, BadgeCheck, KeyRound, LineChart, Shield } from 'lucide-react';
import { ScrollReveal } from '@/components/motion/scroll-reveal';

const STEPS = [
  {
    icon: BadgeCheck,
    title: 'Başvur & KYC',
    desc: 'Vergi bilgilerin ve kimlik doğrulama ile satıcı profilini oluştur.',
  },
  {
    icon: KeyRound,
    title: 'Ürün & stok ekle',
    desc: 'Key / lisans stoklarını yükle; admin onayı sonrası vitrine çık.',
  },
  {
    icon: LineChart,
    title: 'Sat & payout al',
    desc: 'Escrow sonrası bakiye birikir; payout talebi ile çekim yap.',
  },
];

export function SellerMarketingSection() {
  return (
    <section className="band-light section-pad">
      {/* Soft animated blobs — Laravel Cloud energy without neon */}
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
          <p className="text-sm font-semibold text-brand-accent">Satıcı ol</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-brand-ink sm:text-4xl">
            Marketplace’te güvenle sat
          </h2>
          <p className="mt-4 text-base leading-relaxed text-brand-ink-muted sm:text-lg">
            Escrow korumalı P2P model. Şeffaf komisyon, admin onaylı ürünler, anında key teslim
            altyapısı — Laravel Cloud sakinliğinde modern bir satıcı deneyimi.
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
            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-lg bg-brand-accent/10 p-2 text-brand-accent">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-brand-ink">
                  %12 varsayılan komisyon · 7 gün escrow
                </p>
                <p className="mt-1 text-sm text-brand-ink-muted">
                  Onaylı satıcılar için net kurallar. Dispute sürecinde platform arabulucu.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/seller" className="btn-on-light">
                Satıcı sayfası
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/dashboard/seller/apply" className="btn-on-light-outline">
                Hemen başvur
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

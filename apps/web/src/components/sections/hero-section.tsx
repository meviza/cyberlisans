'use client';

import Link from 'next/link';
import { ArrowRight, ShieldCheck, Zap, Lock } from 'lucide-react';

export interface HeroSectionProps {
  scene?: React.ReactNode;
}

export function HeroSection({ scene }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden bg-brand-bg">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-hero-glow" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-grid-faint opacity-40"
        style={{
          backgroundSize: '56px 56px',
          maskImage: 'radial-gradient(ellipse at center, black 20%, transparent 70%)',
        }}
      />

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:py-28 lg:px-8">
        <div className="flex flex-col justify-center animate-fade-up">
          <span className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs font-medium text-brand-text-secondary">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-success" />
            Escrow korumalı · Anında teslim
          </span>

          <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-[3.25rem] lg:leading-[1.1]">
            Dijital lisansları <span className="gradient-text">güvenle al, güvenle sat</span>
          </h1>

          <p className="mt-6 max-w-lg text-base leading-relaxed text-brand-text-secondary sm:text-lg">
            Oyun key’leri, yazılım lisansları ve AI kredileri için P2P marketplace. Ödemeniz
            escrow’da güvende; teslimat saniyeler içinde.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/products" className="btn-primary-solid">
              Mağazaya git
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/seller" className="btn-secondary-outline">
              Satıcı ol
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              { icon: Zap, label: 'Anında teslim', desc: 'Otomatik key' },
              { icon: ShieldCheck, label: 'Escrow koruma', desc: '7 gün güvence' },
              { icon: Lock, label: 'Güvenli ödeme', desc: 'Çoklu yöntem' },
            ].map((t) => (
              <div
                key={t.label}
                className="flex items-start gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-3"
              >
                <t.icon className="mt-0.5 h-4 w-4 shrink-0 text-brand-accent" />
                <div>
                  <div className="text-sm font-medium text-white">{t.label}</div>
                  <div className="text-xs text-brand-muted">{t.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative min-h-[320px] sm:min-h-[420px] lg:min-h-[520px]">
          <div className="absolute inset-0 overflow-hidden rounded-2xl border border-white/[0.08] bg-brand-surface shadow-card">
            <div className="absolute inset-0 bg-panel-gradient" />
            {scene ?? (
              <div className="flex h-full items-center justify-center">
                <div className="text-sm text-brand-muted">Sahne yükleniyor…</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

'use client';

import Link from 'next/link';

export interface CTASectionProps {
  scene?: React.ReactNode;
}

export function CTASection({ scene }: CTASectionProps) {
  return (
    <section className="relative overflow-hidden bg-cyber-darker py-20 md:py-32">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(139,92,246,0.25) 0%, transparent 60%), radial-gradient(ellipse at 30% 70%, rgba(0,240,255,0.15) 0%, transparent 50%), radial-gradient(ellipse at 70% 30%, rgba(255,0,200,0.15) 0%, transparent 50%)',
        }}
      />
      {scene && <div className="absolute inset-0">{scene}</div>}

      <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="mb-6 font-display text-4xl font-black leading-tight text-white sm:text-5xl lg:text-6xl">
          Hemen Başla, İlk Alışverişinde{' '}
          <span className="bg-gradient-to-r from-cyber-cyan to-cyber-magenta bg-clip-text text-transparent text-glow-cyan">
            %10 İndirim
          </span>
        </h2>
        <p className="mx-auto mb-10 max-w-2xl text-base text-white/70 sm:text-lg">
          Kayıt ol, cüzdanını yükle, dilediğin lisansı anında al.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 rounded-lg bg-cyber-cyan px-8 py-4 font-display text-base font-black uppercase tracking-wider text-cyber-darker shadow-glow-cyan transition-all hover:brightness-110"
          >
            Ücretsiz Kayıt Ol →
          </Link>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/5 px-8 py-4 font-display text-base font-bold uppercase tracking-wider text-white backdrop-blur-sm transition-all hover:border-cyber-cyan/60 hover:bg-cyber-cyan/10"
          >
            Ürünleri İncele
          </Link>
        </div>
      </div>
    </section>
  );
}

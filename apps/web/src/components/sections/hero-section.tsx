'use client';

import Link from 'next/link';

export interface HeroSectionProps {
  scene?: React.ReactNode;
}

export function HeroSection({ scene }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden bg-cyber-darker">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            'linear-gradient(rgba(0,240,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(0,240,255,0.15) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 75%)',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(0,240,255,0.25), transparent 70%)' }}
      />

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:py-32 lg:px-8">
        <div className="flex flex-col justify-center">
          <span className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-cyber-cyan/40 bg-cyber-cyan/10 px-4 py-1.5 font-mono text-xs uppercase tracking-wider text-cyber-cyan text-glow-cyan">
            <span className="h-2 w-2 animate-pulse rounded-full bg-cyber-cyan" />⚡ Anında Teslim ·
            7/24 Otomatik
          </span>

          <h1 className="mb-6 font-display text-4xl font-black leading-tight text-white sm:text-5xl lg:text-6xl">
            Dijital Lisansların{' '}
            <span className="bg-gradient-to-r from-cyber-cyan via-cyber-purple to-cyber-magenta bg-clip-text text-transparent text-glow-cyan">
              Yeni Adresi
            </span>
          </h1>

          <p className="mb-8 max-w-xl text-base text-white/70 sm:text-lg">
            Steam, PlayStation, Xbox ve daha fazlası için orijinal anahtarlar, yazılım lisansları ve
            AI API kredileri. Saniyeler içinde teslim, güvenli ödeme.
          </p>

          <div className="mb-10 flex flex-wrap items-center gap-4">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-lg bg-cyber-cyan px-6 py-3 font-display text-sm font-bold uppercase tracking-wider text-cyber-darker shadow-glow-cyan transition-all hover:brightness-110"
            >
              Hemen Başla →
            </Link>
            <Link
              href="#nasil-calisir"
              className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/5 px-6 py-3 font-display text-sm font-bold uppercase tracking-wider text-white backdrop-blur-sm transition-all hover:border-cyber-cyan/60 hover:bg-cyber-cyan/10"
            >
              Nasıl Çalışır?
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { icon: '⚡', label: 'Anında Teslim' },
              { icon: '🔒', label: '%100 Güvenli' },
              { icon: '💳', label: 'Çoklu Ödeme' },
              { icon: '🌍', label: 'Global Erişim' },
            ].map((t) => (
              <div
                key={t.label}
                className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80"
              >
                <span className="text-lg">{t.icon}</span>
                <span className="font-mono">{t.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative min-h-[400px] lg:min-h-[560px]">
          <div className="absolute inset-0 rounded-2xl border border-cyber-cyan/20 bg-gradient-to-br from-cyber-cyan/5 via-transparent to-cyber-magenta/5">
            {scene ?? (
              <div className="flex h-full items-center justify-center">
                <div className="font-mono text-sm uppercase tracking-widest text-cyber-cyan/40">
                  3D sahne yükleniyor
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

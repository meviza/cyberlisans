'use client';

import Link from 'next/link';

const plans = [
  {
    name: 'Starter',
    price: 0,
    period: 'ay',
    badge: null,
    features: ['Kayıt + cüzdan', '%1 geri kazanım', 'Standart destek', 'Tüm temel lisanslar'],
    cta: 'Ücretsiz Başla',
    href: '/signup',
    highlight: false,
  },
  {
    name: 'Pro',
    price: 49,
    period: 'ay',
    badge: 'En Popüler',
    features: ['Öncelikli destek', 'Erken erişim kampanyaları', 'Özel sadakat çarpanı', '%2 geri kazanım', 'Hediye seçenekleri'],
    cta: 'Pro\'ya Geç',
    href: '/signup?plan=pro',
    highlight: true,
  },
  {
    name: 'Business',
    price: 199,
    period: 'ay',
    badge: null,
    features: ['API erişimi', 'Beyaz etiket', 'Özel hesap yöneticisi', '%3 geri kazanım', 'Toplu lisans alımları'],
    cta: 'İletişime Geç',
    href: '/contact?plan=business',
    highlight: false,
  },
];

export function PricingSection() {
  return (
    <section className="relative bg-cyber-darker py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="mb-3 font-display text-3xl font-black text-white sm:text-4xl">
            Sana Uygun <span className="text-cyber-cyan text-glow-cyan">Plan</span>
          </h2>
          <p className="mx-auto max-w-2xl text-white/60">
            Bireysel kullanıcıdan işletmeye, herkes için bir plan.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-2xl border p-8 backdrop-blur-sm transition-all ${
                plan.highlight
                  ? 'border-cyber-cyan bg-gradient-to-br from-cyber-cyan/10 to-cyber-purple/10 shadow-glow-cyan scale-105'
                  : 'border-white/10 bg-cyber-dark/60 hover:border-cyber-cyan/40'
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-cyber-cyan px-4 py-1 font-mono text-xs font-bold uppercase tracking-widest text-cyber-darker shadow-glow-cyan">
                  {plan.badge}
                </div>
              )}

              <h3 className="mb-1 font-display text-2xl font-black text-white">{plan.name}</h3>
              <div className="mb-6 flex items-baseline gap-1">
                <span className="font-display text-5xl font-black text-white">{plan.price}</span>
                <span className="font-mono text-sm text-white/60">₺/{plan.period}</span>
              </div>

              <ul className="mb-8 flex-1 space-y-3">
                {plan.features.map((feat) => (
                  <li key={feat} className="flex items-start gap-3 text-sm text-white/80">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 h-4 w-4 flex-shrink-0 text-cyber-cyan">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href}
                className={`inline-flex items-center justify-center rounded-lg px-6 py-3 font-display text-sm font-bold uppercase tracking-wider transition-all ${
                  plan.highlight
                    ? 'bg-cyber-cyan text-cyber-darker shadow-glow-cyan hover:brightness-110'
                    : 'border border-white/20 bg-white/5 text-white hover:border-cyber-cyan/60 hover:bg-cyber-cyan/10'
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
'use client';

import { ScrollReveal } from '@/components/motion/scroll-reveal';

const STATS = [
  { value: '7 gün', label: 'Escrow koruma süresi' },
  { value: '%12', label: 'Varsayılan platform komisyonu' },
  { value: '<5 sn', label: 'Ortalama otomatik teslim' },
  { value: '3 rol', label: 'Alıcı · Satıcı · Admin' },
];

export function StatsSection() {
  return (
    <section className="band-light border-y border-black/[0.04] py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {STATS.map((s, i) => (
            <ScrollReveal key={s.label} delayMs={i * 70}>
              <div className="surface-light-card px-5 py-6 text-center">
                <div className="text-2xl font-semibold tracking-tight text-brand-ink sm:text-3xl">
                  {s.value}
                </div>
                <div className="mt-2 text-xs text-brand-ink-muted sm:text-sm">{s.label}</div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

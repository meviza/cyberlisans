'use client';

import { useRef } from 'react';

const testimonials = [
  { name: 'Ahmet K.', text: 'Steam cüzdanımı 30 saniyede yükledim, mükemmel.', rating: 5, gradient: 'from-cyber-cyan to-cyber-purple' },
  { name: 'Zeynep D.', text: 'Windows lisansı orijinal ve sorunsuz.', rating: 5, gradient: 'from-cyber-magenta to-cyber-purple' },
  { name: 'Mehmet S.', text: 'Discord Nitro en uygun fiyat burada.', rating: 5, gradient: 'from-cyber-purple to-cyber-cyan' },
  { name: 'Elif A.', text: 'Müşteri hizmetleri anında dönüş yaptı.', rating: 5, gradient: 'from-cyber-magenta to-cyber-cyan' },
  { name: 'Can B.', text: 'API kredi satın aldım, 5 dakikada geldi.', rating: 5, gradient: 'from-cyber-cyan to-cyber-magenta' },
  { name: 'Selin T.', text: 'Papara ile ödeme çok kolay.', rating: 5, gradient: 'from-cyber-purple to-cyber-magenta' },
];

function initials(name: string) {
  return name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .toUpperCase();
}

export function TestimonialsSection() {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <section className="relative bg-cyber-dark py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="mb-3 font-display text-3xl font-black text-white sm:text-4xl">
            Müşteriler <span className="text-cyber-magenta text-glow-magenta">Ne Diyor</span>?
          </h2>
          <p className="mx-auto max-w-2xl text-white/60">
            50.000+ kullanıcının güvendiği platform.
          </p>
        </div>

        <div
          ref={scrollRef}
          className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
          style={{ scrollbarWidth: 'thin' }}
        >
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="flex w-[85vw max-w-sm flex-shrink-0 snap-start flex-col rounded-2xl border border-white/10 bg-cyber-darker/60 p-6 backdrop-blur-sm transition-all hover:border-cyber-cyan/40 sm:w-80"
            >
              <div className="mb-1 text-cyber-cyan">{'★'.repeat(t.rating)}</div>
              <p className="mb-6 flex-1 text-base text-white/80">&ldquo;{t.text}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br ${t.gradient} font-display text-sm font-black text-white`}
                >
                  {initials(t.name)}
                </div>
                <div className="font-mono text-sm font-bold text-white">{t.name}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
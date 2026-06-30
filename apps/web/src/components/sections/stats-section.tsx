'use client';

import { useEffect, useRef, useState } from 'react';

declare const window: any;

const stats = [
  { value: 50000, suffix: '+', label: 'Mutlu Müşteri', format: (n: number) => (n / 1000).toFixed(0) + 'K' },
  { value: 200000, suffix: '+', label: 'Teslim Edilen Lisans', format: (n: number) => (n / 1000).toFixed(0) + 'K' },
  { value: 99.9, suffix: '%', label: 'Uptime', format: (n: number) => n.toFixed(1) },
  { value: 4.9, suffix: '/5', label: 'Müşteri Puanı', format: (n: number) => n.toFixed(1) },
];

function Counter({ value, format, suffix }: { value: number; format: (n: number) => string; suffix: string }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new window.IntersectionObserver(
      (entries: any[]) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const start = window.performance.now();
          const duration = 2000;
          const tick = (now: number) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplay(value * eased);
            if (progress < 1) window.requestAnimationFrame(tick);
          };
          window.requestAnimationFrame(tick);
          observer.disconnect();
        });
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [value]);

  return (
    <span ref={ref}>
      {format(display)}
      {suffix}
    </span>
  );
}

export function StatsSection() {
  return (
    <section className="relative overflow-hidden border-y border-cyber-cyan/20 bg-gradient-to-b from-cyber-darker via-cyber-dark to-cyber-darker py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="mb-2 font-display text-4xl font-black text-cyber-cyan text-glow-cyan sm:text-5xl lg:text-6xl">
                <Counter value={s.value} format={s.format} suffix={s.suffix} />
              </div>
              <div className="font-mono text-xs uppercase tracking-widest text-white/60 sm:text-sm">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
'use client';

import Link from 'next/link';
import { categories } from '@/lib/products';

const ICONS: Record<string, React.ReactNode> = {
  gamepad: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8">
      <line x1="6" y1="11" x2="10" y2="11" />
      <line x1="8" y1="9" x2="8" y2="13" />
      <line x1="15" y1="12" x2="15.01" y2="12" />
      <line x1="18" y1="10" x2="18.01" y2="10" />
      <path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258A4 4 0 0 0 17.32 5z" />
    </svg>
  ),
  package: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8">
      <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  ),
  sparkles: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8">
      <path d="M12 3l1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2L12 3z" />
      <path d="M5 3v4M3 5h4M19 17v4M17 19h4" />
    </svg>
  ),
};

const GRADIENTS: Record<string, string> = {
  oyun: 'from-cyber-cyan/20 to-cyber-purple/20',
  yazilim: 'from-cyber-magenta/20 to-cyber-purple/20',
  'ai-api': 'from-cyber-purple/20 to-cyber-cyan/20',
};

export function CategoriesSection() {
  return (
    <section className="relative bg-cyber-darker py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="mb-3 font-display text-3xl font-black text-white sm:text-4xl">
            Kategorileri <span className="text-cyber-cyan text-glow-cyan">Keşfet</span>
          </h2>
          <p className="mx-auto max-w-2xl text-white/60">
            İhtiyacın olan lisans saniyeler içinde kapında.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br ${GRADIENTS[cat.slug]} p-8 backdrop-blur-sm transition-all hover:scale-105 hover:border-cyber-cyan/60 hover:shadow-glow-cyan`}
            >
              <div className="absolute inset-0 bg-cyber-darker/60" />
              <div className="relative flex flex-col items-start gap-4">
                <div className="rounded-xl border border-cyber-cyan/30 bg-cyber-cyan/10 p-3 text-cyber-cyan">
                  {ICONS[cat.icon]}
                </div>
                <div>
                  <h3 className="mb-1 font-display text-2xl font-black text-white">{cat.name}</h3>
                  <p className="font-mono text-sm text-white/60">{cat.count} ürün</p>
                </div>
                <div className="mt-2 font-mono text-xs uppercase tracking-widest text-cyber-cyan opacity-0 transition-opacity group-hover:opacity-100">
                  Keşfet →
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
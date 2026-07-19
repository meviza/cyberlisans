'use client';

import Link from 'next/link';

const PLANS = [
  {
    name: 'Bireysel',
    price: 'Liste fiyatı',
    desc: 'Yazılım ve API lisanslarını doğrudan satın alın.',
    features: ['Anında dijital teslim', 'Güvenli ödeme', 'Hesap paneli', 'Destek'],
    cta: { href: '/products', label: 'Lisansları incele' },
    highlighted: true,
  },
  {
    name: 'Kurumsal',
    price: 'Teklif',
    desc: 'Toplu lisans ve faturalı satış için iletişime geçin.',
    features: ['Toplu lisans', 'Kurumsal fatura', 'Öncelikli destek', 'SLA'],
    cta: { href: '/contact', label: 'Teklif al' },
    highlighted: false,
  },
];

export function PricingSection() {
  return (
    <section id="fiyatlandirma" className="section-pad">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium text-brand-accent">Fiyatlandırma</p>
          <h2 className="section-title mt-2">Şeffaf, doğrudan satış</h2>
          <p className="section-lead">Listelenen fiyat nettir. Gizli ek ücret yoktur.</p>
        </div>
        <div className="mx-auto mt-12 grid max-w-4xl gap-4 md:grid-cols-2">
          {PLANS.map((p) => (
            <div
              key={p.name}
              className={`surface-card flex flex-col p-6 ${
                p.highlighted ? 'border-brand-accent/40' : ''
              }`}
            >
              <h3 className="text-lg font-semibold text-white">{p.name}</h3>
              <p className="mt-1 text-2xl font-semibold text-brand-accent">{p.price}</p>
              <p className="mt-2 text-sm text-brand-text-secondary">{p.desc}</p>
              <ul className="mt-6 flex-1 space-y-2 text-sm text-brand-text-secondary">
                {p.features.map((f) => (
                  <li key={f}>· {f}</li>
                ))}
              </ul>
              <Link
                href={p.cta.href}
                className={p.highlighted ? 'btn-primary-solid mt-6' : 'btn-secondary-outline mt-6'}
              >
                {p.cta.label}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

import Link from 'next/link';

const TIERS = [
  {
    name: 'Alıcı',
    price: 'Ücretsiz',
    desc: 'Marketplace’ten güvenle alışveriş.',
    features: ['Escrow koruması', 'Anında teslim', 'Cüzdan & sipariş paneli', 'Dispute açma'],
    cta: { href: '/register', label: 'Alıcı ol' },
    highlight: false,
  },
  {
    name: 'Satıcı',
    price: '%10–15',
    desc: 'Komisyon oranına göre satış. KYC + admin onayı gerekir.',
    features: [
      'Ürün & key yönetimi',
      'Payout talebi',
      'Satış analitikleri',
      'Public vitrin /s/slug',
    ],
    cta: { href: '/seller', label: 'Satıcı başvur' },
    highlight: true,
  },
  {
    name: 'Kurumsal',
    price: 'Özel',
    desc: 'Yüksek hacim ve özel komisyon için iletişime geçin.',
    features: ['Özel komisyon', 'API entegrasyonu', 'Öncelikli destek', 'SLA'],
    cta: { href: '/contact', label: 'İletişim' },
    highlight: false,
  },
];

export function PricingSection() {
  return (
    <section
      id="fiyatlandirma"
      className="section-pad border-y border-white/[0.06] bg-brand-surface/30"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium text-brand-accent">Roller</p>
          <h2 className="section-title mt-2">Alıcı, satıcı, kurumsal</h2>
          <p className="section-lead mx-auto">
            Admin paneli ayrıdır ve yalnızca yetkili hesaplara açıktır.
          </p>
        </div>
        <div className="mt-14 grid gap-4 lg:grid-cols-3">
          {TIERS.map((t) => (
            <div
              key={t.name}
              className={
                t.highlight
                  ? 'rounded-2xl border border-brand-accent/40 bg-brand-accent/10 p-6 shadow-accent-glow'
                  : 'rounded-2xl border border-white/[0.08] bg-brand-bg/50 p-6'
              }
            >
              <h3 className="text-lg font-semibold text-white">{t.name}</h3>
              <div className="mt-3 text-3xl font-semibold tracking-tight text-white">{t.price}</div>
              <p className="mt-2 text-sm text-brand-text-secondary">{t.desc}</p>
              <ul className="mt-6 space-y-2.5">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-brand-text-secondary">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-accent" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href={t.cta.href}
                className={
                  t.highlight
                    ? 'btn-primary-solid mt-8 w-full'
                    : 'btn-secondary-outline mt-8 w-full'
                }
              >
                {t.cta.label}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

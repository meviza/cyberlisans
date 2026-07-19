import { Shield, KeyRound, Wallet, HeadphonesIcon, Gauge, BadgeCheck } from 'lucide-react';

const FEATURES = [
  {
    icon: Shield,
    title: 'Doğrudan lisans satışı',
    description:
      'Ürünler üçüncü taraf aracılığı olmadan şirket stokundan sağlanır. Tek satıcı: CyberLisans.',
  },
  {
    icon: KeyRound,
    title: 'Anında dijital teslim',
    description:
      'Stokta ürünler saniyeler içinde otomatik teslim edilir. Manuel siparişler net SLA ile.',
  },
  {
    icon: Wallet,
    title: 'Güvenli ödeme',
    description: 'Kart ve desteklenen yöntemlerle ödeme. TRY / USD destekli fiyatlandırma.',
  },
  {
    icon: BadgeCheck,
    title: 'Kurumsal faturalandırma',
    description: 'Bireysel ve kurumsal alımlar için dijital fatura ve makbuz desteği.',
  },
  {
    icon: Gauge,
    title: 'Şeffaf fiyatlandırma',
    description: 'Listelenen fiyat nettir. Gizli ek kesinti veya sürpriz ücret yoktur.',
  },
  {
    icon: HeadphonesIcon,
    title: 'Destek ekibi',
    description: 'Aktivasyon, erişim ve fatura konularında e-posta üzerinden destek.',
  },
];

export function FeaturesSection() {
  return (
    <section id="ozellikler" className="section-pad relative">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-brand-accent">Neden CyberLisans</p>
          <h2 className="section-title mt-2">Kurumsal sadelik, modern hız</h2>
          <p className="section-lead">
            Yazılım ve API lisanslarını doğrudan satan sade bir dijital mağaza — güvenli ödeme ve
            anında teslimat.
          </p>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="surface-card p-6 transition hover:border-white/15">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-accent/15 text-brand-accent">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-white">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-brand-text-secondary">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

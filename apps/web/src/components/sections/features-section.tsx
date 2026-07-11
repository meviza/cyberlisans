import { Shield, KeyRound, Wallet, HeadphonesIcon, Gauge, BadgeCheck } from 'lucide-react';

const FEATURES = [
  {
    icon: Shield,
    title: 'Escrow koruması',
    description:
      'Ödemeniz 7 gün boyunca platform kasasında tutulur. Teslimat sorunsuzsa satıcıya aktarılır.',
  },
  {
    icon: KeyRound,
    title: 'Anında key teslimi',
    description:
      'Stokta ürünler saniyeler içinde otomatik teslim edilir. Manuel siparişler net SLA ile.',
  },
  {
    icon: Wallet,
    title: 'Çoklu ödeme',
    description: 'Kart, Papara, kripto ve cüzdan bakiyesi. TRY / USD destekli fiyatlandırma.',
  },
  {
    icon: BadgeCheck,
    title: 'Onaylı satıcılar',
    description: 'KYC doğrulaması ve admin onayı olmadan kimse satışa açılamaz.',
  },
  {
    icon: Gauge,
    title: 'Şeffaf komisyon',
    description: 'Satıcı bazlı net komisyon oranları. Sürpriz kesinti yok.',
  },
  {
    icon: HeadphonesIcon,
    title: 'Anlaşmazlık çözümü',
    description: 'İtiraz açın; super admin ekibi kanıta dayalı karar verir.',
  },
];

export function FeaturesSection() {
  return (
    <section id="ozellikler" className="section-pad relative">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-brand-accent">Neden CyberLisans</p>
          <h2 className="section-title mt-2">Kurumsal güven, modern hız</h2>
          <p className="section-lead">
            FunPay / GamsGo modelini Türkiye pazarına uyarladık — sade arayüz, escrow ve net roller.
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

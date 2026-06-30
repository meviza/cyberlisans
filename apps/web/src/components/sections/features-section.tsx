'use client';

const features = [
  { icon: '⚡', title: 'Anında Teslim', desc: 'Ödemen onaylandığı saniye kodunu teslim al.' },
  { icon: '🔒', title: 'Güvenli Ödeme', desc: 'PayTR, Papara, kripto ve daha fazlasıyla %100 güvenli.' },
  { icon: '💰', title: 'Çoklu Para Birimi', desc: 'TRY, USD, EUR, USDT. İstediğin gibi öde.' },
  { icon: '🌍', title: 'Global Erişim', desc: 'TR, EN, DE, AR, RU. Dünyanın her yerinden alışveriş.' },
  { icon: '🎁', title: 'Sadakat Programı', desc: 'Her alışverişte %1 geri kazan, ödüller topla.' },
  { icon: '🛡️', title: '7/24 Destek', desc: 'Telegram, Discord ve e-posta ile her zaman yanındayız.' },
];

export function FeaturesSection() {
  return (
    <section className="relative overflow-hidden bg-cyber-darker py-16 md:py-24">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,0,200,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(255,0,200,0.12) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
          maskImage: 'linear-gradient(180deg, transparent, black 30%, black 70%, transparent)',
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="mb-3 font-display text-3xl font-black text-white sm:text-4xl">
            Neden <span className="text-cyber-cyan text-glow-cyan">CyberLisans</span>?
          </h2>
          <p className="mx-auto max-w-2xl text-white/60">
            Dijital lisans alımında yeni nesil standart.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-cyber-dark/60 p-6 backdrop-blur-sm transition-all hover:scale-105 hover:border-cyber-cyan/60 hover:shadow-glow-cyan"
            >
              <div className="mb-4 text-4xl">{f.icon}</div>
              <h3 className="mb-2 font-display text-xl font-bold text-white">{f.title}</h3>
              <p className="text-sm text-white/70">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
const STEPS = [
  {
    n: '01',
    title: 'Ürünü seç',
    description: 'Mağazadan veya satıcı vitrininden key / lisans / AI kredisi seç.',
  },
  {
    n: '02',
    title: 'Güvenle öde',
    description: 'Ödeme escrow’a alınır. Key anında hesabına düşer.',
  },
  {
    n: '03',
    title: 'Escrow serbest',
    description: '7 gün içinde itiraz yoksa bakiye satıcıya geçer; komisyon şeffaf kesilir.',
  },
];

export function HowItWorksSection() {
  return (
    <section
      id="nasil-calisir"
      className="section-pad border-y border-white/[0.06] bg-brand-surface/40"
    >
      <div className="mx-auto max-w-7xl">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-brand-accent">Nasıl çalışır</p>
          <h2 className="section-title mt-2">Üç adımda güvenli alım</h2>
          <p className="section-lead">Alıcı, satıcı ve platform rolleri net ayrılmıştır.</p>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {STEPS.map((s) => (
            <div
              key={s.n}
              className="relative rounded-2xl border border-white/[0.08] bg-brand-bg/60 p-6"
            >
              <span className="font-mono text-xs font-medium text-brand-accent">{s.n}</span>
              <h3 className="mt-3 text-lg font-semibold text-white">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-brand-text-secondary">
                {s.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const ITEMS = [
  {
    quote:
      'Windows lisansını dakikalar içinde aldım. Fatura da hemen geldi, kurumsal süreç için ideal.',
    name: 'Ayşe K.',
    role: 'BT Yöneticisi',
  },
  {
    quote: 'API erişim paketini kartla ödedim, anahtar anında hesaba düştü. Sade ve net.',
    name: 'Mert Y.',
    role: 'Geliştirici',
  },
  {
    quote: 'Toplu lisans teklifi hızlı geldi. Faturalı satış ve destek sorunsuzdu.',
    name: 'Deniz A.',
    role: 'Operasyon',
  },
];

export function TestimonialsSection() {
  return (
    <section className="section-pad border-t border-white/[0.06]">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-brand-accent">Referanslar</p>
          <h2 className="section-title mt-2">Müşteriler ne diyor?</h2>
        </div>
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {ITEMS.map((t) => (
            <blockquote key={t.name} className="surface-card p-6">
              <p className="text-sm leading-relaxed text-brand-text-secondary">“{t.quote}”</p>
              <footer className="mt-4">
                <div className="text-sm font-medium text-white">{t.name}</div>
                <div className="text-xs text-brand-muted">{t.role}</div>
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}

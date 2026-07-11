const ITEMS = [
  {
    quote:
      'Escrow sayesinde ilk kez dijital key alırken için rahat. Key anında geldi, 7 gün güvence de bonusu.',
    name: 'Mert K.',
    role: 'Alıcı',
  },
  {
    quote: 'Satıcı paneli sade. Stok ve payout net. Komisyon oranı baştan belli, sürpriz yok.',
    name: 'Ayşe D.',
    role: 'Onaylı satıcı',
  },
  {
    quote: 'Admin tarafında KYC ve ürün onayı tek kuyrukta. Dispute çözümü için kanıt akışı net.',
    name: 'Operasyon',
    role: 'Platform',
  },
];

export function TestimonialsSection() {
  return (
    <section className="section-pad">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-brand-accent">Güven</p>
          <h2 className="section-title mt-2">Kullanıcı ve satıcı deneyimi</h2>
        </div>
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {ITEMS.map((t) => (
            <blockquote
              key={t.name}
              className="flex flex-col justify-between rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6"
            >
              <p className="text-sm leading-relaxed text-brand-text-secondary">
                &ldquo;{t.quote}&rdquo;
              </p>
              <footer className="mt-6">
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

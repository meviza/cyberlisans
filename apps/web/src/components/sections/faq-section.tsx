const FAQ_ITEMS = [
  {
    q: 'Ödeme nasıl yapılır?',
    a: 'Kart, Papara, kripto veya cüzdan bakiyesi ile ödeme yapabilirsiniz. Tüm ödemeler escrow hesabına alınır.',
  },
  {
    q: 'Teslim ne kadar sürer?',
    a: 'Stokta ve otomatik teslim ürünlerde ödeme onayı sonrası genellikle 5 saniye içinde key hesabınıza düşer.',
  },
  {
    q: 'Lisans orijinal mi?',
    a: 'Onaylı satıcılar listeler; admin ürün onayı vardır. Sorun yaşarsanız 7 gün içinde itiraz açabilirsiniz.',
  },
  {
    q: 'İade var mı?',
    a: 'Kullanılmamış / aktive edilmemiş ürünlerde platform politikasına göre iade veya kısmi iade mümkündür. Escrow süresi içinde dispute açın.',
  },
  {
    q: 'Satıcı nasıl olurum?',
    a: 'Kayıt olduktan sonra Satıcı paneline başvurun, KYC belgelerini yükleyin. Super admin onayı sonrası ürün listeleyebilirsiniz.',
  },
  {
    q: 'Güvenlik nasıl sağlanır?',
    a: 'JWT oturum, rate-limit, RLS, encrypted secret store, audit log ve escrow state machine ile katmanlı güvenlik.',
  },
];

export function FAQSection() {
  return (
    <section id="sss" className="section-pad border-t border-white/[0.06]">
      <div className="mx-auto max-w-3xl">
        <div className="text-center">
          <p className="text-sm font-medium text-brand-accent">SSS</p>
          <h2 className="section-title mt-2">Sık sorulan sorular</h2>
        </div>
        <div className="mt-12 space-y-3">
          {FAQ_ITEMS.map((item) => (
            <details
              key={item.q}
              className="group rounded-xl border border-white/[0.08] bg-white/[0.02] px-5 py-4 open:bg-white/[0.04]"
            >
              <summary className="cursor-pointer list-none text-sm font-medium text-white marker:content-none [&::-webkit-details-marker]:hidden">
                <span className="flex items-center justify-between gap-4">
                  {item.q}
                  <span className="text-brand-muted transition group-open:rotate-45">+</span>
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-brand-text-secondary">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

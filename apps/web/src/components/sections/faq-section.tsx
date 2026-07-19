const FAQ_ITEMS = [
  {
    q: 'Ne satıyorsunuz?',
    a: 'CyberLisans, yazılım lisansları ve API erişim paketlerini doğrudan satar. Tüm ürünler şirket envanterinden temin edilir.',
  },
  {
    q: 'Ödeme nasıl yapılır?',
    a: 'Kredi/banka kartı ve diğer desteklenen yöntemlerle güvenli ödeme yapabilirsiniz. Fatura ve makbuz dijital olarak iletilir.',
  },
  {
    q: 'Teslim ne kadar sürer?',
    a: 'Stokta ve otomatik teslim ürünlerde ödeme onayı sonrası lisans anahtarı veya erişim bilgisi genellikle saniyeler içinde hesabınıza düşer.',
  },
  {
    q: 'Lisans orijinal mi?',
    a: 'Evet. Ürünler doğrudan şirket stokundan sağlanır. Aktivasyon veya erişim sorunu yaşarsanız destek ekibimiz yardımcı olur.',
  },
  {
    q: 'İade politikası nedir?',
    a: 'Kullanılmamış / aktive edilmemiş dijital ürünlerde platform iade politikasına göre değerlendirme yapılır. Detaylar kullanım koşullarındadır.',
  },
  {
    q: 'Kurumsal satın alma var mı?',
    a: 'Evet. Toplu lisans ve API paketleri için faturalı kurumsal satış sunuyoruz. İletişim formundan talep oluşturabilirsiniz.',
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

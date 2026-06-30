'use client';

import { useState } from 'react';

const faqs = [
  { q: 'Ödeme nasıl yapılır?', a: 'PayTR, Papara, kripto, kredi kartı veya havale ile ödeme yapabilirsin.' },
  { q: 'Teslim ne kadar sürer?', a: 'Otomatik sistemimiz sayesinde ödeme onayı sonrası 5 saniye içinde.' },
  { q: 'Lisans orijinal mi?', a: 'Tüm ürünlerimiz %100 orijinal ve garantilidir.' },
  { q: 'İade var mı?', a: 'Aktivasyon yapılmamış ürünler için 14 gün içinde iade mümkündür.' },
  { q: 'Hediye olarak alabilir miyim?', a: 'Evet, sepet adımında hediye seçeneği ile başka birine gönderebilirsin.' },
  { q: 'Güvenlik nasıl sağlanıyor?', a: 'PCI-DSS, 2FA, KVKK uyumlu altyapı, encrypted ledger.' },
  { q: 'Bayi olabilir miyim?', a: 'Şu anda kapalı beta. İlgi için [email protected]\'a yazın.' },
  { q: 'Mobil uygulama var mı?', a: 'Web sitemiz tamamen responsive. iOS/Android uygulaması yolda.' },
];

export function FAQSection() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="relative bg-cyber-darker py-16 md:py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="mb-3 font-display text-3xl font-black text-white sm:text-4xl">
            Sıkça Sorulan <span className="text-cyber-cyan text-glow-cyan">Sorular</span>
          </h2>
          <p className="text-white/60">Aklına takılanlar burada.</p>
        </div>

        <div className="space-y-3">
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <div
                key={i}
                className={`overflow-hidden rounded-xl border bg-cyber-dark/60 backdrop-blur-sm transition-all ${
                  isOpen ? 'border-cyber-cyan/60 shadow-glow-cyan' : 'border-white/10 hover:border-white/20'
                }`}
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="font-display text-base font-bold text-white">{f.q}</span>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`h-5 w-5 flex-shrink-0 text-cyber-cyan transition-transform ${isOpen ? 'rotate-180' : ''}`}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                {isOpen && (
                  <div className="px-6 pb-5 text-sm text-white/70">
                    {f.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
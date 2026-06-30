'use client';

const steps = [
  { n: '01', title: 'Hesap Oluştur', desc: '30 saniyede ücretsiz kayıt ol.' },
  { n: '02', title: 'Cüzdanına Yükle', desc: 'Papara, PayTR, kripto, havale veya kart ile.' },
  { n: '03', title: 'Ürünü Seç', desc: '8\'den fazla marka, 50+ ürün.' },
  { n: '04', title: 'Anında Teslim Al', desc: 'Otomatik kod teslimi, e-posta ve SMS bildirim.' },
];

export function HowItWorksSection() {
  return (
    <section id="nasil-calisir" className="relative bg-cyber-dark py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="mb-3 font-display text-3xl font-black text-white sm:text-4xl">
            Nasıl <span className="text-cyber-magenta text-glow-magenta">Çalışır</span>?
          </h2>
          <p className="mx-auto max-w-2xl text-white/60">
            Dört adımda dijital lisansın kapında.
          </p>
        </div>

        <div className="relative">
          <div
            aria-hidden
            className="absolute left-0 right-0 top-12 hidden h-px bg-gradient-to-r from-transparent via-cyber-cyan to-transparent lg:block"
          />

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
            {steps.map((s) => (
              <div key={s.n} className="relative flex flex-col items-center text-center lg:items-start lg:text-left">
                <div className="relative mb-6 flex h-24 w-24 items-center justify-center rounded-2xl border border-cyber-cyan/40 bg-cyber-darker shadow-glow-cyan">
                  <span className="font-display text-2xl font-black text-cyber-cyan text-glow-cyan">{s.n}</span>
                </div>
                <h3 className="mb-2 font-display text-xl font-bold text-white">{s.title}</h3>
                <p className="text-sm text-white/70">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
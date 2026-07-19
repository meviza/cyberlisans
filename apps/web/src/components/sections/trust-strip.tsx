import { ShieldCheck, Zap, Lock, BadgeCheck } from 'lucide-react';

const ITEMS = [
  { icon: ShieldCheck, label: 'Doğrudan satış', desc: 'Şirket envanteri' },
  { icon: Zap, label: 'Anında teslim', desc: 'Dijital lisans' },
  { icon: Lock, label: 'Güvenli ödeme', desc: 'Kart & fatura' },
  { icon: BadgeCheck, label: 'KVKK uyumlu', desc: 'Türkiye odaklı' },
];

export function TrustStrip() {
  return (
    <section className="border-y border-white/[0.06] bg-brand-surface/50">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px bg-white/[0.04] sm:grid-cols-4">
        {ITEMS.map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-3 bg-brand-bg/80 px-5 py-4 sm:justify-center sm:px-6 sm:py-5"
          >
            <item.icon className="h-4 w-4 shrink-0 text-brand-accent" aria-hidden />
            <div>
              <div className="text-sm font-medium text-white">{item.label}</div>
              <div className="text-xs text-brand-muted">{item.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

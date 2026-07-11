import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  FileCheck2,
  KeyRound,
  Shield,
  Store,
  Wallet,
} from 'lucide-react';
import { StorefrontHeader } from '@/components/store/storefront-header';
import { FooterSection } from '@/components/sections/footer-section';
import { ScrollReveal } from '@/components/motion/scroll-reveal';

export const metadata: Metadata = {
  title: 'Satıcı Ol',
  description:
    'CyberLisans marketplace’te dijital ürün sat. Escrow, admin onay, key stok ve payout altyapısı.',
  alternates: { canonical: 'https://cyberlisans.com/seller' },
};

const BENEFITS = [
  {
    icon: Shield,
    title: 'Escrow koruması',
    desc: 'Ödeme 7 gün platform kasasında. Sorunsuz teslimatta bakiye satıcıya geçer.',
  },
  {
    icon: KeyRound,
    title: 'Otomatik key teslim',
    desc: 'Stok anahtarların alıcıya saniyeler içinde düşer; SLA net.',
  },
  {
    icon: FileCheck2,
    title: 'Admin ürün onayı',
    desc: 'Kalitesiz liste yok. Onaylı katalog güven ve dönüşüm getirir.',
  },
  {
    icon: Wallet,
    title: 'Şeffaf payout',
    desc: 'Komisyon oranını gör, bakiyeni takip et, payout talep et.',
  },
];

const STEPS = [
  { n: '01', title: 'Hesap oluştur', desc: 'Kayıt ol, e-postanı doğrula.' },
  { n: '02', title: 'Satıcı başvurusu', desc: 'Şirket / vergi bilgileri + KYC.' },
  { n: '03', title: 'Admin onayı', desc: 'Profil APPROVED olduktan sonra ürün ekle.' },
  { n: '04', title: 'Stok & satış', desc: 'Key yükle, vitrine çık, sipariş al.' },
];

const REQUIREMENTS = [
  'Geçerli vergi kimliği / vergi dairesi bilgisi',
  'İletişim telefonu ve mağaza slug’ı',
  'Orijinal / yetkili dijital stok',
  'Platform kullanım ve KYC politikalarına uyum',
];

export default function SellerLandingPage() {
  return (
    <>
      <StorefrontHeader />
      <main>
        {/* Hero — dark */}
        <section className="relative overflow-hidden border-b border-white/[0.06] bg-brand-bg">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-hero-glow opacity-80"
          />
          <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
            <div className="max-w-2xl">
              <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium text-brand-accent">
                <Store className="h-3.5 w-3.5" />
                Marketplace satıcı programı
              </p>
              <h1 className="mt-6 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                Dijital lisanslarını güvenle sat
              </h1>
              <p className="mt-5 text-lg leading-relaxed text-brand-text-secondary">
                Oyun key, yazılım lisansı ve AI kredisi. Escrow’lu ödeme, admin onaylı vitrin ve net
                komisyon — alıcı güveni platformda.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/dashboard/seller/apply" className="btn-primary-solid">
                  Satıcı başvurusu
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/register?next=/dashboard/seller/apply"
                  className="btn-secondary-outline"
                >
                  Önce kayıt ol
                </Link>
              </div>
              <p className="mt-4 text-xs text-brand-muted">
                Zaten hesabın var mı?{' '}
                <Link
                  href="/login?next=/dashboard/seller/apply"
                  className="text-brand-accent hover:underline"
                >
                  Giriş yap ve başvur
                </Link>
              </p>
            </div>
          </div>
        </section>

        {/* Benefits — light band */}
        <section className="band-light section-pad">
          <div
            aria-hidden
            className="pointer-events-none absolute right-0 top-0 h-64 w-64 rounded-full bg-brand-accent/10 blur-3xl animate-soft-blob"
          />
          <div className="relative mx-auto max-w-7xl">
            <ScrollReveal className="max-w-xl">
              <p className="text-sm font-semibold text-brand-accent">Neden CyberLisans?</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-brand-ink">
                Operasyonel netlik, premium güven
              </h2>
            </ScrollReveal>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {BENEFITS.map((b, i) => (
                <ScrollReveal key={b.title} delayMs={i * 80}>
                  <div className="surface-light-card h-full p-5">
                    <b.icon className="mb-3 h-5 w-5 text-brand-accent" />
                    <h3 className="font-semibold text-brand-ink">{b.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-brand-ink-muted">{b.desc}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* Steps — dark */}
        <section className="section-pad border-t border-white/[0.06]">
          <div className="mx-auto max-w-7xl">
            <ScrollReveal>
              <p className="text-sm font-medium text-brand-accent">Nasıl çalışır</p>
              <h2 className="section-title mt-2">Dört adımda satışa çık</h2>
            </ScrollReveal>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {STEPS.map((s, i) => (
                <ScrollReveal key={s.n} delayMs={i * 90}>
                  <div className="surface-card p-5">
                    <div className="text-xs font-semibold tracking-widest text-brand-accent">
                      {s.n}
                    </div>
                    <h3 className="mt-3 font-semibold text-white">{s.title}</h3>
                    <p className="mt-2 text-sm text-brand-text-secondary">{s.desc}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* Requirements — light */}
        <section className="band-light section-pad">
          <div className="relative mx-auto grid max-w-7xl gap-10 lg:grid-cols-2 lg:items-center">
            <ScrollReveal>
              <div className="inline-flex items-center gap-2 rounded-full bg-brand-accent/10 px-3 py-1 text-xs font-semibold text-brand-accent">
                <Building2 className="h-3.5 w-3.5" />
                Başvuru gereksinimleri
              </div>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-brand-ink">
                Hızlı onay için hazır ol
              </h2>
              <p className="mt-3 text-brand-ink-muted">
                Super admin ekibi başvuruları ve ürünleri inceler. Eksik belge süreci uzatır.
              </p>
              <ul className="mt-6 space-y-3">
                {REQUIREMENTS.map((r) => (
                  <li key={r} className="flex items-start gap-2 text-sm text-brand-ink">
                    <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-accent" />
                    {r}
                  </li>
                ))}
              </ul>
            </ScrollReveal>
            <ScrollReveal delayMs={120}>
              <div className="surface-light-card p-8">
                <h3 className="text-xl font-semibold text-brand-ink">Hazır mısın?</h3>
                <p className="mt-2 text-sm text-brand-ink-muted">
                  Başvuru sonrası durumunu satıcı panelinden takip edebilirsin. Onay gelince ürün
                  ekleme ve stok yükleme açılır.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link href="/dashboard/seller/apply" className="btn-on-light">
                    Başvuruyu başlat
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link href="/dashboard/seller" className="btn-on-light-outline">
                    Satıcı paneli
                  </Link>
                </div>
                <p className="mt-6 text-xs text-brand-ink-muted">
                  Varsayılan komisyon %12 · Escrow 7 gün · Payout penceresi politikalara tabidir.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </section>
      </main>
      <FooterSection />
    </>
  );
}

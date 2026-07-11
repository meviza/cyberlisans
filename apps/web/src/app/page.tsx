import { HeroSection } from '@/components/sections/hero-section';
import { TrustStrip } from '@/components/sections/trust-strip';
import { CategoriesSection } from '@/components/sections/categories-section';
import { FeaturedProductsSection } from '@/components/sections/featured-products-section';
import { FeaturesSection } from '@/components/sections/features-section';
import { HowItWorksSection } from '@/components/sections/how-it-works-section';
import { StatsSection } from '@/components/sections/stats-section';
import { FAQSection } from '@/components/sections/faq-section';
import { CTASection } from '@/components/sections/cta-section';
import { FooterSection } from '@/components/sections/footer-section';
import { LandingScene } from '@/components/3d/landing-scene';
import {
  OrganizationJsonLd,
  FAQJsonLd,
  BreadcrumbJsonLd,
  WebSiteJsonLd,
} from '@/components/seo/json-ld';

const FAQ_ITEMS = [
  {
    question: 'Ödeme nasıl yapılır?',
    answer:
      'Kart, Papara, kripto veya cüzdan bakiyesi ile ödeme yapabilirsiniz. Tüm ödemeler escrow hesabına alınır.',
  },
  {
    question: 'Teslim ne kadar sürer?',
    answer:
      'Stokta ve otomatik teslim ürünlerde ödeme onayı sonrası genellikle 5 saniye içinde key hesabınıza düşer.',
  },
  {
    question: 'Lisans orijinal mi?',
    answer:
      'Onaylı satıcılar listeler; admin ürün onayı vardır. Sorun yaşarsanız 7 gün içinde itiraz açabilirsiniz.',
  },
  {
    question: 'İade var mı?',
    answer:
      'Kullanılmamış / aktive edilmemiş ürünlerde platform politikasına göre iade mümkündür. Escrow süresi içinde dispute açın.',
  },
  {
    question: 'Satıcı nasıl olurum?',
    answer:
      'Kayıt olduktan sonra Satıcı paneline başvurun, KYC belgelerini yükleyin. Super admin onayı sonrası ürün listeleyebilirsiniz.',
  },
  {
    question: 'Güvenlik nasıl sağlanır?',
    answer:
      'JWT oturum, rate-limit, RLS, encrypted secret store, audit log ve escrow state machine ile katmanlı güvenlik.',
  },
];

export default function HomePage() {
  return (
    <>
      <OrganizationJsonLd />
      <WebSiteJsonLd />
      <BreadcrumbJsonLd items={[{ name: 'Anasayfa', url: 'https://cyberlisans.com' }]} />
      <FAQJsonLd items={FAQ_ITEMS} />
      <HeroSection scene={<LandingScene />} />
      <TrustStrip />
      <CategoriesSection />
      <FeaturedProductsSection />
      <FeaturesSection />
      <HowItWorksSection />
      <StatsSection />
      <FAQSection />
      <CTASection />
      <FooterSection />
    </>
  );
}

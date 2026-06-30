import { HeroSection } from '@/components/sections/hero-section';
import { CategoriesSection } from '@/components/sections/categories-section';
import { FeaturedProductsSection } from '@/components/sections/featured-products-section';
import { FeaturesSection } from '@/components/sections/features-section';
import { HowItWorksSection } from '@/components/sections/how-it-works-section';
import { StatsSection } from '@/components/sections/stats-section';
import { PricingSection } from '@/components/sections/pricing-section';
import { TestimonialsSection } from '@/components/sections/testimonials-section';
import { FAQSection } from '@/components/sections/faq-section';
import { CTASection } from '@/components/sections/cta-section';
import { FooterSection } from '@/components/sections/footer-section';
import { LandingScene } from '@/components/3d/landing-scene';
import { OrganizationJsonLd, FAQJsonLd, BreadcrumbJsonLd, WebSiteJsonLd } from '@/components/seo/json-ld';

const FAQ_ITEMS = [
  { question: 'Ödeme nasıl yapılır?', answer: 'PayTR, Papara, kripto, kredi kartı veya havale ile ödeme yapabilirsin.' },
  { question: 'Teslim ne kadar sürer?', answer: 'Otomatik sistemimiz sayesinde ödeme onayı sonrası 5 saniye içinde.' },
  { question: 'Lisans orijinal mi?', answer: 'Tüm ürünlerimiz %100 orijinal ve garantilidir.' },
  { question: 'İade var mı?', answer: 'Aktivasyon yapılmamış ürünler için 14 gün içinde iade mümkündür.' },
  { question: 'Hediye olarak alabilir miyim?', answer: 'Evet, sepet adımında hediye seçeneği ile başka birine gönderebilirsin.' },
  { question: 'Güvenlik nasıl sağlanıyor?', answer: 'PCI-DSS, 2FA, KVKK uyumlu altyapı, encrypted ledger.' },
];

export default function HomePage() {
  return (
    <>
      <OrganizationJsonLd />
      <WebSiteJsonLd />
      <BreadcrumbJsonLd items={[{ name: 'Anasayfa', url: 'https://cyberlisans.com' }]} />
      <FAQJsonLd items={FAQ_ITEMS} />
      <HeroSection scene={<LandingScene />} />
      <CategoriesSection />
      <FeaturedProductsSection />
      <FeaturesSection />
      <HowItWorksSection />
      <StatsSection />
      <PricingSection />
      <TestimonialsSection />
      <FAQSection />
      <CTASection />
      <FooterSection />
    </>
  );
}

import { HeroSection } from '@/components/sections/hero-section';
import { TrustStrip } from '@/components/sections/trust-strip';
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
    question: 'Ne satıyorsunuz?',
    answer:
      'CyberLisans, yazılım lisansları ve API erişim paketlerini doğrudan satar. Tüm ürünler şirket envanterinden temin edilir.',
  },
  {
    question: 'Ödeme nasıl yapılır?',
    answer:
      'Kredi/banka kartı ve diğer desteklenen yöntemlerle güvenli ödeme yapabilirsiniz. Fatura ve makbuz dijital olarak iletilir.',
  },
  {
    question: 'Teslim ne kadar sürer?',
    answer:
      'Stokta ve otomatik teslim ürünlerde ödeme onayı sonrası lisans anahtarı veya erişim bilgisi genellikle saniyeler içinde hesabınıza düşer.',
  },
  {
    question: 'Lisans orijinal mi?',
    answer:
      'Evet. Ürünler doğrudan şirket stokundan sağlanır. Aktivasyon veya erişim sorunu yaşarsanız destek ekibimiz yardımcı olur.',
  },
  {
    question: 'İade politikası nedir?',
    answer:
      'Kullanılmamış / aktive edilmemiş dijital ürünlerde platform iade politikasına göre değerlendirme yapılır. Detaylar kullanım koşullarındadır.',
  },
  {
    question: 'Kurumsal satın alma var mı?',
    answer:
      'Evet. Toplu lisans ve API paketleri için faturalı kurumsal satış sunuyoruz. İletişim formundan talep oluşturabilirsiniz.',
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
      <FeaturesSection />
      <HowItWorksSection />
      <StatsSection />
      <FAQSection />
      <CTASection />
      <FooterSection />
    </>
  );
}

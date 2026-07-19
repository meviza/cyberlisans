import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { ScrollProgressBar } from '@/components/3d/scroll-progress-bar';
import { AppProviders } from '@/components/store/app-providers';

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-sans',
  display: 'swap',
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: '#00001e',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://cyberlisans.com'),
  title: {
    default: 'CyberLisans — Yazılım ve API Lisansı Doğrudan Satış',
    template: '%s | CyberLisans',
  },
  description:
    'Yazılım lisansları ve API erişim paketlerinin doğrudan satışı. Kurumsal faturalandırma, anında dijital teslimat ve güvenli ödeme.',
  keywords: [
    'yazılım lisansı',
    'api lisansı',
    'dijital lisans',
    'yazılım satışı',
    'api erişim',
    'kurumsal lisans',
    'windows lisans',
    'ai api kredi',
    'türkiye',
  ],
  authors: [{ name: 'CyberLisans' }],
  creator: 'CyberLisans',
  publisher: 'CyberLisans',
  formatDetection: { email: false, address: false, telephone: false },
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    url: 'https://cyberlisans.com',
    siteName: 'CyberLisans',
    title: 'CyberLisans — Yazılım ve API Lisansı Doğrudan Satış',
    description:
      'Yazılım ve API lisanslarının doğrudan satışı. Anında dijital teslimat, güvenli ödeme.',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'CyberLisans' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CyberLisans — Yazılım ve API Lisansı Doğrudan Satış',
    description: 'Yazılım ve API lisanslarının doğrudan satışı.',
    images: ['/og.png'],
    creator: '@cyberlisans',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: { canonical: 'https://cyberlisans.com' },
  icons: { icon: '/favicon.ico', apple: '/apple-icon.png' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={`${inter.variable} ${jetbrains.variable} dark`}>
      <body className="bg-brand-bg font-sans text-brand-text antialiased">
        <ScrollProgressBar />
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}

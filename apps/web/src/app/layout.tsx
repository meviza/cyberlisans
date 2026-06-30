import type { Metadata, Viewport } from 'next';
import { Inter, Orbitron, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { ScrollProgressBar } from '@/components/3d/scroll-progress-bar';
import { MagneticCursor } from '@/components/motion/magnetic-cursor';
import { AppProviders } from '@/components/store/app-providers';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const orbitron = Orbitron({
  subsets: ['latin'],
  weight: ['400', '700', '900'],
  variable: '--font-orbitron',
  display: 'swap',
});
const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: '#050510',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://cyberlisans.com'),
  title: {
    default: 'CyberLisans — Dijital Lisansların Yeni Adresi',
    template: '%s | CyberLisans',
  },
  description:
    'Steam, PlayStation, Xbox ve daha fazlası için orijinal dijital lisanslar, yazılım anahtarları ve AI API kredileri. Anında teslim, güvenli ödeme.',
  keywords: [
    'dijital lisans',
    'oyun lisans',
    'steam cüzdan',
    'playstation',
    'xbox',
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
    title: 'CyberLisans — Dijital Lisansların Yeni Adresi',
    description:
      'Orijinal dijital lisanslar, yazılım anahtarları ve AI API kredileri. Anında teslim.',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'CyberLisans' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CyberLisans — Dijital Lisansların Yeni Adresi',
    description: 'Orijinal dijital lisanslar, yazılım anahtarları ve AI API kredileri.',
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
    <html lang="tr" className={`${inter.variable} ${orbitron.variable} ${jetbrains.variable} dark`}>
      <body className="bg-cyber-darker font-body text-white antialiased">
        <ScrollProgressBar />
        <MagneticCursor />
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}

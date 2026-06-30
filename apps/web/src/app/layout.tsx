import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CyberLisans',
  description: 'Cyberpunk dijital lisans platformu',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className="dark">
      <body className="bg-cyber-darker text-white font-body antialiased">{children}</body>
    </html>
  );
}

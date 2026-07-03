import { DealerShellClient } from '@/components/dealer/DealerShellClient';

export const metadata = {
  title: 'Bayi Paneli | CyberLisans',
  robots: { index: false, follow: false },
};

export default function DealerLayout({ children }: { children: React.ReactNode }) {
  return <DealerShellClient>{children}</DealerShellClient>;
}

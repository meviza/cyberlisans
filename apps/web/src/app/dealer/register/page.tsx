import { DealerRegisterForm } from '@/components/dealer/DealerRegisterForm';

export const metadata = {
  title: 'Bayi Başvurusu | CyberLisans',
  robots: { index: false, follow: false },
};

export default function DealerRegisterPage() {
  return (
    <div className="mx-auto max-w-3xl p-4 sm:p-6 lg:p-8">
      <DealerRegisterForm />
    </div>
  );
}

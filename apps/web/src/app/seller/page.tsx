import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'CyberLisans',
  robots: { index: false, follow: false },
};

/** Public seller onboarding removed for Stripe-compliant direct sales model. */
export default function SellerLandingPage() {
  redirect('/');
}

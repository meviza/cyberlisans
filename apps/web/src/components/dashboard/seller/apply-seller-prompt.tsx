import * as React from 'react';
import Link from 'next/link';
import { Store, TrendingUp, Wallet, Star, ArrowRight } from 'lucide-react';
import { Card, CardContent, Button } from '@cyberlisans/ui/atoms';

interface FeatureProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
}

function Feature({ icon: Icon, title }: FeatureProps) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] p-3 text-center">
      <Icon className="h-5 w-5 text-brand-accent" />
      <span className="text-xs text-brand-text-secondary">{title}</span>
    </div>
  );
}

export function ApplySellerPrompt() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 py-8">
      <Card>
        <CardContent className="p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-brand-accent/30 bg-brand-accent/10 text-brand-accent">
            <Store className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">
            Satıcı ol, mağazanı aç
          </h1>
          <p className="mt-3 text-sm text-brand-text-secondary">
            CyberLisans&apos;ta dijital ürünlerinizi satışa sunun. Komisyon, mağaza puanı ve
            gelirleriniz tek panelde.
          </p>
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Feature icon={TrendingUp} title="Şeffaf komisyon" />
            <Feature icon={Wallet} title="Hızlı payout" />
            <Feature icon={Star} title="Müşteri puanları" />
          </div>
          <Link href="/dashboard/seller/apply" className="mt-8 inline-block">
            <Button size="lg">
              <Store className="h-4 w-4" /> Hemen başvur
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

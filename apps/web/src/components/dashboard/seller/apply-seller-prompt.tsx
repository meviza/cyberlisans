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
    <div className="flex flex-col items-center gap-2 rounded-md border border-cyber-cyan/20 bg-cyber-cyan/5 p-3 text-center">
      <Icon className="h-5 w-5 text-cyber-cyan" />
      <span className="text-xs text-white/80">{title}</span>
    </div>
  );
}

export function ApplySellerPrompt() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 py-8">
      <Card>
        <CardContent className="p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-cyber-cyan/40 bg-cyber-cyan/10 text-cyber-cyan">
            <Store className="h-8 w-8" />
          </div>
          <h1 className="font-orbitron text-2xl font-bold text-white">Satıcı Ol, Mağazanı Aç</h1>
          <p className="mt-3 text-sm text-white/70">
            Cyberlisans&apos;ta dijital ürünlerinizi satışa sunun. Komisyon oranlarınız, mağaza
            puanınız ve tüm gelirleriniz tek bir panelde.
          </p>
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Feature icon={TrendingUp} title="Rekabete Dayalı Komisyon" />
            <Feature icon={Wallet} title="Hızlı Ödeme" />
            <Feature icon={Star} title="Müşteri Puanları" />
          </div>
          <Link href="/dashboard/seller/apply" className="mt-8 inline-block">
            <Button size="lg">
              <Store className="h-4 w-4" /> Hemen Başvur
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

import * as React from 'react';
import { Star, ShoppingBag, Calendar } from 'lucide-react';
import { Card, CardContent } from '@cyberlisans/ui/atoms';
import type { PublicSeller } from '@/app/s/[slug]/seller-types';

interface StatRowProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}

function StatRow({ icon: Icon, label, value }: StatRowProps) {
  return (
    <div className="flex items-center justify-between rounded-md border border-cyber-cyan/20 bg-cyber-cyan/5 px-3 py-2">
      <div className="flex items-center gap-2 text-white/70">
        <Icon className="h-4 w-4 text-cyber-cyan" />
        <span className="text-xs uppercase tracking-wider">{label}</span>
      </div>
      <span className="font-medium text-white">{value}</span>
    </div>
  );
}

export interface SellerFooterProps {
  seller: PublicSeller;
}

export function SellerFooter({ seller }: SellerFooterProps) {
  const joined = new Date(seller.joinedAt).toLocaleDateString('tr-TR', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardContent className="p-6">
          <h2 className="mb-3 font-orbitron text-lg font-bold text-white">Hakkında</h2>
          <p className="text-sm leading-relaxed text-white/80">
            {seller.bio || 'Bu satıcı henüz bir açıklama eklememiş.'}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3 p-6 text-sm">
          <StatRow icon={ShoppingBag} label="Toplam Satış" value={`${seller.totalSales} adet`} />
          <StatRow icon={Star} label="Ortalama Puan" value={`${seller.rating.toFixed(1)} / 5`} />
          <StatRow icon={Calendar} label="Katılım" value={joined} />
        </CardContent>
      </Card>
    </div>
  );
}

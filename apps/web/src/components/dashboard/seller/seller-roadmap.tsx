import * as React from 'react';
import { Clock } from 'lucide-react';
import { Card, CardContent } from '@cyberlisans/ui/atoms';

const ROADMAP_ITEMS = [
  'Ürün yönetimi paneli',
  'Sipariş ve ödeme takibi',
  'Müşteri mesajlaşma',
  'Detaylı satış raporları',
];

export function SellerRoadmap() {
  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="mb-4 font-orbitron text-lg font-bold text-white">Yakında</h2>
        <ul className="space-y-2 text-sm text-white/70">
          {ROADMAP_ITEMS.map((item) => (
            <li key={item} className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-cyber-cyan" /> {item}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

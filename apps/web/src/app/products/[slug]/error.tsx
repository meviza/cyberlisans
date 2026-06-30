'use client';

import Link from 'next/link';
import { Button } from '@cyberlisans/ui/atoms';

export default function ProductDetailError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="rounded-xl border border-cyber-magenta/30 bg-cyber-darker/40 p-8 text-center">
        <h2 className="mb-2 font-orbitron text-2xl font-bold text-white">
          Ürün detayı yüklenemedi
        </h2>
        <p className="mb-6 text-white/60">Bir hata oluştu. Lütfen tekrar dene.</p>
        <div className="flex justify-center gap-3">
          <Button onClick={reset}>Tekrar Dene</Button>
          <Link href="/products">
            <Button variant="outline">Mağazaya Dön</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

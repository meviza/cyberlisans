import * as React from 'react';
import { Clock, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@cyberlisans/ui/atoms';
import type { SellerInfo } from '@/lib/api-client';

export interface SellerStatusBannerProps {
  status: SellerInfo['status'];
}

export function SellerStatusBanner({ status }: SellerStatusBannerProps) {
  if (status === 'PENDING') {
    return (
      <Card className="border-cyber-yellow/40">
        <CardContent className="flex items-start gap-3 p-6">
          <Clock className="mt-0.5 h-5 w-5 shrink-0 text-cyber-yellow" />
          <div>
            <h3 className="font-medium text-white">Başvurunuz İnceleniyor</h3>
            <p className="mt-1 text-sm text-white/70">
              Ekibimiz başvurunuzu inceliyor. Onay süreci genellikle 1-3 iş günü sürer.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (status === 'REJECTED') {
    return (
      <Card className="border-cyber-magenta/40">
        <CardContent className="flex items-start gap-3 p-6">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-cyber-magenta" />
          <div>
            <h3 className="font-medium text-white">Başvurunuz Reddedildi</h3>
            <p className="mt-1 text-sm text-white/70">
              Başvurunuz kabul edilmedi. Destek ekibimizle iletişime geçebilirsiniz.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}

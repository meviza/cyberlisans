'use client';

import * as React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@cyberlisans/ui/atoms';

export interface ApprovalSuccessCardProps {
  kind: 'APPROVED' | 'REJECTED';
}

export function ApprovalSuccessCard({ kind }: ApprovalSuccessCardProps) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-6">
        <CheckCircle2
          className={kind === 'APPROVED' ? 'h-6 w-6 text-cyber-lime' : 'h-6 w-6 text-cyber-magenta'}
        />
        <div>
          <h3 className="font-medium text-white">
            {kind === 'APPROVED' ? 'Ürün Onaylandı' : 'Ürün Reddedildi'}
          </h3>
          <p className="text-xs text-white/60">Listeye yönlendiriliyor...</p>
        </div>
      </CardContent>
    </Card>
  );
}

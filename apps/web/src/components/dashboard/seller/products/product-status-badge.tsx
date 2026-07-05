'use client';

import * as React from 'react';
import { Badge } from '@cyberlisans/ui/atoms';
import { CheckCircle, XCircle, Clock, Package } from 'lucide-react';
import type { SellerProductStatus } from '@/lib/api/seller-products';

const STATUS_MAP: Record<
  SellerProductStatus,
  {
    label: string;
    variant: 'success' | 'warning' | 'danger' | 'default';
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  ACTIVE: { label: 'Aktif', variant: 'success', icon: CheckCircle },
  PENDING_REVIEW: { label: 'İncelemede', variant: 'warning', icon: Clock },
  REJECTED: { label: 'Reddedildi', variant: 'danger', icon: XCircle },
  DRAFT: { label: 'Taslak', variant: 'default', icon: Package },
  ARCHIVED: { label: 'Arşiv', variant: 'default', icon: Package },
};

export interface ProductStatusBadgeProps {
  status: SellerProductStatus;
}

export function ProductStatusBadge({ status }: ProductStatusBadgeProps) {
  const s = STATUS_MAP[status];
  const Icon = s.icon;
  return (
    <Badge variant={s.variant} size="sm" className="gap-1">
      <Icon className="h-3 w-3" />
      {s.label}
    </Badge>
  );
}

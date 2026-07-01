import type { DealerStatus } from './dealer-types';

export function isDealerStatusApproved(status: DealerStatus): boolean {
  return status === 'APPROVED';
}

export function isDealerStatusActive(status: DealerStatus): boolean {
  return status === 'APPROVED' || status === 'SUSPENDED';
}

export function isDealerStatusPending(status: DealerStatus): boolean {
  return status === 'PENDING';
}

export function isDealerStatusRejected(status: DealerStatus): boolean {
  return status === 'REJECTED';
}

export function dealerStatusLabel(status: DealerStatus): string {
  switch (status) {
    case 'PENDING':
      return 'Onay Bekleniyor';
    case 'APPROVED':
      return 'Onaylandı';
    case 'SUSPENDED':
      return 'Askıya Alındı';
    case 'REJECTED':
      return 'Reddedildi';
    default:
      return status;
  }
}

export function dealerStatusVariant(
  status: DealerStatus,
): 'success' | 'warning' | 'danger' | 'default' {
  switch (status) {
    case 'APPROVED':
      return 'success';
    case 'PENDING':
      return 'warning';
    case 'SUSPENDED':
      return 'default';
    case 'REJECTED':
      return 'danger';
    default:
      return 'default';
  }
}

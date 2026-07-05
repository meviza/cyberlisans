export type EscrowStatus = 'HELD' | 'RELEASED' | 'REFUNDED' | 'DISPUTED';
export type PayoutStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'REJECTED' | 'CANCELLED';
export type PayoutMethod = 'BANK' | 'PAYPAL' | 'CRYPTO';
export type DisputeStatus = 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'REJECTED';
export type DisputeResolution = 'REFUND' | 'RELEASE' | 'PARTIAL_REFUND';
export type DisputeRole = 'CUSTOMER' | 'SELLER' | 'ADMIN';

export interface EscrowEntity {
  id: string;
  orderId: string;
  sellerId: string;
  customerId: string;
  amount: number;
  sellerAmount: number;
  commissionAmount: number;
  currency: 'TRY' | 'USD' | 'EUR' | 'USDT';
  status: EscrowStatus;
  heldAt: Date;
  releaseAt: Date | null;
  releasedAt: Date | null;
  refundedAt: Date | null;
  payoutEligibleAt: Date;
  releaseReason: string | null;
  paymentId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SellerPayoutEntity {
  id: string;
  sellerId: string;
  userId: string;
  amount: number;
  grossAmount: number | null;
  commissionAmount: number | null;
  currency: 'TRY' | 'USD' | 'EUR' | 'USDT';
  method: PayoutMethod;
  destination: string;
  status: PayoutStatus;
  processedById: string | null;
  processedAt: Date | null;
  rejectionReason: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface DisputeEntity {
  id: string;
  escrowId: string;
  orderId: string;
  openedById: string;
  openedByRole: DisputeRole;
  reason: string;
  status: DisputeStatus;
  resolution: DisputeResolution | null;
  resolvedById: string | null;
  resolvedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface DisputeMessageEntity {
  id: string;
  disputeId: string;
  senderId: string | null;
  senderRole: DisputeRole;
  message: string;
  attachmentUrl: string | null;
  createdAt: Date;
}

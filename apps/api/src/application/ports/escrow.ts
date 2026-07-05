import type {
  EscrowEntity,
  EscrowStatus,
  DisputeEntity,
  DisputeStatus,
  DisputeMessageEntity,
  DisputeRole,
  SellerPayoutEntity,
  PayoutStatus,
  PayoutMethod,
} from '../../domain/entities/escrow';
import type { Currency } from '../../domain/entities/wallet';

export interface CreateEscrowInput {
  orderId: string;
  sellerId: string;
  customerId: string;
  amount: number;
  sellerAmount: number;
  commissionAmount: number;
  currency: Currency;
  status?: EscrowStatus;
  heldAt?: Date;
  releaseAt?: Date;
  payoutEligibleAt?: Date;
  paymentId?: string | null;
  metadata?: Record<string, unknown> | null;
}

export interface EscrowListFilter {
  status?: EscrowStatus;
  sellerId?: string;
  customerId?: string;
  from?: Date;
  to?: Date;
  page: number;
  limit: number;
}

export interface IEscrowRepository {
  findById(id: string): Promise<EscrowEntity | null>;
  findByOrderId(orderId: string): Promise<EscrowEntity | null>;
  create(data: CreateEscrowInput): Promise<EscrowEntity>;
  list(filter: EscrowListFilter): Promise<{ items: EscrowEntity[]; total: number }>;
  updateStatus(
    id: string,
    status: EscrowStatus,
    extras?: { releasedAt?: Date; refundedAt?: Date; releaseReason?: string },
  ): Promise<EscrowEntity>;
}

export interface CreatePayoutInput {
  sellerId: string;
  userId: string;
  amount: number;
  currency: Currency;
  method: PayoutMethod;
  destination: string;
  notes?: string | null;
  commissionAmount?: number | null;
  grossAmount?: number | null;
}

export interface PayoutListFilter {
  sellerId?: string;
  userId?: string;
  status?: PayoutStatus;
  method?: PayoutMethod;
  page: number;
  limit: number;
}

export interface IPayoutRepository {
  findById(id: string): Promise<SellerPayoutEntity | null>;
  create(data: CreatePayoutInput): Promise<SellerPayoutEntity>;
  listBySeller(
    sellerId: string,
    options: { status?: PayoutStatus; page: number; limit: number },
  ): Promise<{ items: SellerPayoutEntity[]; total: number }>;
  list(filter: PayoutListFilter): Promise<{ items: SellerPayoutEntity[]; total: number }>;
  updateStatus(
    id: string,
    status: PayoutStatus,
    extras?: {
      processedById?: string;
      processedAt?: Date;
      rejectionReason?: string;
      notes?: string;
    },
  ): Promise<SellerPayoutEntity>;
}

export interface CreateDisputeInput {
  escrowId: string;
  orderId: string;
  openedById: string;
  openedByRole: DisputeRole;
  reason: string;
}

export interface CreateDisputeMessageInput {
  disputeId: string;
  senderId: string | null;
  senderRole: DisputeRole;
  message: string;
  attachmentUrl?: string | null;
}

export interface DisputeListFilter {
  customerId?: string;
  status?: DisputeStatus;
  page: number;
  limit: number;
}

export interface IDisputeRepository {
  findById(id: string): Promise<DisputeEntity | null>;
  findByEscrow(escrowId: string): Promise<DisputeEntity | null>;
  create(data: CreateDisputeInput): Promise<DisputeEntity>;
  list(filter: DisputeListFilter): Promise<{ items: DisputeEntity[]; total: number }>;
  resolve(
    id: string,
    resolution: DisputeEntity['resolution'],
    resolvedById: string,
    note?: string,
  ): Promise<DisputeEntity>;
  addMessage(data: CreateDisputeMessageInput): Promise<DisputeMessageEntity>;
  listMessages(disputeId: string): Promise<DisputeMessageEntity[]>;
}

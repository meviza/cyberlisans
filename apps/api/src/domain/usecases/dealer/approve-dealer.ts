import { dealerRepository } from '../../../infrastructure/repositories/dealer.repository';
import { auditRepository } from '../../../infrastructure/repositories/audit.repository';
import { DealerNotFoundError, DealerInvalidStatusError } from '../../errors/dealer';

export interface ApproveDealerInput {
  dealerId: string;
  adminId: string;
  ipAddress?: string;
  userAgent?: string;
}

export async function approveDealer(input: ApproveDealerInput) {
  const existing = await dealerRepository.findById(input.dealerId);
  if (!existing) throw new DealerNotFoundError();
  if (existing.status === 'APPROVED') return existing;
  if (existing.status === 'SUSPENDED' || existing.status === 'REJECTED') {
    throw new DealerInvalidStatusError(`${existing.status} durumundaki bayi doğrudan onaylanamaz`);
  }
  const updated = await dealerRepository.setStatus(input.dealerId, 'APPROVED', {
    approvedById: input.adminId,
  });
  await auditRepository.log({
    actorId: input.adminId,
    action: 'STATUS_CHANGE',
    targetType: 'dealer_profile',
    targetId: input.dealerId,
    payload: { from: existing.status, to: 'APPROVED' },
    ipAddress: input.ipAddress,
    userAgent: input.userAgent,
  });
  return updated;
}

export interface SuspendDealerInput {
  dealerId: string;
  adminId: string;
  reason?: string;
  ipAddress?: string;
  userAgent?: string;
}

export async function suspendDealer(input: SuspendDealerInput) {
  const existing = await dealerRepository.findById(input.dealerId);
  if (!existing) throw new DealerNotFoundError();
  if (existing.status === 'SUSPENDED') return existing;
  const updated = await dealerRepository.setStatus(input.dealerId, 'SUSPENDED');
  await auditRepository.log({
    actorId: input.adminId,
    action: 'STATUS_CHANGE',
    targetType: 'dealer_profile',
    targetId: input.dealerId,
    payload: { from: existing.status, to: 'SUSPENDED', reason: input.reason ?? null },
    ipAddress: input.ipAddress,
    userAgent: input.userAgent,
  });
  return updated;
}

export interface RejectDealerInput {
  dealerId: string;
  adminId: string;
  reason: string;
  ipAddress?: string;
  userAgent?: string;
}

export async function rejectDealer(input: RejectDealerInput) {
  const existing = await dealerRepository.findById(input.dealerId);
  if (!existing) throw new DealerNotFoundError();
  if (existing.status === 'REJECTED') return existing;
  if (existing.status === 'APPROVED' || existing.status === 'SUSPENDED') {
    throw new DealerInvalidStatusError('Onaylanmış/askıdaki bayi reddedilemez');
  }
  const updated = await dealerRepository.setStatus(input.dealerId, 'REJECTED', {
    rejectionReason: input.reason,
  });
  await auditRepository.log({
    actorId: input.adminId,
    action: 'STATUS_CHANGE',
    targetType: 'dealer_profile',
    targetId: input.dealerId,
    payload: { from: existing.status, to: 'REJECTED', reason: input.reason },
    ipAddress: input.ipAddress,
    userAgent: input.userAgent,
  });
  return updated;
}

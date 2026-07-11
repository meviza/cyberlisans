import { dealerRepository } from '../../../infrastructure/repositories/dealer.repository';
import { DealerNotFoundError, DealerInvalidStatusError } from '../../../domain/errors/dealer';

export async function getDealerProfile(userId: string) {
  const profile = await dealerRepository.findByUserId(userId);
  if (!profile) throw new DealerNotFoundError();
  return profile;
}

export async function getDealerProfileById(id: string) {
  const profile = await dealerRepository.findById(id);
  if (!profile) throw new DealerNotFoundError();
  return profile;
}

export function assertDealerApproved(status: string) {
  if (status !== 'APPROVED') {
    throw new DealerInvalidStatusError('Sadece onaylı bayiler bu işlemi yapabilir');
  }
}

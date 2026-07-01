import { dealerRepository } from '../../../infrastructure/repositories/dealer.repository';
import type { DealerStatus } from '../../entities/dealer';

export interface ListDealersInput {
  status?: DealerStatus;
  search?: string;
  page: number;
  limit: number;
}

export async function listDealers(input: ListDealersInput) {
  return dealerRepository.list({
    status: input.status,
    search: input.search,
    page: input.page,
    limit: input.limit,
  });
}

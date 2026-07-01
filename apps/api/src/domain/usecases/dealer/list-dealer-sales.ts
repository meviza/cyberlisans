import { dealerRepository } from '../../../infrastructure/repositories/dealer.repository';
import { dealerSaleRepository } from '../../../infrastructure/repositories/dealer-sale.repository';
import { DealerNotFoundError } from '../../errors/dealer';
import type { DealerSaleStatus } from '../../entities/dealer';

export interface ListDealerSalesInput {
  dealerId: string;
  status?: DealerSaleStatus;
  page: number;
  limit: number;
}

export async function listDealerSales(input: ListDealerSalesInput) {
  const profile = await dealerRepository.findById(input.dealerId);
  if (!profile) throw new DealerNotFoundError();
  return dealerSaleRepository.listByDealer(input.dealerId, {
    status: input.status,
    page: input.page,
    limit: input.limit,
  });
}

export async function getDealerStats(dealerId: string) {
  const profile = await dealerRepository.findById(dealerId);
  if (!profile) throw new DealerNotFoundError();
  return dealerRepository.getStats(dealerId);
}

export async function getDealerEarnings(dealerId: string) {
  const profile = await dealerRepository.findById(dealerId);
  if (!profile) throw new DealerNotFoundError();
  return dealerSaleRepository.getTotalEarnings(dealerId);
}

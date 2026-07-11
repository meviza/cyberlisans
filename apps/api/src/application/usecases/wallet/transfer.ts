import { userRepository } from '../../../infrastructure/repositories/user.repository';
import { walletRepository } from '../../../infrastructure/repositories/wallet.repository';
import {
  SelfTransferError,
  RecipientNotFoundError,
  InvalidAmountError,
} from '../../../domain/errors/wallet';
import type { Currency } from '../../../domain/entities/wallet';

export async function transfer(input: {
  fromUserId: string;
  recipientUsername: string;
  currency: Currency;
  amount: number;
  note?: string;
}) {
  if (input.amount <= 0) throw new InvalidAmountError('Geçersiz tutar');
  const recipient = await userRepository.findByUsername(input.recipientUsername);
  if (!recipient) throw new RecipientNotFoundError();
  if (recipient.id === input.fromUserId) throw new SelfTransferError();
  await walletRepository.transfer({
    fromUserId: input.fromUserId,
    toUserId: recipient.id,
    currency: input.currency,
    amount: input.amount,
    description: input.note,
  });
  return { success: true, recipientId: recipient.id };
}

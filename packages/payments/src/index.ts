export * from './types';
export * from './errors';
export * from './currency';
export * from './idempotency';
export * from './mail';
export * from './webhook-security';
export { PayTRProvider } from './paytr';
export { NowPaymentsProvider } from './nowpayments';
export { PaparaProvider } from './papara';
export { StripeProvider } from './stripe';
export { BankTransferProvider, type BankTransferDetails } from './bank-transfer';

import { PayTRProvider } from './paytr';
import { NowPaymentsProvider } from './nowpayments';
import { PaparaProvider } from './papara';
import { StripeProvider } from './stripe';
import { BankTransferProvider } from './bank-transfer';
import type { IPaymentProvider, PaymentProvider } from './types';

export function createPaymentProvider(name: PaymentProvider): IPaymentProvider {
  switch (name) {
    case 'PAYTR':
      return new PayTRProvider();
    case 'NOWPAYMENTS':
      return new NowPaymentsProvider();
    case 'PAPARA':
      return new PaparaProvider();
    case 'STRIPE':
      return new StripeProvider();
    case 'BANK_TRANSFER':
      return new BankTransferProvider();
    case 'WALLET':
      throw new Error('WALLET is not a payment provider; use wallet credit directly');
    default:
      throw new Error(`Unknown payment provider: ${name}`);
  }
}

import { createHash } from 'crypto';
import type {
  IPaymentProvider,
  PaymentInitInput,
  PaymentInitResult,
  WebhookPayload,
  RefundInput,
  RefundResult,
  Currency,
} from './types';
import { InvalidAmountError, ProviderConfigError, RefundFailedError } from './errors';

interface BankTransferConfig {
  iban: string;
  accountName: string;
  bankName: string;
  referencePrefix?: string;
}

export interface BankTransferDetails {
  bankName: string;
  accountName: string;
  iban: string;
  referenceCode: string;
  amount: number;
  currency: Currency;
}

export class BankTransferProvider implements IPaymentProvider {
  readonly name = 'BANK_TRANSFER' as const;
  private config: BankTransferConfig;

  constructor(config: Partial<BankTransferConfig> = {}) {
    const iban = config.iban ?? process.env['BANK_IBAN'];
    const accountName = config.accountName ?? process.env['BANK_ACCOUNT_NAME'];
    const bankName = config.bankName ?? process.env['BANK_NAME'];
    if (!iban || !accountName || !bankName) {
      throw new ProviderConfigError('BANK_TRANSFER', 'iban/accountName/bankName');
    }
    this.config = {
      iban,
      accountName,
      bankName,
      referencePrefix: config.referencePrefix ?? 'CL',
    };
  }

  async init(input: PaymentInitInput): Promise<PaymentInitResult> {
    if (input.amount <= 0) throw new InvalidAmountError(input.amount);
    const ref = this.generateReference(input.userId, input.orderId);
    return {
      paymentId: ref,
      provider: 'BANK_TRANSFER',
      providerRef: ref,
      status: 'PENDING',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      raw: {
        details: this.getDetails(input.amount, input.currency, ref),
        instructions: this.getInstructions(ref),
      },
    };
  }

  verifyWebhook(headers: Record<string, string>, body: string): WebhookPayload {
    return {
      provider: 'BANK_TRANSFER',
      providerRef: 'manual',
      status: 'PENDING',
      amount: 0,
      currency: 'TRY',
      raw: { message: 'BANK_TRANSFER does not support automatic webhooks' },
      receivedAt: new Date(),
    };
  }

  async refund(input: RefundInput): Promise<RefundResult> {
    throw new RefundFailedError(
      'BANK_TRANSFER',
      "Manuel iade: admin IBAN'a transfer yaparak işlemi tamamlar",
    );
  }

  getDetails(amount: number, currency: Currency, referenceCode: string): BankTransferDetails {
    return {
      bankName: this.config.bankName,
      accountName: this.config.accountName,
      iban: this.config.iban,
      referenceCode,
      amount,
      currency,
    };
  }

  getInstructions(referenceCode: string): string[] {
    return [
      `${this.config.bankName} bankası ${this.config.iban} IBAN numarasına transfer yapın.`,
      `Açıklama kısmına mutlaka "${referenceCode}" kodunu yazın.`,
      'Transfer sonrası dekont fotoğrafını/faturasını yükleyin.',
      'Ödeme kontrolü 5-30 dakika içinde tamamlanır.',
    ];
  }

  private generateReference(userId: string, orderId?: string): string {
    const base = orderId ?? `${this.config.referencePrefix}-${Date.now()}`;
    return `${base}-${createHash('sha256')
      .update(userId + base)
      .digest('hex')
      .slice(0, 6)
      .toUpperCase()}`;
  }
}

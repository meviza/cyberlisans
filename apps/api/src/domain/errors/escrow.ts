import { PaymentError } from '@cyberlisans/payments/errors';

export class EscrowNotFoundError extends PaymentError {
  constructor() {
    super('Escrow bulunamadı', 'ESCROW_NOT_FOUND', 404);
  }
}

export class EscrowInvalidStatusError extends PaymentError {
  constructor(message = 'Escrow durumu bu işlem için uygun değil') {
    super(message, 'ESCROW_INVALID_STATUS', 409);
  }
}

export class EscrowAlreadyExistsError extends PaymentError {
  constructor() {
    super('Bu sipariş için zaten bir escrow kaydı var', 'ESCROW_ALREADY_EXISTS', 409);
  }
}

export class EscrowForbiddenError extends PaymentError {
  constructor(message?: string) {
    super(message ?? 'Bu escrow üzerinde işlem yetkiniz yok', 'ESCROW_FORBIDDEN', 403);
  }
}

export class PayoutNotFoundError extends PaymentError {
  constructor() {
    super('Ödeme talebi bulunamadı', 'PAYOUT_NOT_FOUND', 404);
  }
}

export class PayoutInsufficientBalanceError extends PaymentError {
  constructor() {
    super('Yetersiz bakiye veya minimum tutarın altında', 'PAYOUT_INSUFFICIENT_BALANCE', 400);
  }
}

export class PayoutInvalidStatusError extends PaymentError {
  constructor(message = 'Ödeme talebi durumu bu işlem için uygun değil') {
    super(message, 'PAYOUT_INVALID_STATUS', 409);
  }
}

export class PayoutMinimumAmountError extends PaymentError {
  constructor(min: number) {
    super(`Minimum payout tutarı: ${min}`, 'PAYOUT_MIN_AMOUNT', 400);
  }
}

export class PayoutForbiddenError extends PaymentError {
  constructor() {
    super('Bu payout üzerinde işlem yetkiniz yok', 'PAYOUT_FORBIDDEN', 403);
  }
}

export class DisputeNotFoundError extends PaymentError {
  constructor() {
    super('İtiraz bulunamadı', 'DISPUTE_NOT_FOUND', 404);
  }
}

export class DisputeInvalidStatusError extends PaymentError {
  constructor(message = 'İtiraz durumu bu işlem için uygun değil') {
    super(message, 'DISPUTE_INVALID_STATUS', 409);
  }
}

export class DisputeAlreadyExistsError extends PaymentError {
  constructor() {
    super('Bu escrow için zaten açık bir itiraz var', 'DISPUTE_ALREADY_EXISTS', 409);
  }
}

export class DisputeWindowExpiredError extends PaymentError {
  constructor() {
    super('İtiraz süresi dolmuş (7 gün)', 'DISPUTE_WINDOW_EXPIRED', 409);
  }
}

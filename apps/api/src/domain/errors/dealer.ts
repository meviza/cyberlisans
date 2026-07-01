import { PaymentError } from '@cyberlisans/payments/errors';

export class DealerNotFoundError extends PaymentError {
  constructor() {
    super('Bayi bulunamadı', 'DEALER_NOT_FOUND', 404);
  }
}

export class DealerProfileExistsError extends PaymentError {
  constructor() {
    super('Zaten bir bayi profiliniz var', 'DEALER_PROFILE_EXISTS', 409);
  }
}

export class DealerNotApprovedError extends PaymentError {
  constructor() {
    super('Bayi hesabı onaylanmamış', 'DEALER_NOT_APPROVED', 403);
  }
}

export class DealerLinkNotFoundError extends PaymentError {
  constructor() {
    super('Bayi linki bulunamadı', 'DEALER_LINK_NOT_FOUND', 404);
  }
}

export class DealerLinkCodeTakenError extends PaymentError {
  constructor() {
    super('Bu link kodu zaten kullanılıyor', 'DEALER_LINK_CODE_TAKEN', 409);
  }
}

export class DealerSaleExistsError extends PaymentError {
  constructor() {
    super('Bu sipariş için zaten bayi satış kaydı var', 'DEALER_SALE_EXISTS', 409);
  }
}

export class DealerPayoutNotFoundError extends PaymentError {
  constructor() {
    super('Bayi ödeme talebi bulunamadı', 'DEALER_PAYOUT_NOT_FOUND', 404);
  }
}

export class DealerInsufficientBalanceError extends PaymentError {
  constructor() {
    super('Yetersiz bayi bakiyesi', 'DEALER_INSUFFICIENT_BALANCE', 400);
  }
}

export class DealerInvalidStatusError extends PaymentError {
  constructor(message = 'Bayi durumu bu işlem için uygun değil') {
    super(message, 'DEALER_INVALID_STATUS', 409);
  }
}

import { PaymentError } from '@cyberlisans/payments/errors';

export class InsufficientBalanceError extends PaymentError {
  constructor() {
    super('Yetersiz bakiye', 'INSUFFICIENT_BALANCE', 400);
  }
}

export class WalletNotFoundError extends PaymentError {
  constructor() {
    super('Cüzdan bulunamadı', 'WALLET_NOT_FOUND', 404);
  }
}

export class RecipientNotFoundError extends PaymentError {
  constructor() {
    super('Alıcı bulunamadı', 'RECIPIENT_NOT_FOUND', 404);
  }
}

export class SelfTransferError extends PaymentError {
  constructor() {
    super('Kendinize transfer yapamazsınız', 'SELF_TRANSFER', 400);
  }
}

export class InvalidAmountError extends PaymentError {
  constructor(message = 'Geçersiz tutar') {
    super(message, 'INVALID_AMOUNT', 400);
  }
}

export class OrderNotFoundError extends PaymentError {
  constructor() {
    super('Sipariş bulunamadı', 'ORDER_NOT_FOUND', 404);
  }
}

export class OrderNotOwnedError extends PaymentError {
  constructor() {
    super('Bu sipariş size ait değil', 'ORDER_NOT_OWNED', 403);
  }
}

export class OrderNotPendingError extends PaymentError {
  constructor() {
    super('Sipariş ödeme için uygun değil', 'ORDER_NOT_PENDING', 409);
  }
}

export class PaymentNotFoundError extends PaymentError {
  constructor() {
    super('Ödeme bulunamadı', 'PAYMENT_NOT_FOUND', 404);
  }
}

export class UserNotFoundForAdminError extends PaymentError {
  constructor() {
    super('Kullanıcı bulunamadı', 'USER_NOT_FOUND', 404);
  }
}

export class MinWithdrawalError extends PaymentError {
  constructor() {
    super('Minimum çekim tutarı 50 ₺', 'MIN_WITHDRAWAL_50', 400);
  }
}

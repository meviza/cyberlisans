import { PaymentError } from '@cyberlisans/payments/errors';

export class SellerNotFoundError extends PaymentError {
  constructor() {
    super('Satıcı bulunamadı', 'SELLER_NOT_FOUND', 404);
  }
}

export class AlreadyHasSellerError extends PaymentError {
  constructor() {
    super('Zaten bir satıcı başvurunuz var', 'ALREADY_HAS_SELLER', 409);
  }
}

export class SellerSlugTakenError extends PaymentError {
  constructor() {
    super('Bu slug zaten kullanılıyor', 'SELLER_SLUG_TAKEN', 409);
  }
}

export class SellerInvalidStatusError extends PaymentError {
  constructor(message = 'Satıcı durumu bu işlem için uygun değil') {
    super(message, 'SELLER_INVALID_STATUS', 409);
  }
}

export class SellerNotApprovedError extends PaymentError {
  constructor() {
    super('Satıcı hesabı henüz onaylanmamış', 'SELLER_NOT_APPROVED', 403);
  }
}

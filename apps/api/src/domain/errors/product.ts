import { PaymentError } from '@cyberlisans/payments/errors';

export class ProductNotFoundError extends PaymentError {
  constructor() {
    super('Ürün bulunamadı', 'PRODUCT_NOT_FOUND', 404);
  }
}

export class ProductSlugTakenError extends PaymentError {
  constructor() {
    super('Bu slug zaten kullanılıyor', 'PRODUCT_SLUG_TAKEN', 409);
  }
}

export class ProductInactiveError extends PaymentError {
  constructor() {
    super('Ürün aktif değil', 'PRODUCT_INACTIVE', 422);
  }
}

export class InsufficientStockError extends PaymentError {
  constructor(productId: string, requested: number, available: number) {
    super(`Yetersiz stok: ${requested} istendi, ${available} mevcut`, 'INSUFFICIENT_STOCK', 422);
  }
}

export class CategoryNotFoundError extends PaymentError {
  constructor() {
    super('Kategori bulunamadı', 'CATEGORY_NOT_FOUND', 404);
  }
}

export class CategorySlugTakenError extends PaymentError {
  constructor() {
    super('Bu kategori slug zaten kullanılıyor', 'CATEGORY_SLUG_TAKEN', 409);
  }
}

export class BrandNotFoundError extends PaymentError {
  constructor() {
    super('Marka bulunamadı', 'BRAND_NOT_FOUND', 404);
  }
}

export class BrandSlugTakenError extends PaymentError {
  constructor() {
    super('Bu marka slug zaten kullanılıyor', 'BRAND_SLUG_TAKEN', 409);
  }
}

export class ProductKeyNotFoundError extends PaymentError {
  constructor() {
    super('Ürün anahtarı bulunamadı', 'PRODUCT_KEY_NOT_FOUND', 404);
  }
}

export class ProductKeyInUseError extends PaymentError {
  constructor() {
    super('Kullanılmış anahtar silinemez', 'PRODUCT_KEY_IN_USE', 409);
  }
}

export class NoKeysAvailableError extends PaymentError {
  constructor() {
    super(
      'Bu üründe teslim edilecek lisans anahtarı kalmadı. Stok sayısı güncel olmayabilir; satıcı anahtar yükleyene kadar Stripe ile ödeme alınamaz.',
      'NO_KEYS_AVAILABLE',
      422,
    );
  }
}

export class EmptyCartError extends PaymentError {
  constructor() {
    super('Sepet boş olamaz', 'EMPTY_CART', 400);
  }
}

export class OrderNotCancellableError extends PaymentError {
  constructor() {
    super('Bu sipariş iptal edilemez', 'ORDER_NOT_CANCELLABLE', 409);
  }
}

export class ProductOwnershipError extends PaymentError {
  constructor() {
    super('Bu ürün üzerinde işlem yetkiniz yok', 'PRODUCT_NOT_OWNED', 403);
  }
}

export class ProductReviewStatusError extends PaymentError {
  constructor(message = 'Ürün durumu bu işlem için uygun değil') {
    super(message, 'PRODUCT_REVIEW_STATUS_INVALID', 409);
  }
}

export class ProductDeleteConflictError extends PaymentError {
  constructor() {
    super('Aktif sipariş/eMANYAT kaydı olan ürün silinemez', 'PRODUCT_DELETE_CONFLICT', 409);
  }
}

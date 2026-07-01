export class EmailAlreadyExistsError extends Error {
  readonly code = 'EMAIL_EXISTS';
  constructor() {
    super('Bu e-posta zaten kayıtlı');
  }
}

export class UsernameTakenError extends Error {
  readonly code = 'USERNAME_TAKEN';
  constructor() {
    super('Bu kullanıcı adı alınmış');
  }
}

export class InvalidCredentialsError extends Error {
  readonly code = 'INVALID_CREDENTIALS';
  constructor(message = 'E-posta veya şifre hatalı') {
    super(message);
  }
}

export class AccountLockedError extends Error {
  readonly code = 'ACCOUNT_LOCKED';
  constructor(message = 'Hesap askıda') {
    super(message);
  }
}

export class AccountBannedError extends Error {
  readonly code = 'ACCOUNT_BANNED';
  constructor() {
    super('Hesap yasaklanmış');
  }
}

export class AccountPendingError extends Error {
  readonly code = 'ACCOUNT_PENDING';
  constructor() {
    super('Hesap doğrulama bekliyor');
  }
}

export class TwoFactorRequiredError extends Error {
  readonly code = '2FA_REQUIRED';
  constructor(message = '2FA kodu gerekli') {
    super(message);
  }
}

export class InvalidTwoFactorError extends Error {
  readonly code = 'INVALID_2FA';
  constructor(message = '2FA kodu geçersiz') {
    super(message);
  }
}

export class InvalidReferralError extends Error {
  readonly code = 'INVALID_REFERRAL';
  constructor() {
    super('Geçersiz referans kodu');
  }
}

export class AgeRestrictionError extends Error {
  readonly code = 'AGE_RESTRICTION';
  constructor() {
    super('18 yaş üstü olmalısınız');
  }
}

export class EmailNotVerifiedError extends Error {
  readonly code = 'EMAIL_NOT_VERIFIED';
  constructor() {
    super('E-posta doğrulanmamış');
  }
}

export class InvalidTokenError extends Error {
  readonly code = 'INVALID_TOKEN';
  constructor(message = 'Geçersiz veya süresi dolmuş token') {
    super(message);
  }
}

export class UserNotFoundError extends Error {
  readonly code = 'USER_NOT_FOUND';
  constructor() {
    super('Kullanıcı bulunamadı');
  }
}

export class MissingConsentError extends Error {
  readonly code = 'MISSING_CONSENT';
  constructor(message = 'KVKK ve kullanım koşulları onayı zorunludur') {
    super(message);
  }
}

export class TwoFactorMandatoryError extends Error {
  readonly code = '2FA_MANDATORY';
  constructor(message = 'Yönetici hesapları için 2FA zorunludur ve kapatılamaz') {
    super(message);
  }
}

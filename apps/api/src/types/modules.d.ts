declare module '@cyberlisans/validators/auth' {
  const validators: any;
  export default validators;
  export const registerSchema: any;
  export const loginSchema: any;
  export const forgotPasswordSchema: any;
  export const resetPasswordSchema: any;
  export const verifyEmailSchema: any;
  export const enable2FASchema: any;
  export const updateProfileSchema: any;
  export const changePasswordSchema: any;
  export const consentSchema: any;
  export const emailSchema: any;
  export const passwordSchema: any;
  export const usernameSchema: any;
  export const localeSchema: any;
  export const currencySchema: any;
  export type RegisterInput = any;
  export type LoginInput = any;
  export type ForgotPasswordInput = any;
  export type ResetPasswordInput = any;
  export type VerifyEmailInput = any;
  export type Enable2FAInput = any;
  export type UpdateProfileInput = any;
  export type ChangePasswordInput = any;
  export type ConsentInput = any;
}

declare module '@cyberlisans/auth' {
  const auth: any;
  export default auth;
  export const signAccessToken: any;
  export const signRefreshToken: any;
  export const verifyAccessToken: any;
  export const verifyRefreshToken: any;
  export const signEmailVerifyToken: any;
  export const verifyEmailVerifyToken: any;
  export const signPasswordResetToken: any;
  export const verifyPasswordResetToken: any;
  export const hashPassword: any;
  export const verifyPassword: any;
  export const generate2FASecret: any;
  export const generate2FAQRCode: any;
  export const verify2FAToken: any;
  export const authMiddleware: any;
  export const requireRole: any;
  export const requireAdmin: any;
  export const requireSuperAdmin: any;
  export const requireTwoFactor: any;
  export const optionalAuth: any;
  export const encryptToString: any;
  export const decryptFromString: any;
  export const encrypt: any;
  export const decrypt: any;
  export const generateBackupCodes: any;
  export const hashBackupCodes: any;
  export const verifyBackupCode: any;
  export type AccessTokenPayload = any;
  export type RefreshTokenPayload = any;
  export type EmailVerifyTokenPayload = any;
  export type PasswordResetTokenPayload = any;
}

declare module '@cyberlisans/payments' {
  const payments: any;
  export default payments;
  export const getMailService: any;
  export const mailTemplates: any;
  export const createPaymentProvider: any;
}

declare module '@cyberlisans/payments/index' {
  export const createPaymentProvider: any;
}

declare module '@cyberlisans/db/client' {
  const db: any;
  export default db;
  export const prisma: any;
}

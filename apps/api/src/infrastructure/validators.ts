import _validators from '@cyberlisans/validators/auth';

const validators = _validators as any;

export const registerSchema = validators.registerSchema;
export const loginSchema = validators.loginSchema;
export const forgotPasswordSchema = validators.forgotPasswordSchema;
export const resetPasswordSchema = validators.resetPasswordSchema;
export const verifyEmailSchema = validators.verifyEmailSchema;
export const enable2FASchema = validators.enable2FASchema;
export const updateProfileSchema = validators.updateProfileSchema;
export const changePasswordSchema = validators.changePasswordSchema;
export const consentSchema = validators.consentSchema;
export const emailSchema = validators.emailSchema;
export const passwordSchema = validators.passwordSchema;
export const usernameSchema = validators.usernameSchema;
export const localeSchema = validators.localeSchema;
export const currencySchema = validators.currencySchema;

export type RegisterInput = any;
export type LoginInput = any;
export type ForgotPasswordInput = any;
export type ResetPasswordInput = any;
export type VerifyEmailInput = any;
export type Enable2FAInput = any;
export type UpdateProfileInput = any;
export type ChangePasswordInput = any;
export type ConsentInput = any;
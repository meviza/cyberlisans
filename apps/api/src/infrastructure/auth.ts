import _auth from '@cyberlisans/auth';

const auth = _auth as any;

export const signAccessToken = auth.signAccessToken;
export const signRefreshToken = auth.signRefreshToken;
export const verifyAccessToken = auth.verifyAccessToken;
export const verifyRefreshToken = auth.verifyRefreshToken;
export const signEmailVerifyToken = auth.signEmailVerifyToken;
export const verifyEmailVerifyToken = auth.verifyEmailVerifyToken;
export const signPasswordResetToken = auth.signPasswordResetToken;
export const verifyPasswordResetToken = auth.verifyPasswordResetToken;
export const hashPassword = auth.hashPassword;
export const verifyPassword = auth.verifyPassword;
export const generate2FASecret = auth.generate2FASecret;
export const generate2FAQRCode = auth.generate2FAQRCode;
export const verify2FAToken = auth.verify2FAToken;
export const authMiddleware = auth.authMiddleware;
export const requireRole = auth.requireRole;
export const requireAdmin = auth.requireAdmin;
export const requireSuperAdmin = auth.requireSuperAdmin;
export const optionalAuth = auth.optionalAuth;

export type AccessTokenPayload = any;
export type RefreshTokenPayload = any;
export type EmailVerifyTokenPayload = any;
export type PasswordResetTokenPayload = any;
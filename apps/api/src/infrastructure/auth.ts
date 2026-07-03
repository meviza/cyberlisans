export {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  signEmailVerifyToken,
  verifyEmailVerifyToken,
  signPasswordResetToken,
  verifyPasswordResetToken,
  hashPassword,
  verifyPassword,
  generate2FASecret,
  generate2FAQRCode,
  verify2FAToken,
  authMiddleware,
  requireRole,
  requireAdmin,
  requireSuperAdmin,
  requireTwoFactor,
  optionalAuth,
  encryptToString,
  decryptFromString,
  encrypt,
  decrypt,
  generateBackupCodes,
  hashBackupCodes,
  verifyBackupCode,
} from '@cyberlisans/auth';

export type { AccessTokenPayload, RefreshTokenPayload } from '@cyberlisans/auth';

export type EmailVerifyTokenPayload = any;
export type PasswordResetTokenPayload = any;

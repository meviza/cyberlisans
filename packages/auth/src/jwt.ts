import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = process.env['JWT_SECRET'] ?? 'dev-secret-change-me-in-production-min-32-chars';
const JWT_ALG = 'HS256';
const ACCESS_TTL = '15m';
const REFRESH_TTL = '30d';
const EMAIL_VERIFY_TTL = '24h';
const PASSWORD_RESET_TTL = '1h';

const secretKey = new TextEncoder().encode(JWT_SECRET);

export interface AccessTokenPayload {
  sub: string;
  email: string;
  role: 'CUSTOMER' | 'ADMIN' | 'SUPER_ADMIN';
  username: string;
  type: 'access';
}

export interface RefreshTokenPayload {
  sub: string;
  jti: string;
  type: 'refresh';
}

export interface EmailVerifyTokenPayload {
  sub: string;
  email: string;
  type: 'email_verify';
}

export interface PasswordResetTokenPayload {
  sub: string;
  email: string;
  type: 'password_reset';
}

export async function signAccessToken(payload: Omit<AccessTokenPayload, 'type'>): Promise<string> {
  return new SignJWT({ ...payload, type: 'access' })
    .setProtectedHeader({ alg: JWT_ALG })
    .setIssuedAt()
    .setExpirationTime(ACCESS_TTL)
    .setIssuer('cyberlisans')
    .setAudience('cyberlisans-web')
    .sign(secretKey);
}

export async function verifyAccessToken(token: string): Promise<AccessTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey, {
      issuer: 'cyberlisans',
      audience: 'cyberlisans-web',
    });
    if (payload['type'] !== 'access') return null;
    return payload as unknown as AccessTokenPayload;
  } catch {
    return null;
  }
}

export async function signRefreshToken(payload: { sub: string; jti: string }): Promise<string> {
  return new SignJWT({ ...payload, type: 'refresh' })
    .setProtectedHeader({ alg: JWT_ALG })
    .setIssuedAt()
    .setExpirationTime(REFRESH_TTL)
    .setIssuer('cyberlisans')
    .sign(secretKey);
}

export async function verifyRefreshToken(token: string): Promise<RefreshTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey, { issuer: 'cyberlisans' });
    if (payload['type'] !== 'refresh') return null;
    return payload as unknown as RefreshTokenPayload;
  } catch {
    return null;
  }
}

export async function signEmailVerifyToken(payload: { sub: string; email: string }): Promise<string> {
  return new SignJWT({ ...payload, type: 'email_verify' })
    .setProtectedHeader({ alg: JWT_ALG })
    .setIssuedAt()
    .setExpirationTime(EMAIL_VERIFY_TTL)
    .setIssuer('cyberlisans')
    .sign(secretKey);
}

export async function verifyEmailVerifyToken(token: string): Promise<EmailVerifyTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey, { issuer: 'cyberlisans' });
    if (payload['type'] !== 'email_verify') return null;
    return payload as unknown as EmailVerifyTokenPayload;
  } catch {
    return null;
  }
}

export async function signPasswordResetToken(payload: { sub: string; email: string }): Promise<string> {
  return new SignJWT({ ...payload, type: 'password_reset' })
    .setProtectedHeader({ alg: JWT_ALG })
    .setIssuedAt()
    .setExpirationTime(PASSWORD_RESET_TTL)
    .setIssuer('cyberlisans')
    .sign(secretKey);
}

export async function verifyPasswordResetToken(token: string): Promise<PasswordResetTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey, { issuer: 'cyberlisans' });
    if (payload['type'] !== 'password_reset') return null;
    return payload as unknown as PasswordResetTokenPayload;
  } catch {
    return null;
  }
}
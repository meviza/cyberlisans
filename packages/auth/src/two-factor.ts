import { authenticator } from 'otplib';
import QRCode from 'qrcode';

const ISSUER = 'CyberLisans';

authenticator.options = { window: 1, digits: 6, step: 30 };

export function generate2FASecret(email: string): { secret: string; otpauthUrl: string } {
  const secret = authenticator.generateSecret();
  const otpauthUrl = authenticator.keyuri(email, ISSUER, secret);
  return { secret, otpauthUrl };
}

export async function generate2FAQRCode(otpauthUrl: string): Promise<string> {
  return QRCode.toDataURL(otpauthUrl, { width: 256, margin: 2 });
}

export function verify2FAToken(token: string, secret: string): boolean {
  try {
    return authenticator.verify({ token, secret });
  } catch {
    return false;
  }
}
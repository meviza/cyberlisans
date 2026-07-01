import { createCipheriv, createDecipheriv, randomBytes, createHash } from 'crypto';

const ALGO = 'aes-256-gcm';
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;

function getKey(): Buffer {
  const raw = process.env['CYBERLISANS_ENCRYPTION_KEY'];
  if (!raw) {
    if (process.env['NODE_ENV'] === 'production') {
      throw new Error('CYBERLISANS_ENCRYPTION_KEY env variable is required in production');
    }
    return Buffer.from('0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef', 'hex');
  }
  if (/^[0-9a-fA-F]{64}$/.test(raw)) {
    return Buffer.from(raw, 'hex');
  }
  try {
    const decoded = Buffer.from(raw, 'base64');
    if (decoded.length === 32) return decoded;
  } catch {}
  return createHash('sha256').update(raw).digest();
}

export interface EncryptedData {
  iv: string;
  ciphertext: string;
  authTag: string;
  keyVersion: number;
}

const KEY_VERSION = 1;

export function encrypt(plaintext: string, keyOverride?: Buffer): EncryptedData {
  const key = keyOverride ?? getKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGO, key, iv);
  const enc = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return {
    iv: iv.toString('base64'),
    ciphertext: enc.toString('base64'),
    authTag: authTag.toString('base64'),
    keyVersion: KEY_VERSION,
  };
}

export function decrypt(data: EncryptedData, keyOverride?: Buffer): string {
  const key = keyOverride ?? getKey();
  const iv = Buffer.from(data.iv, 'base64');
  const ciphertext = Buffer.from(data.ciphertext, 'base64');
  const authTag = Buffer.from(data.authTag, 'base64');
  if (authTag.length !== AUTH_TAG_LENGTH) {
    throw new Error('Invalid auth tag');
  }
  const decipher = createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(authTag);
  const dec = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return dec.toString('utf8');
}

export function serializeEncrypted(data: EncryptedData): string {
  return `${data.keyVersion}.${data.iv}.${data.authTag}.${data.ciphertext}`;
}

export function parseEncrypted(serialized: string): EncryptedData {
  const [version, iv, authTag, ciphertext] = serialized.split('.');
  if (!version || !iv || !authTag || !ciphertext) {
    throw new Error('Invalid encrypted payload format');
  }
  return {
    keyVersion: Number(version),
    iv,
    authTag,
    ciphertext,
  };
}

export function encryptToString(plaintext: string): string {
  return serializeEncrypted(encrypt(plaintext));
}

export function decryptFromString(serialized: string): string {
  return decrypt(parseEncrypted(serialized));
}

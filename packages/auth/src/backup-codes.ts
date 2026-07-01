import { randomBytes } from 'crypto';
import bcrypt from 'bcryptjs';

const BACKUP_CODE_COUNT = 10;
const BACKUP_CODE_LENGTH = 10;
const SALT_ROUNDS = 10;

function generateCode(): string {
  const bytes = randomBytes(BACKUP_CODE_LENGTH);
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = '';
  for (let i = 0; i < BACKUP_CODE_LENGTH; i++) {
    out += alphabet[(bytes[i] ?? 0) % alphabet.length];
  }
  return out;
}

export function generateBackupCodes(count: number = BACKUP_CODE_COUNT): {
  plain: string[];
  hashed: string[];
} {
  const plain: string[] = [];
  for (let i = 0; i < count; i++) {
    let code: string;
    do {
      code = generateCode();
    } while (plain.includes(code));
    plain.push(code);
  }
  return { plain, hashed: [] };
}

export async function hashBackupCodes(plain: string[]): Promise<string[]> {
  return Promise.all(plain.map((c) => bcrypt.hash(c, SALT_ROUNDS)));
}

export async function verifyBackupCode(code: string, hashes: string[]): Promise<number | null> {
  const normalized = code.toUpperCase().trim();
  for (let i = 0; i < hashes.length; i++) {
    const h = hashes[i];
    if (!h) continue;
    if (await bcrypt.compare(normalized, h)) {
      return i;
    }
  }
  return null;
}

export function formatBackupCode(input: string): string {
  return input.replace(/[^A-Z0-9]/gi, '').toUpperCase();
}

export const BACKUP_CODE_CONFIG = {
  count: BACKUP_CODE_COUNT,
  length: BACKUP_CODE_LENGTH,
};

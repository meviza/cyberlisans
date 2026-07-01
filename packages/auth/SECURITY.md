# @cyberlisans/auth — Security Notes

## 2FA (TOTP)

- Algorithm: HMAC-SHA1 (RFC 6238), 6 digits, 30-second step, window: ±1
- Secret: 160 bits, base32-encoded via `otplib`
- Storage: AES-256-GCM ciphertext in `UserTwoFactor.secretCipher` (separate table)
- Backup codes: 10 single-use codes, bcrypt hashed in `UserTwoFactor.backupCodesHash`

### 2FA Enforcement

- `ADMIN`, `SUPER_ADMIN`, `DEALER`: 2FA is **mandatory** and cannot be disabled via API
- `CUSTOMER`: 2FA is optional
- `requireTwoFactor()` middleware returns `403 2FA_REQUIRED` for admin/dealer without 2FA

### Setup Flow

1. `POST /auth/2fa/setup` — generates secret, encrypts, returns QR + 10 backup codes
2. User scans QR with Authenticator app
3. `POST /auth/2fa/verify { token }` — confirms TOTP, sets `enabled: true`
4. Backup codes shown **once** during setup; user must save them

## Password Policy

Enforced by `passwordSchema` in `@cyberlisans/validators/auth`:

- Minimum **12** characters
- At least one uppercase letter
- At least one lowercase letter
- At least one digit
- At least one special character
- Not in top-100 common passwords list

Use `passwordStrength()` to provide UX feedback (score 0-4, suggestions).

## Brute Force Lockout

See `apps/api/src/domain/security/brute-force.ts`:

| Attempts | Lockout    |
| -------- | ---------- |
| 5        | 15 minutes |
| 10       | 1 hour     |
| 20       | 24 hours   |

Lockout data is persisted to `FailedLoginAttempt` table and in-memory tracker. Locked users see `AccountLockedError` (403) with remaining time.

## Session Rotation

- Login: all existing sessions invalidated, new session created
- Refresh: old session deleted, new refresh token issued (jti rotation)
- Tokens are HS256 with 32+ char secret (`JWT_SECRET`)

## AES-256-GCM Crypto

```typescript
import { encryptToString, decryptFromString } from '@cyberlisans/auth/crypto';

const cipher = encryptToString(plaintext);
const plain = decryptFromString(cipher);
```

Key resolution order:

1. `CYBERLISANS_ENCRYPTION_KEY` env var (hex 64 chars OR base64 32 bytes)
2. SHA-256 hash of env var if non-standard length
3. Dev fallback (NEVER use in production)

## Constant-Time Comparison

`decrypt` uses `createDecipheriv` with GCM authentication — invalid auth tags throw, preventing padding-oracle attacks. Backup code verification uses bcrypt's constant-time compare.

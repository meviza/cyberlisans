# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in CyberLisans, please report it to **[email protected]**.

Please **do not** open a public issue or PR for security-related concerns. We will respond within 72 hours and provide a timeline for a fix.

## Threat Model

### Assets

- User credentials, sessions, and personal data (KVKK)
- Payment data and order fulfillment keys
- Wallet balances and loyalty coins
- Admin and dealer privileged actions
- 2FA secrets and backup codes

### Threat Actors

- **Anonymous attackers**: credential stuffing, brute force, scraping
- **Authenticated low-privilege users**: privilege escalation, IDOR
- **Compromised accounts**: stolen cookies, leaked tokens
- **Malicious insiders**: dealer abuse, admin misuse
- **External providers**: spoofed webhooks, replay attacks

### Out of Scope

- Physical access to user devices
- Compromised user device or endpoint
- Denial of service at network/infrastructure layer (handled by host)

## Controls (FAZ 7A)

### 1. Authentication

- Email + password (Argon2-equivalent via bcrypt cost 12)
- 2FA (TOTP via otplib, RFC 6238) mandatory for ADMIN, SUPER_ADMIN, and DEALER roles
- Backup codes (10 single-use, bcrypt-hashed) for 2FA recovery
- Login rotation: all sessions invalidated on successful login
- Password policy: min 12 chars, mix of upper/lower/digit/symbol, top-100 common-password blacklist

### 2. Brute Force Protection

- 5 failed attempts → 15 min lockout
- 10 failed attempts → 1 hour lockout
- 20 failed attempts → 24 hour lockout
- Lockout persisted to DB (`FailedLoginAttempt`) and in-memory tracker
- Constant-time bcrypt verify (built-in) + dummy hash compare for non-existent emails

### 3. Session Management

- Access tokens: 15 min TTL, HS256 JWT with `jose`
- Refresh tokens: 7 day absolute TTL, single-use, rotated on every refresh
- Idle timeout: 24 hours
- Refresh tokens hashed (SHA-256) at rest
- Session metadata (IP, UA) tracked

### 4. Rate Limiting

| Route                   | Limit                 |
| ----------------------- | --------------------- |
| `/auth/login`           | 5 / 15 min / IP+email |
| `/auth/register`        | 3 / hour / IP         |
| `/auth/forgot-password` | 3 / hour / IP         |
| `/auth/reset-password`  | 5 / hour / IP+token   |
| `/auth/verify-email`    | 10 / hour / IP+token  |
| `/auth/2fa/*`           | 5 / 15 min / userId   |
| `/payments/webhook/*`   | 100 / sec / provider  |
| `/api/*` (general)      | 60 / sec / IP         |
| `/admin/*`              | 30 / min / IP         |
| `/dealer/*`             | 60 / min / IP         |
| Global                  | 60 / sec / IP         |

Production should use Redis backend; default is in-memory with a swappable `RateLimiterStore` interface.

### 5. Transport & Headers

- HSTS: `max-age=31536000; includeSubDomains; preload`
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- Content-Security-Policy
- `Cross-Origin-Opener-Policy: same-origin`
- `Cross-Origin-Resource-Policy: same-origin`
- Server / X-Powered-By headers removed
- CORS: strict origin whitelist via `CYBERLISANS_ALLOWED_ORIGINS`

### 6. Encryption

- TOTP secrets: AES-256-GCM with key from `CYBERLISANS_ENCRYPTION_KEY` (32 bytes base64)
- Backup codes: bcrypt hashed
- Passwords: bcrypt cost 12
- Audit logs: append-only, Postgres trigger blocks UPDATE/DELETE/TRUNCATE

### 7. Webhook Security

- Per-provider HMAC signature verification
- Constant-time signature comparison (`timingSafeEqual`)
- Timestamp window check (5 minutes) for replay protection
- IP whitelist (env `CYBERLISANS_WEBHOOK_IP_WHITELIST_<PROVIDER>`)
- Provider-specific: PayTR (HMAC-SHA256 + salt), Stripe (signed payload + tolerance), NowPayments (sorted JSON + HMAC-SHA512), Papara (timestamp + JSON)

### 8. Input Validation

- Zod schemas on every endpoint
- Email: RFC 5322 regex + lowercase + trim
- Password: min 12 chars, complexity, common-password blacklist
- URL: prevents `javascript:`, `vbscript:`, `data:` (except `data:image`)
- HTML: server-side tag stripping (full DOMPurify recommended client-side)
- Prisma parametrized queries (NoSQL injection: not applicable; SQL injection mitigated by Prisma's bind variables)

### 9. Email Enumeration Prevention

- `/auth/register`: identical response regardless of email existence
- `/auth/forgot-password`: identical response, no leak
- `/auth/login`: generic "Email veya şifre hatalı"
- Dummy bcrypt comparison on missing user to normalize timing

### 10. Audit Log Immutability

- Postgres trigger `prevent_audit_log_modification` blocks UPDATE, DELETE, TRUNCATE
- Migration: `supabase/migrations/0002_audit_immutable.sql`
- All sensitive actions emit `AuditLog` entries with IP and UA

## Security Checklist for Production

- [ ] Set `NODE_ENV=production`
- [ ] Set `CYBERLISANS_ENCRYPTION_KEY` to a 32-byte base64 secret
- [ ] Set `JWT_SECRET` to ≥32 random chars
- [ ] Set `CYBERLISANS_ALLOWED_ORIGINS` to exact origins
- [ ] Set `CYBERLISANS_WEBHOOK_IP_WHITELIST_*` to provider IPs
- [ ] Configure Redis for rate limiter (`setDefaultRateLimiterStore`)
- [ ] Apply migration `0002_audit_immutable.sql`
- [ ] Enable HSTS preload at the edge
- [ ] Rotate `JWT_SECRET` and `CYBERLISANS_ENCRYPTION_KEY` periodically
- [ ] Monitor audit logs for suspicious activity

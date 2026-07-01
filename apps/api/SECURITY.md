# @cyberlisans/api — Security Notes

## Rate Limits

Configured in `src/interface/middleware/security/rate-limit.ts`:

| Route                   | Window | Max | Key             |
| ----------------------- | ------ | --- | --------------- |
| `/auth/login`           | 15 min | 5   | IP+email        |
| `/auth/register`        | 1 hour | 3   | IP              |
| `/auth/forgot-password` | 1 hour | 3   | IP              |
| `/auth/reset-password`  | 1 hour | 5   | IP+token        |
| `/auth/verify-email`    | 1 hour | 10  | IP+token        |
| `/auth/2fa/*`           | 15 min | 5   | userId          |
| `/payments/webhook/*`   | 1 sec  | 100 | provider        |
| Global `/api/*`         | 1 sec  | 60  | IP              |
| `/admin/*`              | 1 min  | 30  | IP+admin token  |
| `/dealer/*`             | 1 min  | 60  | IP+dealer token |

Custom store:

```typescript
import { setDefaultRateLimiterStore } from './interface/middleware/security/rate-limit';
import { RedisRateLimiterStore } from './interface/middleware/security/rate-limit-store';

setDefaultRateLimiterStore(new RedisRateLimiterStore(redisClient));
```

## Security Headers

`src/interface/middleware/security-headers.ts` applies both `hono/secure-headers` and a custom middleware to remove Server/X-Powered-By headers and add CSP/HSTS/COOP/CORP.

## CORS

`src/interface/middleware/cors.ts`:

- `CYBERLISANS_ALLOWED_ORIGINS` (comma-separated)
- Falls back to `NEXT_PUBLIC_APP_URL`, `CYBERLISANS_ADMIN_URL`, `CYBERLISANS_DEALER_URL`
- `credentials: true`
- `maxAge: 86400` (24h)

## Error Handling

`src/interface/middleware/error-handler.ts`:

- ZodError → 400 VALIDATION_ERROR
- Domain errors with `.code` and `.message` → mapped by code
- PaymentError → 400/401/403/404/409 by `statusCode`
- Unknown errors → 500 "Bir hata oluştu, lütfen tekrar deneyin"
- Stack traces logged but never returned

## Audit Logs

`audit_logs` table is **immutable** via Postgres trigger (migration `0002_audit_immutable.sql`). UPDATE, DELETE, TRUNCATE all blocked.

## Webhook Security

`packages/payments/src/webhook-security.ts`:

- `constantTimeEqual` — uses `crypto.timingSafeEqual`
- `verifyTimestampInWindow` — 5-minute default window, configurable
- `isIpWhitelisted` — supports CIDR ranges
- All providers use constant-time HMAC comparison

### Per-Provider Notes

- **PayTR**: HMAC-SHA256 over `merchant_oid + salt + status + total_amount`, base64
- **Papara**: timestamp in body or `x-papara-timestamp` header (5 min window)
- **Stripe**: signed payload `t.body`, v1 HMAC-SHA256, 5 min tolerance
- **NowPayments**: HMAC-SHA512 over sorted JSON, hex

### IP Whitelist

Set per-provider env vars:

```
CYBERLISANS_WEBHOOK_IP_WHITELIST_PAYTR=1.2.3.4,5.6.7.0/24
CYBERLISANS_WEBHOOK_IP_WHITELIST_STRIPE=3.18.12.63,3.130.192.231
```

When unset, no IP filtering is applied (fail-open for development).

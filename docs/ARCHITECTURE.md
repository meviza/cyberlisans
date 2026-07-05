# CyberLisans — Clean Architecture

## Felsefe

CyberLisans'ın backend'i **Robert C. Martin Clean Architecture**'a göre yapılandırılmıştır. Amaç:

1. **Bağımsızlık:** Business kuralları framework, DB, UI'dan bağımsız.
2. **Testability:** Use-case'ler dış dünya olmadan test edilebilir.
3. **Değişime hazır:** Ödeme provider'ı, ORM'i, framework'u değiştirmek kolay.

## Katmanlar

```
┌─────────────────────────────────────────────────┐
│  Interface Layer (Hono routes, Zod schemas)     │ ← Dış dünyaya açık
├─────────────────────────────────────────────────┤
│  Application Layer (Use-cases, Ports)           │ ← Orchestration
├─────────────────────────────────────────────────┤
│  Domain Layer (Entities, Value Objects, Errors) │ ← Saf iş kuralları
├─────────────────────────────────────────────────┤
│  Infrastructure Layer (Supabase, Mail, Storage) │ ← Dış adaptörler
└─────────────────────────────────────────────────┘
```

**Bağımlılık kuralı:** Dış katmanlar iç katmanlara bağımlı, iç katmanlar dışa değil. Domain hiçbir şeye bağımlı değil.

## Tarihsel Mimari Kararlar

| Tarih      | Karar                                                 | Gerekçe                                                                                                                            |
| ---------- | ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| 2026-07-03 | Prisma + Clean Architecture                           | İlk tasarım                                                                                                                        |
| 2026-07-04 | Prisma → **Supabase JS (PostgREST)**                  | Vercel serverless + Prisma + pgbouncer sorunlu (tenant/user not found, engine binary not found). PostgREST HTTP üzerinden çalışır. |
| 2026-07-04 | apps/api Hono catch-all (apps/web/[...path]/route.ts) | Monorepo workspace:\* bağımlılık sorunu nedeniyle ayrı Vercel projesi yerine tek Next.js içinde host.                              |
| 2026-07-04 | CamleCase DB kolonları                                | PostgREST için ("emailVerified", "displayName" şeklinde quote'lu).                                                                 |
| 2026-07-05 | HMAC service-to-service auth                          | Trigger.dev → apps/api çağrıları için. Admin password'u long-lived secret olarak tutmaz.                                           |
| 2026-07-05 | Vercel alias subdomain workaround                     | `cyberlisans.vercel.app` başka projeye atanmış. `cyberlisans-mp.vercel.app` ile çalışıldı.                                         |

## Use-case Pattern

Her use-case tek bir iş yapar:

```ts
// application/usecases/auth/login-user.ts
export class LoginUserUseCase {
  constructor(
    private userRepo: UserRepository, // port (interface)
    private sessionRepo: SessionRepository, // port
    private passwordHasher: PasswordHasher, // port
    private tokenSigner: TokenSigner, // port
  ) {}

  async execute(input: LoginInput): Promise<LoginOutput> {
    // 1. validate (delegated to schema)
    // 2. find user
    // 3. verify password
    // 4. check status
    // 5. issue tokens
    // 6. save session
    // 7. return DTO
  }
}
```

**Kurallar:**

- Use-case tek public method (`execute`)
- Maks 100 satır (ideal 30-60)
- Dış dünyaya doğrudan erişmez, port'lar üzerinden konuşur
- Entity dışında infrastructure type import etmez
- Her use-case'in kendi dosyası (parçalama)
- Hata durumunda `DomainError` veya custom error class fırlatır

## Repository Pattern (PostgREST)

```ts
// application/ports/repositories.ts (interface)
export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  save(user: User): Promise<void>;
}

// infrastructure/repositories/user.repository.ts (impl)
import { supabaseAdmin } from '../supabase-db';

export class SupabaseUserRepository implements UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    const { data, error } = await supabaseAdmin()
      .from('users')
      .select(
        'id,email,"emailVerified","displayName",role,"passwordHash",status,"createdAt","updatedAt"',
      )
      .eq('email', email.toLowerCase())
      .maybeSingle();
    if (error) throw new RepositoryError(error.message);
    return data ? toUserEntity(data) : null;
  }
}
```

**Kurallar:**

- camelCase quote'lu sütun adları: `"emailVerified"`, `"displayName"`, `"sellerId"`
- `supabaseAdmin()` her yerde (RLS bypass, service role)
- Hata durumunda `{data, error}` → `error ? throw : return data`
- `maybeSingle()` tek satır için, `single()` hata fırlatır
- `from('users').select('id,email')` açık sütun listesi (güvenlik)

## Frontend Katmanları

```
app/                          Next.js App Router (routing)
  (auth)/login/page.tsx        ← sadece sayfa iskeleti (max 80 satır)
  dashboard/seller/page.tsx    ← role-based dashboard (parçalanmış)
  dashboard/admin/page.tsx
  s/[slug]/page.tsx            ← public seller storefront
components/                   Görsel componentler
  dashboard/                   ← dashboard componentleri (parçalanmış)
    seller-stats-cards.tsx
    seller-status-banner.tsx
    apply-seller-prompt.tsx
  public-seller/               ← public storefront componentleri
    seller-hero.tsx
    seller-products-grid.tsx
    seller-footer.tsx
lib/                          Utility + hooks
  api/                        API client (same-origin /api)
  hooks/                      useAuth, useCart, useWallet, useApplySeller
```

**Component Kuralları:**

- Tek sorumluluk (SRP)
- Container vs Presenter ayrımı (logic vs UI)
- Max 200 satır (ideal 50-100)
- Props açıkça tiplenmiş, default value yok
- Custom hook (useXxx.ts) logic'i component'ten ayırır
- Loading + error state her component'te

## Marketplace Mimari Detayı

### Roller

| Rol         | Yetki                                               |
| ----------- | --------------------------------------------------- |
| CUSTOMER    | Ürün gör, satın al, escrow sonrası onayla           |
| SELLER      | Ürün listele, sipariş al, kazanç çek (admin onaylı) |
| ADMIN       | Satıcı onayla, dispute çöz, global komisyon ayarla  |
| SUPER_ADMIN | Admin yönetimi, platform ayarları                   |

### Escrow Akışı (M3)

```
[Customer] → pays ─→ [Platform Escrow]
                              │
                              ├── Escrow oluştur (HELD, 7d release)
                              │   sellerAmount = amount × (1 - commissionRate/100)
                              │   commissionAmount = amount × (commissionRate/100)
                              │
                              ├── (7 gün dolunca) → Trigger.dev cron → auto_release_escrow()
                              │   - sellers.balance += sellerAmount
                              │   - commissions tablosuna kayıt
                              │   - orders.status = COMPLETED
                              │
                              ├── (Customer onayı) → POST /api/escrow/:id/release
                              │   - release_escrow() RPC
                              │
                              └── (Dispute açılırsa) → escrow = DISPUTED
                                  - Admin çözer: REFUND/RELEASE/PARTIAL_REFUND
```

**Database state machine:**

- `escrow_transactions.status`: HELD → RELEASED / REFUNDED / DISPUTED
- `orders.status`: PENDING → COMPLETED / REFUNDED / DISPUTED
- `sellers.balance` ve `pendingBalance`: release/refund sonrası güncellenir

### Payout Akışı (M3)

```
[Seller] → POST /api/payouts (amount ≥ 50 TRY, KYC VERIFIED)
                              │
                              ├── seller_payouts tablosuna PENDING kayıt
                              │   seller.balance -= amount
                              │   seller.pendingBalance += amount
                              │
                              ├── (Admin) → POST /api/admin/escrow/payouts/:id/approve
                              │   - status = COMPLETED
                              │   - bank transfer dış servis (mock)
                              │
                              └── (Admin) → POST /api/admin/escrow/payouts/:id/reject
                                  - status = REJECTED
                                  - seller.balance += amount (geri)
```

### Dosya Organizasyonu (M3 sonrası)

```
apps/api/src/
├── domain/
│   ├── entities/
│   │   ├── user.ts
│   │   ├── product.ts           # base + seller-listed variant
│   │   ├── seller.ts            # seller profile + balance
│   │   ├── order.ts
│   │   ├── escrow.ts            # M3: escrow transaction
│   │   ├── payout.ts            # M3: payout request
│   │   ├── dispute.ts           # M3: dispute + messages
│   │   └── ...
│   ├── errors/
│   │   ├── auth.ts
│   │   ├── escrow.ts            # M3: 9 özel hata sınıfı
│   │   └── ...
│   └── security/
│       └── brute-force.ts
├── application/
│   ├── usecases/
│   │   ├── auth/                # login, register, logout, refresh, verify-email (5/5 ✅)
│   │   ├── seller/              # apply, approve, reject (TODO)
│   │   ├── product/             # create, update, list (M4)
│   │   ├── order/               # create (✅), pay, fulfill, cancel (TODO)
│   │   ├── escrow/              # create (✅), release (✅), refund (TODO), dispute (TODO)
│   │   ├── payout/              # request (✅), approve, reject (TODO)
│   │   └── review/              # create, list (TODO)
│   └── ports/
│       ├── auth.ts              # User, Session, PasswordHasher, TokenSigner
│       ├── seller.ts
│       ├── escrow.ts            # IEscrowRepository, IPayoutRepository, IDisputeRepository
│       └── ...
├── interface/
│   ├── routes/
│   │   ├── auth.ts
│   │   ├── sellers.ts           # public + me + apply
│   │   ├── admin/sellers.ts     # approve, reject, suspend
│   │   ├── escrow.ts            # M3: POST/GET escrow, release, refund
│   │   ├── payouts.ts           # M3: POST/GET payout
│   │   ├── disputes.ts          # M3: POST/GET dispute, messages
│   │   └── admin/escrow.ts      # M3: list, auto-release, approve/reject/resolve
│   ├── middleware/
│   │   ├── cors.ts
│   │   ├── security-headers.ts
│   │   ├── rate-limit.ts
│   │   └── error-handler.ts
│   └── dto/                     # Zod schemas
└── infrastructure/
    ├── db.ts                    # supabase-js alias (backward compat)
    ├── supabase-db.ts           # supabase(), supabaseAdmin()
    ├── instrument.ts            # Sentry init + Hono integration
    └── repositories/
        ├── user.repository.ts            # ✅ supabase-js
        ├── session.repository.ts         # ✅
        ├── user-two-factor.repository.ts # ✅
        ├── audit.repository.ts           # ✅
        ├── brand.repository.ts           # ✅
        ├── category.repository.ts        # ✅
        ├── consent.repository.ts         # ✅
        ├── order.repository.ts           # ✅
        ├── payment.repository.ts         # ✅
        ├── product.repository.ts         # ✅
        ├── product-key.repository.ts     # ✅
        ├── seller.repository.ts          # ✅
        ├── wallet.repository.ts          # ✅
        ├── escrow.repository.ts          # ✅ M3
        ├── payout.repository.ts          # ✅ M3
        └── dispute.repository.ts         # ✅ M3
```

## Trigger.dev + HMAC Service-to-Service

**Trigger task** (`src/trigger/release-escrow.ts`):

```ts
export const releaseEscrowTask = schedules.task({
  id: 'release-escrow',
  cron: { pattern: '0 3 * * *', timezone: 'Europe/Istanbul', environments: ['PRODUCTION'] },
  run: async () => {
    // HMAC signed POST to apps/api
    const timestamp = Date.now().toString();
    const signature = createHmac('sha256', secret).update(`${timestamp}.${body}`).digest('hex');
    await fetch(`${apiUrl}/api/internal/auto-release`, {
      method: 'POST',
      headers: {
        'X-Internal-Secret': secret,
        'X-Internal-Signature': signature,
        'X-Internal-Timestamp': timestamp,
      },
    });
  },
});
```

**HMAC doğrulama** (`apps/api/src/interface/routes/internal.ts`):

- `X-Internal-Secret`: shared secret (32+ char, env)
- `X-Internal-Signature`: HMAC-SHA256(`<timestamp>.<body>`)
- `X-Internal-Timestamp`: ±5 dakika clock skew kontrolü
- `timingSafeEqual` ile constant-time karşılaştırma

## Test Yaklaşımı

```ts
// Her use-case için (TODO: Vitest):
describe('LoginUserUseCase', () => {
  it('rejects wrong password', async () => {
    const userRepo = mock<UserRepository>();
    userRepo.findByEmail.mockResolvedValue(testUser);

    const hasher = mock<PasswordHasher>();
    hasher.verify.mockResolvedValue(false);

    const uc = new LoginUserUseCase(userRepo, mock(), hasher, mock());
    await expect(uc.execute({...})).rejects.toThrow(InvalidCredentialsError);
  });
});
```

**Mevcut test:**

- **Newman + Postman:** 21 endpoint, 105 assertion, GitHub Actions CI
- **Manuel curl:** Her milestone sonrası local + production smoke test

**Mock stratejisi:** Sadece port interface'leri mock'lanır, infra'ya dokunulmaz.

## Dosya Limitleri (özet)

| Katman         | Dosya            | Max satır       |
| -------------- | ---------------- | --------------- |
| Domain         | entity, error    | 200             |
| Application    | use-case         | **100**         |
| Application    | port (interface) | 200             |
| Interface      | route            | 200             |
| Interface      | middleware       | 200             |
| Infrastructure | repository       | 200             |
| Frontend       | page             | 100 (ideal 80)  |
| Frontend       | component        | 200 (ideal 100) |
| Frontend       | hook             | 200 (ideal 100) |

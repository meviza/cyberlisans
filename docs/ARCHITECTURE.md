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
│  Infrastructure Layer (Prisma, Stripe, Mail)    │ ← Dış adaptörler
└─────────────────────────────────────────────────┘
```

**Bağımlılık kuralı:** Dış katmanlar iç katmanlara bağımlı, iç katmanlar dışa değil. Domain hiçbir şeye bağımlı değil.

## Use-case Pattern

Her use-case tek bir iş yapar:

```ts
// application/usecases/auth/login-user.ts
export class LoginUserUseCase {
  constructor(
    private userRepo: UserRepository, // port
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

## Repository Pattern

```ts
// application/ports/repositories.ts (interface)
export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  save(user: User): Promise<void>;
}

// infrastructure/db/repositories/user.repository.ts (impl)
export class PrismaUserRepository implements UserRepository {
  constructor(private prisma: PrismaClient) {}
  // ... mapping between domain User and Prisma row
}
```

## Frontend Katmanları

```
app/                    Next.js App Router (routing only)
  (auth)/login/page.tsx  ← sadece sayfa iskeleti (max 50 satır)
components/             Görsel componentler
  auth/LoginForm.tsx     ← form logic + UI (max 150 satır)
lib/                    Utility + hooks
  api/                  API client (sadece Hono'ya bağlanır)
  hooks/                useAuth, useCart, useWallet
```

**Component Kuralları:**

- Tek sorumluluk (SRP)
- Container vs Presenter ayrımı (logic vs UI)
- Max 150 satır (ideal 50-100)
- Props açıkça tiplenmiş, default value yok

## Marketplace Mimari Detayı

### Roller

| Rol         | Yetki                                               |
| ----------- | --------------------------------------------------- |
| CUSTOMER    | Ürün gör, satın al, escrow sonrası onayla           |
| SELLER      | Ürün listele, sipariş al, kazanç çek (admin onaylı) |
| ADMIN       | Satıcı onayla, dispute çöz, global komisyon ayarla  |
| SUPER_ADMIN | Admin yönetimi, platform ayarları                   |

### Escrow Akışı

```
[Customer] → pays ─→ [Platform Escrow]
                              │
                              ├── (auto) → notify Seller
                              │
                              ├── Seller delivers (upload key)
                              │
                              ├── Customer confirms OR 7d auto-release
                              │
                              └── Seller wallet credited (escrow → seller)
                                   Commission deducted
```

### Dosya Organizasyonu (Marketplace)

```
domain/
  entities/
    user.ts
    product.ts           # base + seller-listed variant
    seller.ts            # seller profile + balance
    order.ts
    escrow.ts            # escrow transaction
    commission.ts
    payout.ts
    review.ts            # seller reviews
    dispute.ts
  value-objects/
    money.ts             # amount + currency
    order-status.ts
    escrow-status.ts

application/
  usecases/
    auth/                # login, register, logout, refresh, 2fa
    seller/              # apply, approve, reject, list, get
    product/             # create, update, list, search
    order/               # create, pay, fulfill, cancel
    escrow/              # create, release, refund, dispute
    payout/              # request, approve, reject
    review/              # create, list, reply
  ports/
    repositories.ts
    services.ts          # payment, mail, storage, escrow-clock

interface/
  routes/
    auth.ts
    sellers.ts
    products.ts
    orders.ts
    escrow.ts
    payouts.ts
    admin/
      sellers.ts         # approve, suspend
      escrow.ts          # intervention
      disputes.ts

infrastructure/
  db/repositories/      # Prisma implementations
  payments/
    stripe.ts
    paytr.ts
    papara.ts
  escrow/
    clock.ts             # mockable time
  mail/resend.ts
  storage/supabase.ts
```

## Test Yaklaşımı

```ts
// Her use-case için:
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

**Mock stratejisi:** Sadece port interface'leri mock'lanır, infra'ya dokunulmaz.

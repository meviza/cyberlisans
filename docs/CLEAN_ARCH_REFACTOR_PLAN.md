# Clean Architecture Refactor Plan — apps/api

> Status: **DRAFT** — single use-case (login-user) completed as proof of concept.
> Target: every use-case ≤ 100 lines, single `execute()` method, framework-free domain, ports injected via constructor.

---

## 1. Inventory Snapshot

| Metric                                     | Count                                                               |
| ------------------------------------------ | ------------------------------------------------------------------- |
| Total use-case files in `domain/usecases/` | **70**                                                              |
| Total LOC in `domain/usecases/**`          | **3 198**                                                           |
| Use-cases **over 100 lines**               | 5                                                                   |
| Use-cases **over 200 lines**               | **0** (largest is 180)                                              |
| Route files in `interface/routes/**`       | 24                                                                  |
| Routes **over 100 lines**                  | 14                                                                  |
| Routes **over 200 lines**                  | 3 (`admin/payments.ts` 289, `dealer.ts` 241, `admin/orders.ts` 208) |
| Entity files in `domain/entities/`         | 5 (all ≤ 108 LOC)                                                   |
| Error files in `domain/errors*`            | 4                                                                   |
| Infrastructure repositories                | 17                                                                  |
| Total LOC refactor target                  | **~4 900** (use-cases + routes)                                     |

### Top offenders (use-cases)

1. `auth/login-user.ts` — **180** → refactored ✅ (96 lines, new location)
2. `dealer/request-dealer-payout.ts` — 176
3. `auth/register-user.ts` — 149
4. `order/create-order.ts` — 146
5. `dealer/record-dealer-sale.ts` — 129

### Top offenders (routes)

1. `admin/payments.ts` — 289
2. `dealer.ts` — 241
3. `admin/orders.ts` — 208
4. `payments.ts` — 195
5. `auth.ts` — 188

---

## 2. Target Folder Layout

```
apps/api/src/
├── domain/
│   ├── entities/                    # pure data, ≤ 100 lines each
│   ├── value-objects/               # NEW — Money, Email, Slug, OrderNumber, EscrowStatus
│   ├── errors/                      # existing + extend with hierarchy
│   └── security/                    # brute-force etc. stays here (pure)
├── application/
│   ├── ports/
│   │   ├── repositories.ts          # existing (extend)
│   │   ├── services.ts              # NEW — PasswordHasher, TokenSigner, PaymentGateway, MailService, StorageService, Clock
│   │   ├── auth.ts                  # NEW — auth-specific ports (LoginUserDeps, BruteForceGuardPort, …)
│   │   └── …
│   └── usecases/
│       ├── auth/                    # NEW location
│       ├── seller/                  # NEW — dealer/ → seller/
│       ├── product/
│       ├── order/
│       ├── escrow/                  # NEW (currently inline in order/)
│       ├── payout/                  # NEW (currently in dealer/ + wallet/)
│       ├── review/                  # NEW
│       └── dispute/                 # NEW
├── interface/
│   ├── routes/{auth,sellers,products,orders,escrow,payouts,admin}/
│   ├── schemas/                     # NEW — Zod input/output per use-case
│   └── middleware/                  # auth, rate-limit, error-handler, request-context
└── infrastructure/
    ├── db/repositories/             # Prisma adapters per port
    ├── services/                    # BcryptPasswordHasher, JwtTokenSigner, ResendMail, …
    └── payments/                    # Stripe, PayTR, Papara adapters (PaymentGateway port)
```

---

## 3. Refactor Order (Milestones)

Each milestone moves a folder, never breaks the build (route layer keeps working via shim re-exports until next milestone).

### M0 — Foundations ✅ DONE

- Created empty target folders.
- Wrote `application/ports/auth.ts` (LoginUserDeps + supporting ports).
- Refactored `domain/usecases/auth/login-user.ts` → `application/usecases/auth/login-user.ts` (96 lines, class-based, single `execute`).
- Old file **kept** for transition; route layer still imports old path until M1.

### M1 — Auth use-cases (≤ 14 files, ~900 LOC)

Smallest blast radius, all routes already isolated in `interface/routes/auth.ts`.
| File | LOC | Difficulty |
|---|---|---|
| `auth/get-me.ts` | 94 | easy |
| `auth/logout.ts` | 66 | easy |
| `auth/refresh-token.ts` | 76 | easy |
| `auth/verify-2fa.ts` | 67 | easy |
| `auth/verify-email.ts` | 27 | trivial |
| `auth/disable-2fa.ts` | 51 | easy |
| `auth/enable-2fa.ts` | 50 | easy |
| `auth/change-password.ts` | 49 | easy |
| `auth/update-profile.ts` | 66 | easy |
| `auth/request-password-reset.ts` | 40 | easy |
| `auth/reset-password.ts` | 42 | easy |
| `auth/delete-account.ts` | 31 | easy |
| `auth/register-user.ts` | 149 | medium (consent + referral + email) |
| `auth/login-user.ts` | 180 → 96 ✅ | done |
| `user/send-password-reset.ts` | 45 | easy |
| `user/reset-2fa.ts` | 54 | easy |

After M1: delete old auth files; routes updated to import from `application/usecases/auth/*`.

### M2 — Product use-cases (8 files, ~340 LOC)

Pure CRUD, no external services. Easy win.

### M3 — Order + Payment use-cases (15 files, ~900 LOC)

Heaviest use-case: `create-order.ts` (146). PaymentGateway port needed (Stripe/PayTR/Papara adapters).

### M4 — Dealer → Seller migration (~11 files, ~880 LOC)

Rename folder `dealer/` → `seller/`. New `application/usecases/seller/*`.
Port: `SellerRepository` (alias for `DealerRepository`), `SellerLinkRepository`, `SellerPayoutRepository`, `SellerSaleRepository`.

### M5 — Wallet + Payout split

`wallet/admin-adjust-balance.ts` (67) and friends → `application/usecases/payout/*`. Requires `WalletRepository` port.

### M6 — Routes refactor (24 files, ~2 700 LOC)

Each route file ≤ 100 lines:

- parse → call use-case → respond
- pull Zod schemas into `interface/schemas/`
- move admin routes to dedicated `interface/routes/admin/` subfolder

### M7 — Cleanup

Delete `domain/usecases/**` once empty.
Replace remaining direct `prisma` imports in routes with repository injections.
Add value-objects: `Money`, `Email`, `Slug`, `OrderNumber`, `EscrowStatus`.

---

## 4. Per-Use-Case Port Reference (sample)

| Use-case            | Repository ports                            | Service ports                                                                                   |
| ------------------- | ------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| LoginUser           | User, Session, TwoFactor                    | PasswordHasher, TokenSigner, TwoFactorVerifier, BruteForceGuard, AuditLogger, AdminNoticeMailer |
| RegisterUser        | User, Consent                               | PasswordHasher, MailService, AuditLogger                                                        |
| RefreshToken        | Session, User                               | TokenSigner, AuditLogger                                                                        |
| Enable2FA           | User, TwoFactor                             | TwoFactorProvisioner, AuditLogger                                                               |
| VerifyEmail         | User, Consent                               | TokenSigner, AuditLogger                                                                        |
| CreateOrder         | Order, Product, ProductKey, Wallet, Payment | PaymentGateway, Clock, AuditLogger                                                              |
| RequestDealerPayout | Seller, SellerPayout, Wallet                | PaymentGateway, MailService, AuditLogger                                                        |
| CancelOrder         | Order, Product, ProductKey, Wallet, Payment | PaymentGateway, AuditLogger                                                                     |
| ListProducts        | Product                                     | —                                                                                               |
| ApproveDealer       | Seller, User                                | MailService, AuditLogger                                                                        |

(Full table per use-case to be filled during each milestone's planning PR.)

---

## 5. Difficulty Heuristic — "Easiest First"

For future auto-scheduling, the easiest wins are:

- `< 50` LOC use-cases with **≤ 2 repository deps** and **0 service deps**.
- Examples: `product/get-product.ts` (11 LOC), `category/list-categories.ts` (9 LOC), `brand/list-brands.ts` (9 LOC), `order/get-order.ts` (16 LOC), `wallet/get-wallet.ts` (17 LOC), `dealer/list-dealers.ts` (18 LOC), `wallet/list-transactions.ts` (23 LOC).

---

## 6. Conventions Established (from M0)

- One class per file: `<Verb><Noun>UseCase`.
- Constructor takes a `Deps` object (named port interfaces), no `new` of infra inside use-case.
- Single public method: `async execute(input, meta?): Promise<output>`.
- All cross-cutting state (`meta`, `now()`) passed in — never read `Date.now()` in use-case except inside `issueSession` (TODO: replace with `Clock` port in M7).
- Errors thrown from `domain/errors/*` only.
- Private methods allowed but each must be ≤ 15 lines.
- File cap: **100 lines** (excluding blank lines and pure type-only exports).
- During transition, old file imports a re-export shim from new location:

```ts
// src/domain/usecases/auth/login-user.ts (legacy)
export * from '../../../../application/usecases/auth/login-user';
```

---

## 7. M0 Deliverables

| Item         | Path                                                                                                                                                        | Status                 |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| New use-case | `apps/api/src/application/usecases/auth/login-user.ts`                                                                                                      | ✅ **96 lines**        |
| Port file    | `apps/api/src/application/ports/auth.ts`                                                                                                                    | ✅ 98 lines            |
| Old file     | `apps/api/src/domain/usecases/auth/login-user.ts`                                                                                                           | ⏸ kept for transition |
| New folders  | `domain/value-objects/`, `application/usecases/{auth,seller,product,order,escrow,payout,review,dispute}/`, `interface/schemas/`, `infrastructure/services/` | ✅ created empty       |
| Plan         | `docs/CLEAN_ARCH_REFACTOR_PLAN.md`                                                                                                                          | ✅ this file           |

### M0 — Import Map Reference

New use-case pulls types from:
| Symbol | Source |
|---|---|
| `LoginInput` | `interface/schemas/auth` (Zod + inferred type) — currently re-exported via `infrastructure/validators` from `@cyberlisans/validators/auth`. In M1, move Zod schemas under `interface/schemas/auth.ts`. |
| `LoginOutput`, `RequestMeta`, `LoginUserDeps` (and all `*Port` interfaces) | `application/ports/auth.ts` |
| `UserEntity`, `SessionEntity` | `domain/entities/user.ts`, `domain/entities/session.ts` |
| Domain errors | `domain/errors.ts` |
| `createHash`, `randomBytes` | `node:crypto` |

No infrastructure import in the new use-case (Prisma, Bcrypt, JWT, Mail all behind ports).

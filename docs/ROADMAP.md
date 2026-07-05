# CyberLisans — Roadmap & Program

> **Pivot kararı (M0, 2026-07-03):** CyberLisans artık sadece kendi ürünlerimizi sattığımız bir e-ticaret değil, onaylı 3rd-party satıcıların da ürün listeleyebildiği bir **dijital ürün marketplace**'idir (FunPay / Gamsgo modeli).

## Vizyon

- **Müşteri:** Tek yerden dijital lisans, oyun kredisi, yazılım key'i, AI API kredisi satın alır.
- **Satıcı:** Marketplace'e katılır, ürünlerini listeler, fiyatını/stoğunu yönetir, kazancını görür.
- **Platform (biz):** Escrow ile ödemeyi korur, dolandırıcılığı önler, komisyon alır, anlaşmazlıkları çözer.

---

## Mimari Kararlar (güncel)

| Konu        | Karar                                                                      | Tarih                     |
| ----------- | -------------------------------------------------------------------------- | ------------------------- |
| Backend     | Hono + Vercel Node serverless function                                     | M1                        |
| Veritabanı  | **Supabase Postgres + supabase-js (PostgREST)**                            | M2.1 (Prisma'dan geçildi) |
| Auth        | JWT (access + refresh), bcrypt hash, 2FA (TOTP), brute-force lockout       | M1                        |
| Ödeme       | Escrow (müşteri → platform → satıcı), komisyon tablosu, payout request     | M3                        |
| Frontend    | Next.js 15 (App Router), monorepo (pnpm)                                   | M1                        |
| Mimari stil | **Clean Architecture** (Domain → Application → Interface → Infrastructure) | M1                        |
| Kod limiti  | use-case max 100, route max 200, component max 200                         | M1                        |
| Raporlama   | Her milestone → git commit + tag + docs/MILESTONE-X.md                     | M0                        |
| Cron        | Trigger.dev (proj_sibrytqjplnlnkvxwfve)                                    | M3                        |
| API test    | Postman + Newman CI (GitHub Actions)                                       | M3                        |
| Monitoring  | Sentry (kısmen) + Vercel Analytics + Supabase Advisor                      | M3                        |

### Mimari Karar Logu (chronological)

- **M0 → M1:** Clean Architecture başlangıç, Prisma ile DB erişim
- **M2.1:** Prisma kaldırıldı → supabase-js (PostgREST). Vercel serverless + Prisma + pgbouncer = sorunlu (tenant/user not found + engine binary not found)
- **M3:** Vercel'de Hono catch-all pattern (`apps/web/[...path]/route.ts`) Node runtime'da host. HMAC service-to-service auth (Trigger → API) — admin password secret olarak tutulmaz
- **M3.1:** Vercel alias drift → subdomain workaround (`cyberlisans-mp.vercel.app`)

---

## Klasör Yapısı (güncel)

```
apps/
  api/                        Hono backend (apps/web/[...path] üzerinden host)
    src/
      domain/                 Framework bağımsız
        entities/             User, Product, Order, Escrow, Seller, Payout, Dispute
        errors/               DomainError hiyerarşisi (AuthError, EscrowNotFound, vs.)
        security/             Brute-force, JWT helpers
      application/            Framework bağımsız
        ports/                IUserRepository, ISellerRepository, IEscrowRepository, vs.
        usecases/             5/69 use-case Clean Architecture'a taşındı (login, register, request-payout, create-order, create-escrow, verify-email)
      interface/              Hono'ya özel
        routes/               auth, sellers, escrow, payouts, disputes, admin/*
        middleware/           CORS, security, rate-limit, error-handler
      infrastructure/         Dış dünya adaptörleri
        db.ts (supabase-js alias)
        supabase-db.ts
        repositories/         13 supabase-js repository (user, seller, product, order, vs.)
        lib/                  sentry-helpers
  web/                        Next.js 15 frontend (App Router)
    src/
      app/
        page.tsx              Landing
        (auth)/               Login, register, verify
        (account)/            Dashboard, orders, payouts
        s/[slug]/             Public seller storefront
        api/[...path]/        Catch-all → apps/api Hono
        dashboard/
          seller/             Satıcı dashboard
          admin/              Admin paneli
      components/             Parçalanmış componentler (max 200 satır)
        dashboard/            Satıcı + admin componentleri
        public-seller/        Public storefront componentleri
        ui/                   shadcn primitives
packages/
  auth/                       JWT, bcrypt, TOTP, crypto
  ui/                         shadcn + custom primitives
  validators/                 Zod schemas
  payments/                   Payment abstraction (interface)
  types/                      Shared TS types
  db/                         ⚠️ Legacy (Prisma schema, artık kullanılmıyor — silinecek)
src/trigger/                  Trigger.dev tasks (release-escrow)
trigger.config.ts             Trigger.dev v4 config (proj_sibrytqjplnlnkvxwfve)
postman/                      API collection + environments
docs/                         Tüm dökümanlar
memory/                       Günlük ham log (YYYY-MM-DD.md)
scripts/                      Helper scripts (vercel-helpers, health-check, pre-deploy)
.github/workflows/            CI (api-tests.yml)
```

---

## Milestone Program

### ✅ Tamamlanan

| M        | Açıklama                                                | Tag                | Tarih          |
| -------- | ------------------------------------------------------- | ------------------ | -------------- |
| **M0**   | Marketplace pivot kararı, mevcut state analizi          | —                  | 2026-07-03     |
| **M1**   | Clean Architecture başlangıç, auth/login refactor       | v1.0-clean-arch    | 2026-07-04     |
| **M2**   | Marketplace schema + seller profile + public storefront | v2.0-marketplace   | 2026-07-04     |
| **M2.1** | Prisma → Supabase REST migration, production login      | v2.1-supabase-rest | 2026-07-04     |
| **M3**   | Escrow + payout + dispute tam akış                      | **v3.0-escrow**    | **2026-07-05** |

### 🔴 Aktif Blocker (M3.1)

| ID     | Sorun                                                             | Çözüm                                                        |
| ------ | ----------------------------------------------------------------- | ------------------------------------------------------------ |
| M3.1-1 | Vercel alias drift (cyberlisans.vercel.app başka projeye atanmış) | Manuel Vercel Dashboard'dan alias yönetimi                   |
| M3.1-2 | Sentry source map upload (auth token eksik)                       | SENTRY_AUTH_TOKEN al, wrapper ekle                           |
| M3.1-3 | Supabase service_role rotate edilmedi                             | Dashboard'dan roll (2-3 gün içinde)                          |
| M3.1-4 | Trigger dashboard secret eşleşmedi                                | API_URL + INTERNAL_SERVICE_SECRET'i Trigger dashboard'a ekle |
| M3.1-5 | Vercel CLI alias komutu broken                                    | vercel.json alias array (workaround)                         |

### 🟡 Sırada

| M      | Hedef                | Plan                                                                 | Tag           |
| ------ | -------------------- | -------------------------------------------------------------------- | ------------- |
| **M4** | Satıcı ürün yönetimi | **Paralel 4 ajan** (backend, seller UI, admin UI, DB seed + Postman) | v4.0-products |

### ⚪ Backlog

| M            | Hedef                                                        | Öncelik |
| ------------ | ------------------------------------------------------------ | ------- |
| **M5**       | Payments entegrasyonu (PayTR + Papara + Crypto, mock → real) | Yüksek  |
| **M6**       | Review/rating UI + email verification + 2FA aktif            | Orta    |
| **M7**       | SEO + multi-language + landing page                          | Orta    |
| **M8**       | Beta launch + analytics + A/B test                           | Düşük   |
| **Refactor** | 5/69 use-case Clean Architecture'a taşındı, geri kalan 64    | Yüksek  |
| **Cleanup**  | dealer-\*.repository.ts (legacy) + packages/db (Prisma) sil  | Orta    |
| **Test**     | unit test (Vitest) + e2e test (Playwright)                   | Yüksek  |

---

## Sprint Plan (güncel)

### M4 — Satıcı Ürün Yönetimi (paralel 4 ajan)

**Ajan 1 — Backend use-case'leri:**

- `create-product.ts` (max 100 satır) — satıcı yeni ürün ekler
- `update-product.ts` (max 100 satır) — fiyat/stok/açıklama güncelle
- `delete-product.ts` (max 60 satır) — soft delete
- `list-seller-products.ts` (max 80 satır) — satıcının kendi ürünleri
- `approve-product.ts` (max 60 satır) — admin onayı (admin/escrow.ts'e ekle)
- `reject-product.ts` (max 60 satır)
- Repository update: `product.repository.ts` → listSellerProducts, update, delete methodları

**Ajan 2 — Seller UI:**

- `app/dashboard/seller/products/page.tsx` (max 100 satır) — ürün listesi
- `app/dashboard/seller/products/new/page.tsx` (max 100 satır) — yeni ürün formu
- `app/dashboard/seller/products/[id]/page.tsx` (max 100 satır) — düzenleme
- Component: `seller-product-table`, `seller-product-form`, `seller-stock-badge`

**Ajan 3 — Admin UI:**

- `app/dashboard/admin/products/page.tsx` (max 100 satır) — onay bekleyen ürünler
- `app/dashboard/admin/products/[id]/page.tsx` (max 100 satır) — detay + onay/red
- Component: `admin-product-table`, `admin-product-detail`, `admin-product-actions`

**Ajan 4 — DB seed + Postman:**

- supabase MCP ile 30 örnek ürün (5 seller × 6 ürün) ekle
- Postman collection'a product endpoint'leri ekle (4 yeni request)
- Newman test geçtiğini doğrula

**Çakışma önleme:** Her ajan farklı dosya grubuna yazar:

- Ajan 1: `apps/api/src/application/usecases/product/`
- Ajan 2: `apps/web/src/app/dashboard/seller/products/` + `apps/web/src/components/dashboard/seller-products/`
- Ajan 3: `apps/web/src/app/dashboard/admin/products/` + `apps/web/src/components/dashboard/admin-products/`
- Ajan 4: `postman/` + DB migrations

### M5 — Payments entegrasyonu (önizleme)

1. Ödeme soyutlaması (PaymentProvider interface)
2. PayTR sandbox entegrasyonu
3. Papara mock
4. Crypto mock (USDT TRC20)
5. Webhook handler
6. Order → Payment → Escrow flow

---

## Test Stratejisi

- **API test:** Newman + Postman collection (her milestone'da genişler)
- **Unit test (TODO):** Vitest ile use-case'ler
- **E2E test (TODO):** Playwright ile UI flow'ları
- **Manuel smoke:** Her milestone sonrası production'da canlı test
- **CI:** GitHub Actions — Newman PR'da otomatik koşar

## Başarı Metrikleri

- ✅ Code coverage > 70% (TODO)
- ✅ Tüm use-case < 100 satır (5/69 tamamlandı)
- ✅ Tüm component < 200 satır (limitlere uyuluyor)
- ✅ Production'da p95 latency < 500ms (lokalde ~400ms login)
- ✅ Escrow güvenliği: 0 dolandırıcılık vakası
- ✅ Newman 105/105 assertion geçti

---

## Döküman Yapısı

| Dosya                            | Amaç                                           | Güncelleme sıklığı           |
| -------------------------------- | ---------------------------------------------- | ---------------------------- |
| `STATUS.md`                      | Tek sayfa özet, her oturum başında okunur      | Her milestone                |
| `CONTEXT.md`                     | AI agent'ları için tam context                 | Her major değişiklik         |
| `ROADMAP.md`                     | Bu dosya — sprint planı + milestone durumu     | Her milestone                |
| `ARCHITECTURE.md`                | Clean Architecture diyagramı + katman haritası | Her major refactor           |
| `CHANGELOG.md`                   | Semver uyumlu değişiklik logu                  | Her commit (milestone bazlı) |
| `RUNBOOK.md`                     | Operasyon rehberi (deploy, rollback, debug)    | Yeni tool eklendikçe         |
| `MILESTONE-X.md`                 | Milestone bazlı detaylı rapor                  | Her milestone                |
| `OPERATIONS.md`                  | (eski, RUNBOOK.md ile birleştirilebilir)       | —                            |
| `CLEAN_ARCH_REFACTOR_PLAN.md`    | Use-case refactor sırası planı                 | Refactor başladığında        |
| `payment-infrastructure-todo.md` | Ödeme altyapısı TODO (M5 için)                 | M5 başlangıcında             |
| `memory/YYYY-MM-DD.md`           | Günlük ham log                                 | Her gün                      |

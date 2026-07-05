# CyberLisans — AI Agent Context

> **Bu dosya AI agent'ları (Claude, GPT, vs.) içindir.** Yeni bir oturum açıldığında veya başka bir AI projeyi analiz edeceğinde bu dosyayı okuyarak **kimin, neyi, neden, nasıl yaptığını** anlayabilir.

---

## 1. Proje Kimliği

**İsim:** CyberLisans
**Domain:** https://cyberlisans.vercel.app (M3.1'de düzelecek), https://cyberlisans-mp.vercel.app (yeni)
**GitHub:** https://github.com/meviza/cyberlisans (public)
**Sahibi:** Meviza (meviza) — Türkiye, dijital ürün marketplace'i
**Amaç:** FunPay/Gamsgo benzeri, Türkiye pazarına yönelik dijital ürün (oyun key'leri, yazılım lisansları, AI kredileri) marketplace'i. **Tam escrow akışı** ile satıcı-müşteri güvenliği.

---

## 2. İş Modeli

- **3 rol:** CUSTOMER (satın alan), SELLER (admin onaylı satıcı), ADMIN (yönetici), SUPER_ADMIN (sistem yöneticisi)
- **Komisyon:** Varsayılan %12, satıcıya göre değişebilir (Alice %12, Bob %10, Charlie %15)
- **Para akışı:** Müşteri ödeme yapar → para **platform escrow hesabında** bekletilir → 7 gün otomatik release (veya müşteri onayı) → komisyon kesilir, kalan satıcı balance'ına eklenir → satıcı payout talep eder → bank transfer
- **Dispute:** Müşteri 7 gün içinde itiraz açabilir → admin REFUND/RELEASE/PARTIAL kararı verir
- **Para birimi:** TRY (Türk Lirası), USD destekli

---

## 3. Teknik Stack

### Frontend

- **Next.js 15** (apps/web) — React Server Components, App Router
- **TypeScript strict** — tüm dosyalar
- **Tailwind CSS** — custom design tokens (cyber-cyan, cyber-magenta, cyber-darker)
- **shadcn/ui** — Radix + Tailwind components
- **Lucide React** — ikonlar
- **Zod** — runtime validation
- **TR** locale — Türkçe UI

### Backend

- **Hono** (apps/api) — modern web framework
- **Clean Architecture** — domain → application → interface → infrastructure
- **TypeScript strict** — tüm dosyalar
- **Supabase JS** (`@supabase/supabase-js`) — PostgREST üzerinden DB erişimi (TCP gerektirmez)
- **JWT** (`@cyberlisans/auth`) — access + refresh token
- **bcrypt** — şifre hash (cost 12)
- **HMAC-SHA256** — service-to-service auth (Trigger → API)

### Database

- **Supabase** (PostgreSQL) — project `aobbnmasgvbnpjmitnyi`
- **CamelCase** kolon adları: `emailVerified`, `displayName`, `sellerId` (PostgREST için)
- **8 PL/pgSQL fonksiyonu:** `auto_release_escrow()`, `release_escrow()`, `refund_escrow()`, vs.
- **27+ RLS policy** — service_role bypass + user role-based access
- **Migration'lar:** `supabase/migrations/0001-0005.sql`

### Deployment & DevOps

- **Vercel** — hosting + CDN (mevizas-projects team, cyberlisans project)
- **Trigger.dev** — scheduled jobs (project `proj_sibrytqjplnlnkvxwfve`, v3 API)
- **GitHub Actions** — Newman CI (postman/cyberlisans.postman_collection.json)
- **Sentry** — error monitoring (kısmen kurulu, source map upload bekliyor)

### Monitoring & Testing

- **Postman** — 21 endpoint, 6 klasör, 105 Newman assertion
- **GitHub Actions** — PR'da otomatik Newman çalıştırır
- **Supabase Dashboard** — DB inspection + advisor
- **Trigger.dev Dashboard** — cron run history
- **Vercel Dashboard** — deployment + env yönetimi

---

## 4. Mimari (Clean Architecture)

```
apps/api/src/
├── domain/                    # Framework bağımsız
│   ├── entities/              # User, Product, Order, Escrow, Payout, Dispute, Seller
│   ├── errors/                # AuthError, EscrowNotFound, vs.
│   └── security/              # Brute-force protection, JWT
├── application/               # Framework bağımsız
│   ├── ports/                 # IUserRepository, ISellerRepository, vs.
│   └── usecases/              # Login, Register, CreateOrder, CreateEscrow, vs.
├── interface/                 # Hono'ya özel
│   ├── routes/                # auth.ts, sellers.ts, escrow.ts, payouts.ts, vs.
│   ├── middleware/            # CORS, security, rate-limit, error-handler
│   └── dto/                   # Zod validation schemas
└── infrastructure/            # Dış dünyaya bağımlı
    ├── db.ts (supabase-js alias)
    ├── supabase-db.ts
    └── repositories/          # user, seller, product, order, payment, audit, escrow, payout, dispute
```

**Dosya limitleri:**

- Use-case: max 100 satır
- Route: max 200 satır
- Component: max 200 satır
- Her dosya single-responsibility

**Naming convention:**

- camelCase değişken
- PascalCase class/type
- snake_case DB enum (`PENDING`, `APPROVED`, `SUSPENDED`)

---

## 5. DB Şeması (36 tablo)

### Core

- `users` — auth + profile (role: CUSTOMER/SELLER/ADMIN/SUPER_ADMIN)
- `sessions` — refresh token tracking
- `user_two_factors` — 2FA setup (henüz aktif değil)
- `consents` — KVKK/GDPR

### Wallet & Payment

- `wallets` + `wallet_transactions` — müşteri cüzdanı
- `payments` — ödeme kayıtları (status: PENDING/COMPLETED/FAILED/REFUNDED)

### Catalog

- `categories` (3 seed), `brands` (8 seed), `products` (12 seed)
- `product_keys` (86 seed) — dijital key envanteri
- `product_listings` — satıcıya özel fiyat/stok

### Marketplace (M2)

- `sellers` — satıcı profili (status: PENDING/APPROVED/SUSPENDED/REJECTED)
- `seller_kyc` — KYC belgeleri
- `seller_referral_codes` — referral sistemi
- `reviews` — ürün/satıcı puanlama

### Escrow & Payout (M3)

- `orders` — sipariş kaydı
- `order_items` — sipariş kalemleri
- `escrow_transactions` — escrow state machine (HELD/RELEASED/REFUNDED/DISPUTED)
- `commissions` — platform komisyon kayıtları
- `seller_payouts` — satıcı çekim talepleri (status: PENDING/APPROVED/REJECTED/COMPLETED)
- `disputes` + `dispute_messages` — itiraz sistemi

### Audit

- `audit_logs` — tüm kritik aksiyonlar

---

## 6. Önemli Kararlar ve Gerekçeleri

| Karar                                                  | Tarih      | Gerekçe                                                                                                                                                          |
| ------------------------------------------------------ | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Prisma yerine supabase-js                              | 2026-07-04 | Vercel serverless + Prisma + pgbouncer = sorunlu (tenant/user not found, engine binary not found). PostgREST HTTP üzerinden çalışır.                             |
| Vercel'de Hono catch-all (apps/web/[...path]/route.ts) | 2026-07-04 | Monorepo workspace:\* bağımlılık sorunu nedeniyle ayrı Vercel projesi yerine tek Next.js içinde host.                                                            |
| CamleCase DB kolonları                                 | 2026-07-03 | PostgREST için ("emailVerified", "displayName" şeklinde). Supabase JS `.from().select('"emailVerified"')` syntax'ı destekler.                                    |
| HMAC service auth (Trigger → API)                      | 2026-07-04 | Admin password'u long-lived secret olarak tutmaktan daha güvenli. Header: `X-Internal-Secret`, `X-Internal-Signature`, `X-Internal-Timestamp` (5 dk clock skew). |
| 7 gün escrow hold                                      | M0         | FunPay/Gamsgo modeli. Dispute için yeterli süre, satıcı için makul bekleme.                                                                                      |
| %12 varsayılan komisyon                                | M0         | Sektör ortalaması. Seller bazında değişebilir (Alice %12, Bob %10, Charlie %15).                                                                                 |
| Vercel alias subdomain workaround                      | 2026-07-05 | `cyberlisans.vercel.app` başka projeye atanmış, Vercel CLI broken. `cyberlisans-mp.vercel.app` ile çalışıldı.                                                    |

---

## 7. Test Kullanıcıları (seed)

| Email                   | Password         | Role        | Seller                               |
| ----------------------- | ---------------- | ----------- | ------------------------------------ |
| admin@cyberlisans.com   | Admin!2026Safe   | ADMIN       | —                                    |
| alice@cyberlisans.com   | Alice!2026Safe   | CUSTOMER    | SELLER (APPROVED, alice-gaming-keys) |
| bob@cyberlisans.com     | Bob!2026Safe     | CUSTOMER    | SELLER (APPROVED, bob-software-hub)  |
| charlie@cyberlisans.com | Charlie!2026Safe | CUSTOMER    | SELLER (PENDING, charlie-ai-credits) |
| diana@cyberlisans.com   | Diana!2026Safe   | CUSTOMER    | —                                    |
| erhan@cyberlisans.com   | Erhan!2026Safe   | SUPER_ADMIN | —                                    |

**User UUID'leri:** 11111111-1111-1111-1111-111111111111 (admin), 22222222-2222-2222-2222-22222222222X (users), 33333333-... (erhan).

---

## 8. Hassas Veri Politikası

**ASLA paylaşılmaz, loglanmaz, echo edilmez:**

- Şifreler (hash dahil)
- JWT token'lar (access/refresh)
- Service role key'leri
- OAuth client secret'ları
- Personal token'lar
- Webhook sign secret'ları

**Paylaşılabilir (zaten public):**

- Supabase publishable key (`sb_publishable_*`)
- DSN'ler (browser'da görünür)
- Trigger project ref (`proj_*`)
- Postman API key'leri (workspace-scope)

**Geçen session'larda sızan ve rotate edilmesi gereken:**

- ⚠️ Supabase service_role JWT
- ⚠️ Vercel token
- ⚠️ Sentry OAuth client secret
- ⚠️ Sentry personal token

**Yapılacak:** User bunları Dashboard'lardan rotate edecek, env güncellenecek.

---

## 9. Çalışma Şekli

### Session akışı

1. `/docs/STATUS.md` oku (proje durumu)
2. `/memory/YYYY-MM-DD.md` (bugün + dün) oku (yakın geçmiş)
3. `/docs/CONTEXT.md` oku (bu dosya)
4. Görev varsa `todowrite` ile todo oluştur
5. Çalış, milestone bitince:
   - `/docs/MILESTONE-X.md` yaz
   - `/docs/STATUS.md` güncelle
   - `/docs/CHANGELOG.md` güncelle
   - `/memory/YYYY-MM-DD.md` yaz
   - `git commit` + tag
6. **Hassas veri echo etme, loglama, dosyaya yazma**

### Commit formatı

```
M3: Escrow akışı + Trigger.dev + Postman CI

- DB: 3 PL/pgSQL fonksiyonu + 7 RLS policy
- Backend: 5 use-case + 4 API route
- Frontend: 7 page + 14 component
- Trigger.dev: release-escrow cron task (v20260704.1 deploy)
- Postman: 21 endpoint, 105 assertion (105/105 geçti)
- Sentry: browser + server init (source map backlog)

Refs: docs/MILESTONE-3.md
```

### Tag formatı

`v<MAJOR>.<MINOR>.<PATCH>-<milestone-kısa-ad>`

- `v1.0-clean-arch`
- `v2.0-marketplace`
- `v2.1-supabase-rest`
- `v3.0-escrow`
- `v4.0-products` (sırada)

---

## 10. Sık Yapılan Hatalar (AI agent'lar için uyarılar)

1. **Hassas veriyi echo etme:** Kullanıcı service_role key paylaşırsa loglama, dosyaya yazma, sadece "rotate gerekli" de.

2. **Vercel deploy her zaman çalışmıyor:** Production test'i için `cyberlisans-mp.vercel.app` kullan, `cyberlisans.vercel.app` ayrı projeye atanmış olabilir.

3. **Trigger dashboard'da secret:** Trigger `globals` config'den değil, Dashboard'dan set edilir.

4. **apps/api env loading:** `process.env` doğru yükleniyor ama HMAC secret karşılaştırması başarısız olabilir. Vercel Dashboard'dan manuel env eklemek daha güvenilir.

5. **DB'de camelCase quote:** `select('"emailVerified"')` syntax'ı kullan, normalde PostgREST snake_case bekler ama biz camelCase kullanıyoruz.

6. **Dosya limitleri:** Use-case max 100 satır. Aşarsa parçala.

7. **Repository pattern:** Her entity için I<Entity>Repository interface + supabase-js implementation. Domain katmanı asla supabase import etmez.

8. **M3 endpoint'leri Vercel'de 404 olabilir:** Vercel'in eski deployment cache'i yeni route'ları görmüyor olabilir. `vercel deploy --force` dene.

---

## 11. AI Agent'lara Özel Notlar

- **Yeni oturum:** `STATUS.md` + `memory/2026-07-05.md` (bugün) oku, kaldığın yerden devam et.
- **Farklı AI:** Bu `CONTEXT.md` + `STATUS.md` + `memory/` klasörü = full handover. `ARCHITECTURE.md` mimari detay için.
- **Soru sor:** Kullanıcı spesifik bir şey isterse (ör. "Postman collection'ı güncelle"), direkt yap. Açıklama isteme, çalış.
- **Vercel/Sentry:** Her oturumda bunlarla boğuşmak yerine, çalışıyorsa bırak çalışsın. **Asıl iş M-seri özellik geliştirme + test + döküman.**

---

## 12. Bilinen TODO'lar ve Backlog

### M3.1 (acil, 1 ajan)

- Vercel alias drift düzeltme
- Sentry source map upload (auth token)
- Supabase service_role rotate
- Trigger dashboard secret eşleştirme
- apps/api env loading debug

### M4 (sırada, 4 paralel ajan)

- Backend: create/update/delete/list product use-case'leri
- Seller UI: ürün yönetimi dashboard
- Admin UI: ürün onaylama + kategori yönetimi
- DB seed: 30 örnek ürün (5 seller × 6 ürün)
- Postman: product endpoint'leri collection'a ekle

### Backlog (öncelik sırasıyla)

1. M5: Payments (PayTR + Papara + Crypto)
2. M6: Review/rating UI + email verification + 2FA aktif
3. M7: SEO + multi-language + landing page
4. M8: Beta launch + analytics + A/B test
5. Refactor: 5/69 use-case Clean Architecture'a taşındı, geri kalan 64 (öncelik: kritik fonksiyonlar)
6. Cleanup: dealer-\*.repository.ts (legacy) sil
7. Cleanup: packages/db (Prisma schema) sil — artık kullanılmıyor
8. Test: unit test (Vitest) — use-case'ler için
9. Test: e2e test (Playwright) — UI flow'ları için

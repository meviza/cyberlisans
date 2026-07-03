# CyberLisans — Roadmap & Program

> **Pivot kararı (M0, 3 Tem 2026):** CyberLisans artık sadece kendi ürünlerimizi sattığımız bir e-ticaret değil, onaylı 3rd-party satıcıların da ürün listeleyebildiği bir **dijital ürün marketplace**'idir (FunPay / Gamsgo modeli).

## Vizyon

- **Müşteri:** Tek yerden dijital lisans, oyun kredisi, yazılım key'i, AI API kredisi satın alır.
- **Satıcı:** Marketplace'e katılır, ürünlerini listeler, fiyatını/ stoğunu yönetir, kazancını görür.
- **Platform (biz):** Escrow ile ödemeyi korur, dolandırıcılığı önler, komisyon alır, anlaşmazlıkları çözer.

---

## Mimari Kararlar

| Konu        | Karar                                                                           |
| ----------- | ------------------------------------------------------------------------------- |
| Backend     | Hono + Vercel Node serverless function                                          |
| Veritabanı  | Supabase Postgres + Prisma ORM                                                  |
| Auth        | JWT (access + refresh), bcrypt hash, 2FA (TOTP), brute-force lockout            |
| Ödeme       | Escrow (müşteri → platform → satıcı), komisyon tablosu, payout request          |
| Frontend    | Next.js 15 (App Router), monorepo (pnpm + turbo)                                |
| Mimari stil | **Clean Architecture** (Domain → Application → Interface → Infrastructure)      |
| Kod limiti  | Hiçbir TS dosyası **200 satırı geçmez** (function 50, component 150, route 100) |
| Raporlama   | Her milestone → git commit + tag + docs/MILESTONE-X.md                          |

## Klasör Yapısı (Clean)

```
apps/
  api/                    Hono backend (production'da Vercel serverless)
    src/
      domain/             Entities + saf business rules
        entities/         User, Product, Order, Escrow, Seller, ...
        value-objects/   Money, Email, Slug, OrderNumber
        errors/          DomainError hierarchy
      application/        Use-cases (orchestration)
        usecases/        Her use-case 50-100 satır
        ports/           Repository interfaces (out) + service interfaces (in)
      interface/          HTTP sınırı
        routes/          Hono router'lar (her biri < 100 satır)
        middleware/      Auth, rate-limit, error handler
        schemas/         Zod request/response schemas
      infrastructure/    Dış dünya adaptörleri
        db/              Prisma client + repository implementations
        payments/        Stripe, PayTR, Papara, crypto
        mail/            Resend adapter
        storage/         Supabase storage adapter
        crypto/          bcrypt, jwt, TOTP
  web/                    Müşteri storefront (Next.js)
    src/
      app/
        (marketing)/     Landing, products, categories
        (account)/       Dashboard, wallet, orders, downloads
        (auth)/          Login, register, verify, reset
        (checkout)/      Cart, checkout, success
        api/             (SİLİNECEK — Hono'ya taşındı)
      components/
        ui/              shadcn primitives, max 100 satır
        product/         ProductCard, ProductGrid, ProductDetail
        cart/            CartItem, CartSummary
        checkout/        CheckoutForm, PaymentMethod
        account/         DashboardShell, OrderHistory, WalletView
      lib/                (utility + hooks)
        api/             Frontend api client (sadece Hono'ya bağlanır)
        hooks/
        utils/
  admin/                  Süper admin paneli (Next.js, ayrı deploy)
    src/                  apps/web/dashboard/admin/* ile paralel yapı
packages/
  db/                     Prisma client + schema
  auth/                   JWT, bcrypt, TOTP, crypto (pure functions)
  validators/             Zod schemas (paylaşılan)
  payments/               Ödeme soyutlamaları (interface)
  ui/                     shadcn + custom primitives
  i18n/                   TR/EN/DE/AR/RU çevirileri
  config/                 Ortak env'ler, sabitler
  types/                  Paylaşılan TS tipleri
```

---

## Program (8 haftalık sprint)

### Milestone 1 — Temiz Mimari + Tek Backend (Hafta 1)

**Hedef:** Duplicate backend kaldırılır, Hono Vercel'e deploy edilir, mimari temizlenir.

| Gün | Görev                                               | Çıktı                            |
| --- | --------------------------------------------------- | -------------------------------- |
| D1  | Roadmap/Architecture/Milestone docs yazımı          | docs/\* hazır, git tag v1.0-docs |
| D2  | Marketplace + escrow DB schema migration            | DB ready, git tag v1.1-db        |
| D3  | Hono API'yi Vercel Node serverless'e sarma + deploy | API canlı, git tag v1.2-api      |
| D4  | apps/web orphan auth route'ları sil                 | Tek backend, git tag v1.3-clean  |
| D5  | apps/api Clean Architecture refactor (start)        | Use-case'ler < 100 satır         |

### Milestone 2 — Marketplace Veri Katmanı (Hafta 2)

| Gün   | Görev                                                           |
| ----- | --------------------------------------------------------------- |
| D1-D2 | Seller application + admin approval flow                        |
| D3-D4 | Seller dashboard API (CRUD products, set prices, manage stock)  |
| D5    | Marketplace product listing (filter by seller, category, price) |

### Milestone 3 — Escrow Ödeme (Hafta 3-4)

| Gün   | Görev                                                |
| ----- | ---------------------------------------------------- |
| D1-D2 | Escrow transaction model + DB trigger                |
| D3-D4 | Ödeme init + webhook handler (Stripe/PayTR/Papara)   |
| D5-D7 | Otomatik release (teslim sonrası 7 gün) + iade akışı |

### Milestone 4 — Satıcı Dashboard (Hafta 4-5)

| Gün   | Görev                                                   |
| ----- | ------------------------------------------------------- |
| D1-D3 | Satıcı UI: ürün yönetimi, siparişler, kazançlar, payout |
| D4-D5 | Satıcı başvuru formu + admin onay paneli                |

### Milestone 5 — Süper Admin Paneli (Hafta 5-6)

| Gün   | Görev                                                  |
| ----- | ------------------------------------------------------ |
| D1-D2 | Tüm satıcılar/siparişler/ödemeler için global yönetim  |
| D3-D4 | Komisyon ayarları, escrow müdahale, dispute resolution |
| D5    | KPI dashboard + export                                 |

### Milestone 6 — Müşteri Deneyimi (Hafta 6-7)

| Gün   | Görev                                          |
| ----- | ---------------------------------------------- |
| D1-D2 | Misafir sepet + checkout'ta login zorunlu      |
| D3-D4 | Sipariş geçmişi, key teslimatı, fatura indirme |
| D5    | Bildirimler (email + in-app)                   |

### Milestone 7 — Güvenlik & Compliance (Hafta 7-8)

| Gün   | Görev                                      |
| ----- | ------------------------------------------ |
| D1-D2 | KVKK/GDPR consent, veri silme, veri export |
| D3-D4 | Rate limiting, brute-force, IP guard       |
| D5    | Audit log UI, güvenlik raporları           |

### Milestone 8 — Launch (Hafta 8)

- Tüm testler geçer
- Production seed (gerçekçi demo verisi)
- Landing page yenileme
- Vercel prod deploy + monitoring

---

## Durum Takibi

| Milestone | Durum                  | Tag                   | Tarih      |
| --------- | ---------------------- | --------------------- | ---------- |
| M0        | ✅ Pivot kararı + docs | v0.0-pivot            | 2026-07-03 |
| M1        | 🏗️ Devam ediyor        | v1.0-clean-arch       | TBD        |
| M2        | ⏳ Beklemede           | v2.0-marketplace      | TBD        |
| M3        | ⏳ Beklemede           | v3.0-escrow           | TBD        |
| M4        | ⏳ Beklemede           | v4.0-seller-dashboard | TBD        |
| M5        | ⏳ Beklemede           | v5.0-admin-panel      | TBD        |
| M6        | ⏳ Beklemede           | v6.0-customer-ux      | TBD        |
| M7        | ⏳ Beklemede           | v7.0-security         | TBD        |
| M8        | ⏳ Beklemede           | v8.0-launch           | TBD        |

---

## Test Stratejisi

- **Unit:** Her use-case için Vitest (iş mantığı, validasyon)
- **Integration:** Repository'ler gerçek Supabase test DB'si
- **E2E:** Playwright (login → satın al → escrow release)
- **Manuel smoke:** Her milestone sonrası production'da canlı test

## Başarı Metrikleri

- Code coverage > 70%
- Tüm use-case < 100 satır
- Tüm component < 150 satır
- Production'da p95 latency < 500ms
- Escrow güvenliği: 0 dolandırıcılık vakası

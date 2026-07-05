# CyberLisans — Changelog

Tüm önemli değişiklikler bu dosyada kayıt altına alınır. [SemVer](https://semver.org/) uyumlu.

## [Unreleased] — M3.1

### To Do

- Vercel alias drift düzeltme (cyberlisans.vercel.app başka projeye atanmış)
- Sentry source map upload (SENTRY_AUTH_TOKEN gerekli)
- Supabase service_role key rotate
- Trigger.dev dashboard secret eşleştirme

---

## [3.0.0] — 2026-07-05 — M3 Escrow & Payout Sistemi

### Added

- **DB:** `escrow_transactions.payoutEligibleAt`, `seller_payouts.{commissionAmount,grossAmount,currency}` kolonları
- **DB:** 3 PL/pgSQL fonksiyonu: `auto_release_escrow()`, `release_escrow()`, `refund_escrow()`
- **DB:** 7 RLS policy (commissions, seller_payouts, disputes, dispute_messages)
- **Backend:** 5 use-case — create-escrow, release-escrow, request-payout, create-dispute, resolve-dispute
- **Backend:** 4 API route — escrow, payouts, disputes, admin/escrow
- **Backend:** 3 repository (escrow, payout, dispute) + 3 port + 1 entity + 1 error modülü
- **Frontend:** 7 page (checkout, orders list/detail, seller payouts, admin disputes list/detail, admin escrow)
- **Frontend:** 14 component (parçalama) + sidebar role-based güncelleme
- **Trigger.dev:** `release-escrow` cron task (her gün 03:00 Europe/Istanbul)
- **Trigger.dev:** HMAC service-only endpoint `/api/internal/auto-release`
- **Postman:** 21 endpoint, 6 klasör, 105 assertion, GitHub Actions workflow
- **Sentry (kısmen):** browser + server init + DSN env

### Changed

- apps/api env'e INTERNAL_SERVICE_SECRET eklendi (HMAC için)
- Vercel production env'e 3 yeni değişken eklendi

### Known Issues

- Vercel alias drift (`cyberlisans.vercel.app` başka projeye atanmış)
- Sentry Next.js wrapper build sırasında fail (auth token eksik)
- `apps/api` Vercel'de M3 endpoint'leri 404 (eski deployment cache)

### Security

- ⚠️ Hassas token'lar geçen session'larda paylaşıldı (service_role JWT, Vercel token, Sentry client secret)
- → **ACİL:** Dashboard'lardan rotate edilmeli

---

## [2.1.0] — 2026-07-04 — Supabase REST Migration

### Added

- `apps/api/src/infrastructure/supabase-db.ts` — `supabase()` ve `supabaseAdmin()` client
- 13 repository supabase-js'e migrate (user, seller, product, order, payment, audit, vs.)
- 3 örnek satıcı seed (Alice, Bob, Charlie)
- 5 ürün satıcılara atandı

### Changed

- **BREAKING:** Prisma kaldırıldı, tüm backend `@supabase/supabase-js` (PostgREST) kullanıyor
- `apps/api/src/infrastructure/db.ts` artık Supabase alias (backward compat için)
- Vercel production login çalışıyor (`/api/auth/login` → 200 + JWT)

### Removed

- `packages/db/prisma/schema.prisma` (artık kullanılmıyor)
- Prisma engine binary bağımlılıkları

### Migration Notes

- Vercel serverless + Prisma + pgbouncer = sorunlu (tenant/user not found + engine binary not found)
- Çözüm: PostgREST üzerinden HTTP, TCP bağlantısı gerektirmez
- Bundle boyutu: ~50MB (Prisma) → ~250KB (supabase-js), 200x küçülme

---

## [2.0.0] — 2026-07-04 — M2 Marketplace Schema

### Added

- Marketplace DB migration `0003_marketplace_core.sql` ve `0004_escrow_triggers.sql`
- 9 yeni tablo: sellers, escrow_transactions, commissions, seller_payouts, disputes, dispute_messages, reviews, product_listings, seller_referral_codes, seller_kyc
- Marketplace API: seller apply, public storefront
- Seller dashboard UI (apply, status, public profile)

### Changed

- apps/api'de orphan auth/admin/dealer route'ları silindi
- Tek backend: Hono apps/api apps/web/[...path]/route.ts üzerinden host

---

## [1.0.0] — 2026-07-04 — M1 Clean Architecture

### Added

- Clean Architecture başlangıç: domain → application → interface → infrastructure
- login-user use-case refactor: 180 → 96 satır, port-driven DI
- Master plan + CLEAN_ARCH_REFACTOR_PLAN.md

### Changed

- `apps/api/src/application/usecases/auth/login-user.ts` Clean Architecture pattern'e geçti

---

## [0.x] — Pre-M1 (M0: Marketplace Pivot)

### Added

- Proje keşfi: monorepo pnpm+turbo yapısı
- DB schema (36 tablo, 27 RLS policy, 8 PL/pgSQL fonksiyon)
- Seed data: 6 user (1 SUPER_ADMIN + 5 Customer), 3 kategori, 8 marka, 12 ürün, 86 product key
- Marketplace pivot kararı: FunPay/Gamsgo modeli
- Tam escrow akış planı: müşteri → platform escrow → satıcı (komisyon kesilir), 7 gün otomatik release

### Pivot Strategy

- 3 rol: CUSTOMER, SELLER (admin onaylı), ADMIN, SUPER_ADMIN
- Tam escrow: komisyon kesintisi (varsayılan %12)
- Hassas veri (key, password, token) ASLA paylaşma
- GitHub milestone raporlarıyla ilerleme

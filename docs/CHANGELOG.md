# CyberLisans — Changelog

Tüm önemli değişiklikler bu dosyada kayıt altına alınır. [SemVer](https://semver.org/) uyumlu.

## [Unreleased] — M5.1.1 (schema drift fix)

### To Do

- 0006-0011 diskte yok, reverse-engineer gerek (M4.1 security hardening)
- M6: Review/rating + email verification + 2FA
- Redis-backed rate limiter (Upstash)

## [5.1.0] — 2026-07-05 — M5.1 Supabase Vault (Secret Store)

### Added

- **DB:** `public.app_secrets` tablosu + `public.secret_rotation_log` (append-only) + 2 RLS policy
- **DB:** `set_app_secret()` / `get_app_secret()` / `derive_secret_key()` SECURITY DEFINER fonksiyonları (pgcrypto AES-256, service_role only)
- **DB:** 7 migration: 0012-0018 (vault table, pgsodium → pgcrypto migration, schema fixes)
- **Backend:** `apps/api/src/lib/secret-store.ts` — env → Vault fallback, 60s in-memory cache
- **Backend:** `apps/api/src/interface/routes/admin/secrets.ts` — admin-only CRUD (list/value/log/delete)
- **Backend:** `apps/api/src/interface/routes/admin/allowed-secrets.ts` — 9 secret whitelist
- **Scripts:** `scripts/rotate-secret.ts` — CLI secret rotation (env value, actor = cli:<user>)
- **Scripts:** `scripts/vercel-env-update.sh` — Vercel encrypted env push (3 target)
- **Docs:** MILESTONE-5.1.md + STATUS.md güncellendi

### Security

- AES-256 encryption ile encrypted_value at-rest şifreli
- `REVOKE EXECUTE` PUBLIC/anon/authenticated'dan, `GRANT EXECUTE` service_role'a
- Append-only audit log (UPDATE/DELETE trigger block)
- ALLOWED_SECRET_NAMES whitelist (9 secret), diğer adlar reject
- Schema hardening: `touch_updated_at` camelCase `"updatedAt"` eklendi

### Verification

- 4 ardışık rotation (1× CREATED + 3× ROTATED) PASS
- Admin GET value (decrypted, length 18) PASS
- Audit log rotation history 5/5 PASS
- TypeScript typecheck temiz

### Known Issues

- pgsodium `randombytes_buf` permission denied → pgcrypto AES-256 fallback (decision recorded)
- `digest()` schema-qualified (`extensions.digest()`) zorunlu

---

## [5.0.0] — 2026-07-05 — M5 Shopier Multi-PSP

### Added

- **Backend:** `packages/payments/src/shopier.ts` — Shopier provider (HMAC-SHA256, redirect + webhook)
- **Backend:** `packages/payments/src/provider-selector.ts` — currency/country/amount-based selection
- **Backend:** `POST /payments/available-providers` endpoint
- **Frontend:** `apps/web/src/components/checkout/provider-picker.tsx` — runtime provider UI
- **Postman:** 5 yeni request, "Payments M5 (Shopier)" klasörü (165/165 PASS)
- **Docs:** MILESTONE-5.md

### Changed

- Hexagonal mimari: PSP eklemek tek dosya (~170 satır)
- `package.json` (payments) `export ./shopier` + `./provider-selector`

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

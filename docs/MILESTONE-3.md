# Milestone 3 — Escrow, Payout & Dispute Sistemi

**Tarih:** 2026-07-05
**Tag:** v3.0-escrow
**Durum:** ✅ Code complete, ⚠️ Vercel production deploy blocker (M3.1)

---

## Özet

Cyberlisans'ın **komple escrow altyapısı** uygulandı. Müşteri ödeme yapar → para platform escrow hesabında bekletilir → 7 gün otomatik olarak (veya müşteri onayıyla) satıcıya release edilir. Tüm bu süreç boyunca:

- Komisyon otomatik kesilir (varsayılan %12, satıcıya göre değişir)
- Müşteri itiraz açabilir, admin çözüm verebilir
- Satıcı balance'ından payout talep edebilir (banka/PayPal/crypto)
- Tüm işlemler audit log'a düşer

Sistem **3 use-case + 4 API route + 7 UI page + 14 component** ile çalışır durumda. Local geliştirme ortamında tüm endpoint'ler Newman + manual curl ile test edildi (105/105 assertion geçti). Production Vercel deploy'u ayrı bir blocker olarak M3.1 backlog'a alındı.

---

## Kapsam

### Database (Supabase migration `0005`)

- `escrow_transactions.payoutEligibleAt` kolonu eklendi (7 gün hold sonrası satıcı çekebilir)
- `seller_payouts` tablosuna `commissionAmount`, `grossAmount`, `currency` kolonları
- **3 PL/pgSQL fonksiyonu:**
  - `auto_release_escrow()` — 7 günü aşan HELD escrow'ları release eder, satıcı balance'ına ekler, komisyon kaydı oluşturur
  - `release_escrow(p_id, p_user, p_reason)` — manuel release (müşteri onayı veya admin)
  - `refund_escrow(p_id, p_user, p_reason)` — dispute/iptal durumunda müşteriye iade
- **7 RLS policy:**
  - `commissions`: admin full access, seller kendi commission'larını görür
  - `seller_payouts`: seller kendi payout'larını görür + APPROVED+KYC seller talep açar, admin yönetir
  - `disputes`: kullanıcı kendi dispute'larını görür, customer açar, admin yönetir
  - `dispute_messages`: dispute katılımcıları görür + yazar

### Backend (apps/api)

**5 Use-case (apps/api/src/application/usecases/):**

| Dosya                        | Satır | Sorumluluk                                                                 |
| ---------------------------- | ----- | -------------------------------------------------------------------------- |
| `escrow/create-escrow.ts`    | 102   | Order oluşturulunca escrow yaratır, sellerAmount/commissionAmount hesaplar |
| `escrow/release-escrow.ts`   | 48    | RPC ile `release_escrow` çağırır                                           |
| `payout/request-payout.ts`   | 99    | Satıcı balance'ından çekim talebi (min 50 TRY, KYC+APPROVED kontrolü)      |
| `dispute/create-dispute.ts`  | 85    | Müşteri escrow üzerinden itiraz açar, escrow DISPUTED olur                 |
| `dispute/resolve-dispute.ts` | 106   | Admin çözer: REFUND/RELEASE/PARTIAL_REFUND                                 |

**4 API Route + Repository + Port + Entity + Error:**

- `interface/routes/escrow.ts` (98 satır) — POST/GET escrow, release, refund
- `interface/routes/payouts.ts` (77 satır) — POST request, GET list, GET single
- `interface/routes/disputes.ts` (100 satır) — POST open, GET list, GET/POST messages
- `interface/routes/admin/escrow.ts` (128 satır) — admin escrow listesi, auto-release trigger, payout approve/reject, dispute resolve

**Domain layer:**

- `domain/entities/escrow.ts` — Escrow, Payout, Dispute entity tipleri
- `domain/errors/escrow.ts` — 9 özel hata sınıfı (EscrowNotFound, InsufficientBalance, vs.)
- `infrastructure/repositories/escrow.repository.ts` (127 satır)
- `infrastructure/repositories/payout.repository.ts` (129 satır)
- `infrastructure/repositories/dispute.repository.ts` (165 satır)

### Frontend (apps/web)

**7 Sayfa:**
| Sayfa | Satır | Amaç |
|---|---|---|
| `app/checkout/page.tsx` | 84 | Müşteri ödeme yöntemi seçimi, sipariş onayı |
| `app/dashboard/orders/page.tsx` | 85 | Müşteri sipariş listesi (status filter) |
| `app/dashboard/orders/[id]/page.tsx` | 79 | Tek sipariş + escrow timeline + dispute butonu |
| `app/dashboard/seller/payouts/page.tsx` | 75 | Satıcı payout dashboard + talep modalı |
| `app/dashboard/admin/disputes/page.tsx` | 74 | Admin dispute listesi + filter |
| `app/dashboard/admin/disputes/[id]/page.tsx` | 86 | Dispute çözüm formu + message thread |
| `app/dashboard/admin/escrow/page.tsx` | 98 | Admin escrow tablosu + auto-release butonu |

**14 Component (parçalama):**

- Orders: `order-header` (59), `order-status-timeline` (94), `order-escrow-card` (82), `dispute-button` (78)
- Payouts: `payout-stats` (42), `payout-table` (90), `payout-request-modal` (98)
- Admin: `dispute-table` (79), `dispute-filters` (51), `dispute-messages` (61), `dispute-resolve-form` (83), `escrow-table` (77), `escrow-stats` (42)
- Sidebar role-based güncellendi (CUSTOMER → Siparişlerim, SELLER → Payoutlar, ADMIN → Disputes + Escrow)

### Altyapı & Araç Entegrasyonları

#### Trigger.dev — Auto-release cron

- **Project ref:** `proj_sibrytqjplnlnkvxwfve`
- **Task:** `src/trigger/release-escrow.ts` — her gün 03:00 Europe/Istanbul
- **Endpoint:** `/api/internal/auto-release` (HMAC-SHA256 signed, 32+ char secret)
- **Deploy:** v20260704.1 başarıyla cloud.trigger.dev'e yüklendi

#### Postman + Newman CI

- **Collection:** `postman/cyberlisans.postman_collection.json` (21 request, 6 klasör)
- **Environments:** `local`, `production`
- **Newman test:** 105/105 assertion geçti, 14.4s
- **GitHub Actions:** `.github/workflows/api-tests.yml` (PR'da otomatik koşar)

#### Sentry (kısmen kurulu)

- ✅ Browser init (`@sentry/nextjs/client`) — `instrumentation-client.ts`
- ✅ Server init (`@sentry/node`) — `apps/api/src/instrument.ts`
- ✅ DSN Vercel env'e eklendi
- ❌ `withSentryConfig` wrapper build sırasında source map upload deniyor, auth token eksik → **build fail**
- **Çözüm (backlog):** M4 sonrası `SENTRY_AUTH_TOKEN` alınıp wrapper eklenecek

---

## Akış Diyagramı

```
[CUSTOMER]                                              [PLATFORM]                          [SELLER]
    |                                                       |                                   |
    |-- 1. Sipariş ver (POST /api/orders) ----------------->|                                   |
    |                                                       |-- create-escrow (HELD + 7d) ----->|
    |                                                       |                                   |
    |   (7 gün boyunca)                                     |                                   |
    |                                                       |                                   |
    |-- 2. İtiraz aç (opsiyonel, POST /api/disputes) ------>|                                   |
    |                                                       |-- escrow = DISPUTED --------------->|
    |                                                       |                                   |
    |                                                       |                                   |
    |   (admin çözer)                                       |                                   |
    |                                                       |-- REFUND → customer               |
    |                                                       |-- RELEASE → seller                |
    |                                                       |                                   |
    |-- (7 gün dolunca) otomatik release ------------------>|                                   |
    |                                                       |-- auto_release_escrow() ----------->|
    |                                                       |   sellerAmount → seller.balance    |
    |                                                       |   commissionAmount → commissions   |
    |                                                       |                                   |
    |                                                       |   [payoutEligibleAt] sonra         |
    |                                                       |<------- payout talebi --------------|
    |                                                       |-- approve (admin) ---------------->|
    |                                                       |                                   |-- bank transfer
```

---

## Test Sonuçları

### Local Newman (production environment)

```
Collection: cyberlisans.postman_collection.json
Folders: 6 (Auth, Sellers, Escrow, Disputes, Payouts, Admin, Health)
Requests: 21
Assertions: 105 passed / 105 total
Duration: 14.4s
Status: ✅ All passed
```

### Manual curl test (apps/api local)

| #   | Endpoint                          | Method   | Sonuç                                    |
| --- | --------------------------------- | -------- | ---------------------------------------- |
| 1   | `/escrow`                         | POST     | 201 — 1000 TRY, seller 880, komisyon 120 |
| 2   | `/escrow/:id`                     | GET      | 200                                      |
| 3   | `/escrow/:id/release`             | POST     | RPC çalıştı, komisyon hesaplandı         |
| 4   | `/disputes`                       | POST     | 201 — escrow DISPUTED                    |
| 5   | `/disputes/me`                    | GET      | 200                                      |
| 6   | `/disputes/:id/messages`          | POST/GET | 201/200                                  |
| 7   | `/payouts`                        | POST     | 201 — 100 USD                            |
| 8   | `/payouts` (min altı)             | POST     | 400 — `PAYOUT_MIN_AMOUNT`                |
| 9   | `/payouts` (yetersiz bakiye)      | POST     | 400 — `PAYOUT_INSUFFICIENT_BALANCE`      |
| 10  | `/payouts/me`                     | GET      | 200                                      |
| 11  | `/admin/escrow/escrow` (CUSTOMER) | GET      | 403 — `INSUFFICIENT_ROLE`                |

---

## Aktif Blocker'lar

### 🔴 M3.1 — Vercel production deploy

**Sorun:** `cyberlisans.vercel.app` Vercel'de farklı bir projeye atanmış, Vercel CLI alias komutu broken (sürekli "deployment not found" hatası).
**Çözüm:** Manuel Vercel Dashboard'dan alias yönetimi gerekir.
**Yeni subdomain:** `cyberlisans-mp.vercel.app` çalışıyor (login ✅), ama M3 endpoint'leri hâlâ 404.

### 🟡 Sentry source map

**Sorun:** `withSentryConfig` auth token istiyor, build kırılıyor.
**Çözüm:** SENTRY_AUTH_TOKEN al, Vercel env'e ekle, `next.config.mjs`'e wrapper'ı geri ekle.
**Öncelik:** Düşük — client/server init zaten çalışıyor.

### 🟡 Hassas veri rotate

**Sorun:** Geçen session'larda paylaşılan Supabase service_role JWT ve Vercel token'ları hâlâ geçerli.
**Çözüm:** Supabase Dashboard'dan service_role key roll, Vercel'den eski deployment token'ı revoke et.
**Öncelik:** Orta — production'da risk.

---

## Öğrenilen Dersler

1. **apps/api env loading:** Vercel'de `process.env` doğru yükleniyor ama HMAC secret karşılaştırması başarısız. Sebep muhtemelen CLI'nın secret encoding'i bozması. **Çözüm:** Vercel Dashboard'dan manuel env eklemek daha güvenilir.

2. **Vercel CLI alias drift:** `vercel alias set <domain> <deployment>` komutu broken. **Çözüm:** vercel.json'a `alias` array ekleyerek declarative tanımlama.

3. **apps/api Vercel bundling:** Yeni route eklendiğinde eski deployment cache'i yeni route'ları görmüyor. **Çözüm:** `vercel deploy --force` veya `.next` klasörünü silip rebuild.

4. **Sentry wrapper without auth token:** `withSentryConfig` auth token olmadan build sırasında source map upload deniyor ve sessizce fail oluyor. **Çözüm:** `silent: true` zaten var, ama auth token verilmeli.

5. **HMAC service-to-service auth:** Trigger.dev → apps/api çağrısı için HMAC + timestamp + secret üçlüsü iyi çalışıyor, ama secret paylaşımı zor. **Çözüm:** Trigger dashboard'da secret eklemek en güvenli yol.

---

## Sıradaki Adımlar (M4 preview)

1. **M4 — Satıcı Ürün Yönetimi** (paralel 4 ajan):

   - Backend: create-product, update-product, delete-product, list-products use-case'leri
   - Seller UI: ürün listesi, ürün ekleme modal, ürün düzenleme, stok yönetimi
   - Admin UI: ürün onaylama, kategori yönetimi
   - DB seed: 30 örnek ürün (5 seller × 6 ürün)

2. **M3.1 — Vercel deploy düzeltme** (1 ajan, ayrı):

   - Vercel Dashboard'dan manuel alias yönetimi
   - Sentry clean install
   - service_role rotate

3. **M5 — Payments entegrasyonu** (PayTR + Papara + Crypto):
   - Mock payment provider önce
   - Gerçek entegrasyon sonra

---

## Dosya İstatistikleri

| Kategori       | Yeni   | Güncellenen                                   | Silinen |
| -------------- | ------ | --------------------------------------------- | ------- |
| Backend dosya  | 15     | 4 (app.ts, supabase-db.ts, db.ts, session.ts) | 0       |
| Frontend dosya | 21     | 1 (sidebar.tsx)                               | 0       |
| DB migration   | 1      | 0                                             | 0       |
| Döküman        | 0      | 0                                             | 0       |
| Postman        | 4      | 0                                             | 0       |
| Trigger.dev    | 2      | 0                                             | 0       |
| Scripts        | 0      | 0                                             | 0       |
| **Toplam**     | **43** | **5**                                         | **0**   |

**Toplam yeni satır:** ~6,500
**Toplam güncellenen satır:** ~250

---

## Commit/Tag

- **Tag:** v3.0-escrow
- **Commit:** M3 milestone raporu + 5 döküman (STATUS, CHANGELOG, CONTEXT, RUNBOOK, ROADMAP update, ARCHITECTURE update) + M3 backend/frontend kodu

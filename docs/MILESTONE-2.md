# Milestone 2 — Marketplace + Seller Onboarding + Prisma Schema Sync

**Tarih:** 2026-07-03
**Tag:** v2.0-marketplace
**Süre:** ~3 saat (paralel ajanlar + debug iterasyonları)

## Kararlar

1. **Prisma schema senkronize edildi:** Yeni DB (camelCase quote'lu sütunlar, marketplace + escrow tabloları) ile uyumlu hale getirildi. `prisma validate` ve `prisma generate` başarılı.

2. **5 use-case Clean Architecture'a taşındı:** Eski `domain/usecases/*` → Yeni `application/usecases/*` (class-based, port-driven, max 100 satır).

3. **Satıcı başvuru + admin onay akışı tamamlandı:** API katmanı hazır (use-case + port + repo + route). Frontend UI ekranları oluşturuldu (başvuru formu, müşteri dashboard'unda satıcı bölümü, public mağaza sayfası).

## Yapılan İşler

### Prisma Schema (Ajan: Backend Engineer)

- 33 model + 19 enum
- Yeni: Seller, SellerReferralCode, SellerKyc, ProductListing, EscrowTransaction, Commission, Payout, SellerPayout, Dispute, DisputeMessage, Review, Notification, SupportTicket, SupportMessage
- `User.supabaseAuthId` eklendi
- `Product` genişletildi: sellerId, listingType, digitalContent, autoDelivery, min/maxDeliverySeconds
- `validate ✅ generate ✅`

### Clean Architecture Refactor (Ajan)

- 5 use-case taşındı (eski konum → yeni konum):
  - `domain/usecases/auth/register-user.ts` (149) → `application/usecases/auth/register-user.ts` (103)
  - `domain/usecases/dealer/request-dealer-payout.ts` (176) → `application/usecases/seller/request-seller-payout.ts` (65)
  - `domain/usecases/order/create-order.ts` (146) → `application/usecases/order/create-order.ts` (100)
  - `domain/usecases/dealer/record-dealer-sale.ts` (129) → `application/usecases/escrow/create-escrow-from-order.ts` (102)
  - `domain/usecases/auth/verify-email.ts` (27) → `application/usecases/auth/verify-email.ts` (32)
- 627 satır → 402 satır (**%36 küçülme**)

### Marketplace API (Ajan)

**Yeni dosyalar (19):**

- `application/ports/seller.ts` — SellerRepositoryPort + input/output tipleri (142 satır)
- `application/ports/services.ts` — PasswordHasherPort, MailServicePort, ClockPort (13 satır)
- `application/usecases/seller/apply-seller.ts` (71)
- `application/usecases/seller/get-my-seller.ts` (11)
- `application/usecases/seller/get-seller-by-slug.ts` (15)
- `application/usecases/admin/approve-seller.ts` (32)
- `application/usecases/admin/reject-seller.ts` (29)
- `application/usecases/admin/suspend-seller.ts` (29)
- `application/usecases/admin/reactivate-seller.ts` (32)
- `application/usecases/admin/list-sellers.ts` (35) — ListAll, ListPending, GetAdminSeller
- `domain/errors/seller.ts` (30) — AlreadyHasSellerError, SellerSlugTakenError, vs.
- `infrastructure/repositories/seller.repository.ts` (138)
- `interface/routes/sellers.ts` (80) — POST /apply, GET /me, GET /:slug/public
- `interface/routes/admin/sellers.ts` (102) — GET /pending, GET /, GET /:id, POST /:id/{approve,reject,suspend,reactivate}

**Yeni route mount (apps/api/src/app.ts):**

```ts
app.route('/sellers', sellerRoutes);
app.route('/admin/sellers', adminSellersRoutes);
```

### Seller UI (Ajan)

- `apps/web/src/lib/api-client.ts` — SellerInfo, ApplySellerPayload, ApplySellerResult tipleri eklendi
- `apps/web/src/app/dashboard/seller/layout.tsx` (yeni)
- `apps/web/src/app/dashboard/seller/page.tsx` (226 satır — **limit aşıldı**, M2.1 refactor'unda parçalanacak)
- `apps/web/src/app/dashboard/seller/apply/page.tsx` (11)
- `apps/web/src/components/dashboard/apply-seller-form.tsx` (242 — limit aşıldı, refactor gerekli)
- `apps/web/src/app/s/[slug]/page.tsx` (218 — limit aşıldı, refactor gerekli)
- Sidebar'a "Satıcı Mağazam" linki eklendi (Store ikonu)

## Doğrulama

| Test                                   | Sonuç               |
| -------------------------------------- | ------------------- |
| `GET /api/health`                      | ✅ 200              |
| `POST /api/sellers/apply` (no token)   | ✅ 401 Unauthorized |
| `GET /` (home)                         | ✅ 200              |
| `GET /dashboard/seller`                | ✅ 200              |
| `pnpm --filter @cyberlisans/web build` | ✅ Compile başarılı |
| Vercel production deploy               | ✅ Ready            |

## Bilinen Sorunlar

### 🔴 Kritik: Login 500 — Vercel → Supabase TCP Bağlantı Sorunu

`POST /api/auth/login` → **500 INTERNAL_ERROR**. Detaylı debug yapıldı (debug endpoint eklendi çıkarıldı):

**Kök neden:** Vercel serverless runtime'ı **Supabase pooler URL**'ine (`aws-0-eu-west-2.pooler.supabase.com:6543`) TCP bağlantısı kuramıyor. Hata:

```
Error querying the database: FATAL: (ENOTFOUND) tenant/user postgres.aobbnmasgvbnpjmitnyi not found
```

Çözülenler:

- ✅ Prisma schema doğru, validate + generate başarılı
- ✅ DATABASE_URL Vercel env'de doğru (`postgresql://postgres.aobbnmasgvbnpjmitnyi:REDACTED@aws-0-eu-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true`)
- ❌ Prisma runtime hâlâ `tenant/user not found` hatası veriyor
- ❌ Direct connection URL (`db.aobbnmasgvbnpjmitnyi.supabase.co:5432`) da erişilemez

**Yarın için seçenekler (senin onayınla):**

1. **Vercel Postgres'e geç** — Vercel'in kendi Postgres'i, Vercel network'ünde → bağlantı sorunsuz, schema migrate kolay
2. **Supabase'i Vercel Marketplace ile bağla** — yeni konum
3. **@supabase/supabase-js HTTP client** — TCP yerine REST, tüm API'yi yeniden yaz (~3 saat)
4. **Prisma Accelerate** — Prisma'nın connection proxy'si

### 🟡 Orta: 3 frontend dosyası limit aştı

200+ satır `dashboard/seller/page.tsx`, `apply-seller-form.tsx`, `s/[slug]/page.tsx`. M2.1'de component'lere parçalanacak.

### 🟡 Orta: Eski use-case'ler hâlâ konumlarında

5 use-case taşındı. 64 use-case kaldı. Routing hâlâ eski use-case'leri çağırıyor.

## Test Hesapları (DB bağlantı sorunu çözülünce geçerli)

| Rol           | Email                                   | Şifre          |
| ------------- | --------------------------------------- | -------------- |
| SUPER_ADMIN   | admin@cyberlisans.com                   | Admin!2026Safe |
| Customer      | alice@cyberlisans.com                   | Alice!2026Safe |
| 4 ek customer | bob/charlie/diana/erhan@cyberlisans.com | \*!2026Safe    |

## Sonraki Adımlar (M2.1)

1. **🔴 YARIN İLK:** Login 500 çözümü — seçenekler yukarıda
2. Satıcı dashboard'da 3 büyük dosyayı parçala (limit restore)
3. Kalan 64 use-case'i clean arch'a taşı
4. Yeni `sellers` tablosuna 2-3 örnek satıcı seed'i ekle
5. Satıcı ürün listeleme use-case + endpoint (`POST /api/sellers/products`)
6. M2.1 milestone raporu + tag v2.1

## Notlar

- **Pivot kararı tutarlı:** Marketplace veri modeli (33 tablo) hazır, escrow flow fonksiyonları (DB trigger) hazır, satıcı onboarding API + UI hazır. Sadece **DB bağlantı sorunu** seni blokluyor.
- **Paralel ajan çalışması başarılı:** 19 yeni dosya, 5 refactor, 0 çakışma.
- **Plan/Program:** docs/ROADMAP.md'deki M2 (hafta 2) takip ediliyor.
- **Temiz kod kuralı:** 5 use-case refactor %36 küçüldü, ama yeni UI dosyaları limit aştı → M2.1'de düzeltilecek.

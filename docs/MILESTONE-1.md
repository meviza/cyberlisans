# Milestone 1 — Clean Architecture + Tek Backend

**Tarih:** 2026-07-03
**Tag:** v1.0-clean-arch
**Süre:** ~3 saat (3 paralel ajan + koordinasyon)

## Kararlar

1. **Tek backend:** `apps/web/src/app/api/auth/*` orphan route'ları silindi. Tüm backend artık Hono (`apps/api`).
2. **Backend deploy stratejisi:** Hono, `apps/web/src/app/api/[...path]/route.ts` catch-all'i içinde Node runtime'da çalışıyor. Vercel ayrı proje deploy'u (workspace:\* protokolü yüzünden) iptal edildi, merge yöntemi tercih edildi.
3. **Clean Architecture başlangıcı:** Yeni klasör yapısı (domain → application → interface → infrastructure). İlk use-case (`login-user`) refactor edildi: 180 satır → 96 satır, sınıf tabanlı, port-driven.
4. **Marketplace + escrow veri modeli:** 11 yeni tablo + 27 RLS policy + 8 PL/pgSQL fonksiyon + trigger'lar.

## Yapılan İşler

### Backend & Deploy (Ajan 2)

- ✅ Hono `apps/web/src/app/api/[...path]/route.ts` catch-all içinde Node runtime'da
- ✅ `apps/api/src/app.ts` ayrıldı (sadece middleware + route mount), `index.ts` sadece dev server
- ✅ `apps/api/src/vercel-entry.ts` serverless adapter hazır (ayrı deploy için ileride kullanılabilir)
- ✅ `apps/api/vercel.json` ayrı deploy konfigürasyonu (gelecek için)
- ✅ `apps/web/src/lib/api-client.ts` artık tüm istekleri aynı-origin `/api/*` route'una gönderiyor
- ✅ `apps/web/next.config.mjs` → `transpilePackages` güncellendi (`@cyberlisans/api`, `@cyberlisans/payments`)
- ✅ Orphan `apps/web/src/app/api/auth/` silindi (8 route)
- ✅ `apps/web/src/app/api/admin/` ve `/dealer*` proxy'leri silindi (artık catch-all → Hono)
- ✅ Vercel production deploy başarılı: https://cyberlisans.vercel.app

### Database (Ajan 1)

- ✅ Migration 0003 — Marketplace core:
  - `sellers`, `seller_referral_codes`, `seller_kyc`
  - `product_listings`
  - `escrow_transactions`, `commissions`
  - `payouts`, `seller_payouts`
  - `disputes`, `dispute_messages`
  - `reviews`
- ✅ Migration 0004 — Escrow triggers:
  - `release_escrow`, `refund_escrow`, `request_payout`, `process_payout`
  - `commission_calculate`, `open_dispute`, `resolve_dispute`, `update_seller_rating`
- ✅ `products` tablosu genişletildi (sellerId, listingType, digitalContent, autoDelivery, vs.)
- ✅ 27 RLS politikası (müşteri/satıcı/admin yetki sınırları)
- ✅ 6 yeni ENUM (SellerStatus, KycStatus, ListingType, EscrowStatus, vs.)
- ✅ `auth_audit` RLS kapatıldı + admin-only policy eklendi (Ajan 1 uyarısı giderildi)

### Clean Architecture (Ajan 3)

- ✅ Master plan: `docs/CLEAN_ARCH_REFACTOR_PLAN.md` (~200 satır envanter + plan)
- ✅ Yeni klasör yapısı:
  ```
  src/domain/value-objects/
  src/application/usecases/{auth,seller,product,order,escrow,payout,review,dispute}/
  src/interface/schemas/
  src/infrastructure/services/
  ```
- ✅ `login-user.ts` refactor (180 → 96 satır), `LoginUserUseCase` sınıfı + port-driven DI

## Doğrulama

| Test                                 | Sonuç                                               |
| ------------------------------------ | --------------------------------------------------- |
| `GET /api/health`                    | ✅ 200, `{status: healthy}`                         |
| `POST /api/auth/register` (boş body) | ✅ 400 validation error                             |
| `GET /api/admin/products`            | ✅ 401 (auth guard çalışıyor)                       |
| Ana sayfa `/`                        | ✅ 200                                              |
| DB tablo sayısı                      | ✅ 36 tablo (22 orijinal + 11 marketplace + 3 view) |

## Bilinen Sorunlar (M2'de Çözülecek)

### 🔴 Kritik: Login Prisma Schema Uyumsuzluğu

`POST /api/auth/login` → 500. **Sebep:** `apps/api` Prisma schema'sı eski DB yapısını biliyor (camelCase sütunlar, `supabaseAuthId` yok, vs.). Yeni DB'de ben migration ile camelCase + ek kolonlar ekledim ama Prisma bunu generate etmedi.

**Çözüm (M2-D1):** `packages/db/prisma/schema.prisma` yeni DB'ye göre güncellenecek, `prisma db pull` ile otomatik generate edilecek. Veya tüm Prisma → Supabase client (raw SQL) geçişi düşünülebilir.

### 🟡 Orta: Satıcı kayıt akışı eksik

DB tabloları hazır ama başvuru formu, admin onay paneli, satıcı dashboard UI'ları yok.

### 🟡 Orta: Diğer use-case'ler hâlâ eski konumda

Sadece `login-user` refactor edildi. 69 use-case daha eski yerinde.

### 🟢 Düşük: Dealer\_\* tabloları seller'a migrate edilmedi

İki sistem paralel duruyor. Yeni satıcılar `sellers` tablosunu kullanacak, eski dealer kayıtları (varsa) migration ile taşınacak.

## Dosya Hareketleri Özeti

**Yeni dosyalar (20):**

- `apps/api/src/app.ts` — Hono app instance (middleware + routes)
- `apps/api/src/vercel-entry.ts` — Vercel serverless adapter
- `apps/api/vercel.json` — Vercel build config
- `apps/api/.vercelignore` — Deploy exclude
- `apps/api/src/application/ports/auth.ts` — Port interfaces (LoginOutput, vs.)
- `apps/api/src/application/usecases/auth/login-user.ts` — Refactor edilmiş use-case (96 satır)
- `apps/web/src/app/api/[...path]/route.ts` — Catch-all Node runtime Hono host
- `docs/ROADMAP.md`
- `docs/ARCHITECTURE.md`
- `docs/CLEAN_ARCH_REFACTOR_PLAN.md`

**Silinen dosyalar:**

- `apps/web/src/app/api/auth/` (8 route)
- `apps/web/src/app/api/admin/` (tüm proxy'ler)
- `apps/web/src/app/api/dealer/`
- `apps/web/src/app/api/dealer-public/`

**Değiştirilen dosyalar:**

- `apps/api/src/index.ts` — sadece dev server
- `apps/api/src/infrastructure/db.ts` — fix
- `apps/api/package.json` — exports map + build script
- `apps/web/src/lib/api-client.ts` — same-origin routing
- `apps/web/next.config.mjs` — transpilePackages
- `apps/web/package.json` — workspace deps
- `.vercelignore` — apps/api kaldırıldı

## Sonraki Adımlar (M2 — Marketplace + Prisma Sync)

1. **D1:** Prisma schema'yı yeni DB ile senkronize et (`prisma db pull`)
2. **D2:** `apps/api` use-case'lerini yeni `application/usecases/` konumuna taşı (refactor devam)
3. **D3:** Satıcı başvuru endpoint'i (`POST /api/sellers/apply`) + admin onay (`POST /api/admin/sellers/:id/approve`)
4. **D4:** Satıcı ürün listeleme endpoint'i (`POST /api/sellers/products`)
5. **D5:** Marketplace ürün listeleme (`GET /api/products?sellerId=...&categoryId=...`) + UI

## Test Hesapları (Hâlâ Geçerli)

| Rol         | Email                   | Şifre            |
| ----------- | ----------------------- | ---------------- |
| SUPER_ADMIN | admin@cyberlisans.com   | Admin!2026Safe   |
| Customer    | alice@cyberlisans.com   | Alice!2026Safe   |
| Customer    | bob@cyberlisans.com     | Bob!2026Safe     |
| Customer    | charlie@cyberlisans.com | Charlie!2026Safe |
| Customer    | diana@cyberlisans.com   | Diana!2026Safe   |
| Customer    | erhan@cyberlisans.com   | Erhan!2026Safe   |

## Notlar

- **Hono test hesapları çalışmıyor** (Prisma schema mismatch). Production'da login 500 dönüyor. **Yarın ilk iş bu sorunu çözmek.**
- DB seed verisi marketplace'e uygun değil (henüz `sellers` tablosunda satıcı yok). Test için satıcı seed'i eklenecek.
- `auth_audit` RLS kapandıktan sonra eski veriler görünmez — bu doğru, sadece admin görebilir.

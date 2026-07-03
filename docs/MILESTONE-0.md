# Milestone 0 — Pivot Kararı

**Tarih:** 2026-07-03
**Tag:** v0.0-pivot
**Süre:** ~1 saat (analiz)

## Kararlar

1. **Pivot:** CyberLisans artık sadece kendi ürünlerimizi sattığımız bir e-ticaret değil, onaylı 3rd-party satıcıların da ürün listeleyebildiği bir **dijital ürün marketplace**'idir (FunPay / Gamsgo modeli).

2. **Ödeme modeli:** Tam **escrow**. Müşteri para verir → platform escrow'da tutar → satıcı teslim eder → platform onay alır (7 gün veya müşteri onayı) → satıcıya para aktarır. Komisyon bu noktada kesilir.

3. **Kod mimarisi:** Tüm proje **Clean Architecture**'a refactor edilecek. Domain → Application → Interface → Infrastructure katmanları. Her TS dosyası max 200 satır (use-case max 100).

4. **Dokümantasyon:** Her milestone'da git commit + tag + bu rapor dosyaları.

5. **Backend:** Tek backend — Hono API Vercel Node serverless'e sarmalanacak. Duplicate `apps/web/src/app/api/auth/*` route'ları silinecek.

## Yapılan İşler

- ✅ Proje keşfi (2 cyberlisans klasörü: `/Users/keremcelik/Projects/cyberlisans` ana proje)
- ✅ DB schema kurulumu (22 tablo + audit + RLS + Auth hook + helper view'lar)
- ✅ Seed (6 user, 3 category, 8 brand, 12 product, 86 key)
- ✅ bcrypt hash'ler (test hesapları çalışır durumda)
- ✅ Vercel production deploy (cyberlisans.vercel.app)
- ✅ Marketplace DB migration planlandı

## Tespit Edilen Sorunlar

| Sorun                                                                               | Önem   | Çözüm                                                |
| ----------------------------------------------------------------------------------- | ------ | ---------------------------------------------------- |
| Duplicate backend: Next.js `apps/web/src/app/api/auth/*` + Hono `apps/api/src/auth` | Kritik | M1: Next.js auth route'ları sil, tek Hono            |
| Hono API Vercel'e deploy edilmemiş                                                  | Kritik | M1: vercel.json + serverless wrapper                 |
| `apps/web/admin` stub (sadece başlık döner)                                         | Yüksek | M5: Süper admin paneli ayrı app olarak geliştir      |
| `dealer_*` tabloları seller modeline uygun değil                                    | Orta   | M2: Yeni `sellers`, `marketplace_products` tabloları |
| Frontend misafir sepet/login tutarsızlığı                                           | Orta   | M6: UX düzeltme                                      |
| 500+ satır sayfalar                                                                 | Yüksek | M1 başlangıcı: refactor                              |

## Test Hesapları (M0 seed)

| Rol         | Email                                         | Şifre          |
| ----------- | --------------------------------------------- | -------------- |
| SUPER_ADMIN | admin@cyberlisans.com                         | Admin!2026Safe |
| Customer    | alice/bob/charlie/diana/erhan@cyberlisans.com | \*!2026Safe    |

## Sonraki Adımlar (M1)

1. `docs/ROADMAP.md`, `docs/ARCHITECTURE.md`, `docs/MILESTONE-0.md` commit
2. Marketplace DB migration (sellers, escrow, commission, payout tables)
3. Hono API'yi Vercel'e sarma
4. Orphan auth route'ları sil
5. API katmanını Clean Architecture'a refactor başlangıcı

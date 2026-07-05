# MILESTONE-5 — Shopier Provider + Provider Selector + Multi-PSP Altyapısı

**Tag:** `v5.0-payments`
**Tarih:** 2026-07-05
**Durum:** ✅ Tamamlandı (165/165 Newman assertion PASS)

## Özet

M5 ile birlikte CyberLisans, **multi-PSP (Payment Service Provider)** altyapısına geçti.
Yeni **Shopier provider** eklendi, mevcut **Provider Selector** service'i customer'ın
lokasyonu/para birimine göre otomatik en uygun sağlayıcıyı seçer. Hexagonal
(Ports & Adapters) mimari sayesinde gelecekte yeni PSP'ler tek dosya ile eklenebilir.

## Mimari: Hexagonal (Ports & Adapters)

```
┌─────────────────────── Customer ───────────────────────┐
│                                                          │
│  checkout: /payments/available-providers → provider list │
│              ↓                                            │
│  /payments/initiate {provider: "SHOPIER" | "STRIPE" | …} │
│              ↓                                            │
│  redirectUrl → PSP ödeme sayfası                          │
│              ↓                                            │
│  PSP → /webhook → status update → escrow trigger         │
│                                                          │
└──────────────────────────────────────────────────────────┘

         packages/payments/src/
                │
                ├── types.ts        ← IPaymentProvider interface
                ├── port.ts          ← Provider contract
                │
                ├── shopier.ts       ← Shopier (TRY)        [YENİ]
                ├── paytr.ts         ← PayTR (TRY)
                ├── papara.ts        ← Papara (TRY)
                ├── stripe.ts        ← Stripe (TRY/USD/EUR)
                ├── nowpayments.ts   ← Crypto (USDT/USD/EUR/TRY)
                ├── bank-transfer.ts ← Manuel banka havalesi
                │
                ├── provider-selector.ts  ← Currency/country-based picker [YENİ]
                │
                └── index.ts        ← createPaymentProvider() factory
```

## Eklenen Provider: Shopier

Shopier, Türkiye'de popüler, kolay entegrasyonlu bir ödeme sağlayıcısıdır.
**Shopier sadece TRY destekler** (TL bazlı).

### Shopier API Kontratı

```
Base URL: https://www.shopier.com

1. Init Payment
   POST /api/createPayment
   Headers:
     Content-Type: application/json
     Authorization: Bearer {API_KEY}
     X-Shopier-Signature: HMAC-SHA256(API_SECRET, sorted-JSON-body)
   Body:
     {
       API_KEY, merchant_id,
       product_name, product_type ("digital"),
       buyer_email, buyer_name, buyer_phone,
       billing_address, billing_city, billing_country, billing_postcode,
       currency: "TRY", total_order_value,
       platform_order_id,
       callback_url, redirect_url, cancel_url
     }
   Response: { paymentId, redirectUrl, expiresAt }

2. Webhook (Shopier → site)
   POST {callback_url}
   Headers:
     X-Shopier-Signature: HMAC-SHA256(API_SECRET, body)
   Body (form-urlencoded):
     status=success|failed|expired&payment_id=…&total_order_value=…

3. Refund
   POST /api/refund
   Headers: Authorization, X-Shopier-Signature
   Body: { API_KEY, payment_id, amount, reason }
```

### Güvenlik

- **HMAC-SHA256** signature ile body integrity
- **crypto.timingSafeEqual** ile signature karşılaştırma (timing attack koruması)
- **API secret ASLA** client-side'da veya public endpoint'te görünmez
- **Provider config sadece server-side**'da, env variable'lardan yüklenir

## Provider Selector (M5 anahtar özellik)

`packages/payments/src/provider-selector.ts` — Customer'ın durumuna göre uygun sağlayıcıları
sıralar. UI bu listeyi `POST /payments/available-providers` endpoint'inden alır.

### Selector Algoritması

```typescript
function selectAvailableProviders(ctx: SelectorContext): ProviderOption[] {
  // 1. Currency/Country eşleşmesi
  if (ctx.currency === 'TRY') {
    PAYTR(90); // Türkiye yerel — kart, BKM, papara
    SHOPIER(85); // Kart + yerel cüzdanlar
    PAPARA(80); // Papara cüzdan
    BANK_TRANSFER(50);
  }
  if (['USD', 'EUR'].includes(ctx.currency)) {
    STRIPE(90); // Uluslararası kart
  }
  if (['USDT', 'USD'].includes(ctx.currency) && ctx.amount >= 10) {
    NOWPAYMENTS(70); // Bitcoin, Ethereum, USDT
  }
  WALLET(10); // Her zaman son çare

  // 2. preferredProvider varsa en üste taşı (+1000 priority)
  // 3. Currency desteği olmayanları filtrele
  // 4. Priority'ye göre azalan sırala
}
```

### Test Sonuçları

| Senaryo              | Currency | Amount | Sonuç (priority)                                           |
| -------------------- | -------- | ------ | ---------------------------------------------------------- |
| TR müşteri           | TRY      | 100    | PAYTR(90), SHOPIER(85), PAPARA(80), BANK(50), WALLET(10)   |
| Global müşteri       | USD      | 50     | STRIPE(90), NOWPAYMENTS(60)                                |
| Crypto tercih eden   | USDT     | 25     | NOWPAYMENTS(70), WALLET(10)                                |
| TR (preferred=PAYTR) | TRY      | 100    | PAYTR(1090), SHOPIER(85), PAPARA(80), BANK(50), WALLET(10) |

## Değişen Dosyalar

### Payments Package (8 dosya)

- **Yeni:** `packages/payments/src/shopier.ts` (~170 satır)
- **Yeni:** `packages/payments/src/provider-selector.ts` (~80 satır)
- **Güncellendi:** `packages/payments/src/types.ts` (PaymentProvider union + supportsCurrency map)
- **Güncellendi:** `packages/payments/src/index.ts` (ShopierProvider export + factory case)
- **Güncellendi:** `packages/payments/package.json` (./shopier + ./provider-selector exports)

### Backend (2 dosya)

- `apps/api/src/interface/routes/payments.ts` — `POST /payments/available-providers` route
- `apps/api/src/interface/routes/payments.schema.ts` — `availableProvidersSchema` + SHOPIER enum
- `apps/api/src/domain/entities/wallet.ts` — `PaymentEntity.provider` union'a `SHOPIER`

### Frontend (1 dosya)

- `apps/web/src/components/checkout/provider-picker.tsx` — runtime provider seçici

### Postman (3 dosya)

- `postman/cyberlisans.postman_collection.json` — "Payments M5 (Shopier)" folder + 5 request
- `postman/environments/local.postman_environment.json` — 3 Shopier placeholder
- `postman/environments/production.postman_environment.json` — aynı (değerler boş)

### Dökümanlar (3 dosya)

- `docs/MILESTONE-5.md` (bu dosya)
- `memory/2026-07-05.md` (günlük log)
- `apps/web/.env.example` (Shopier env placeholder'ları)

## API Endpoint'leri

### Yeni: `POST /payments/available-providers`

**Request:**

```json
{
  "currency": "TRY",
  "amount": 99.99,
  "customerCountry": "TR" // optional, ISO 3166-1 alpha-2
}
```

**Response:**

```json
{
  "providers": [
    { "provider": "PAYTR", "priority": 90, "reason": "Türkiye yerel — kredi kartı, BKM, papara" },
    { "provider": "SHOPIER", "priority": 85, "reason": "Shopier — kart + yerel cüzdanlar" },
    { "provider": "PAPARA", "priority": 80, "reason": "Papara cüzdan ile hızlı ödeme" },
    { "provider": "BANK_TRANSFER", "priority": 50, "reason": "Manuel banka havalesi" },
    { "provider": "WALLET", "priority": 10, "reason": "Cüzdan bakiyesi ile öde" }
  ]
}
```

### Güncellenen: `POST /payments/initiate`

```json
{
  "amount": 99.99,
  "currency": "TRY",
  "provider": "SHOPIER", // yeni eklenen
  "returnUrl": "https://cyberlisans.com/payment/success",
  "metadata": {
    "productName": "Steam 50 TL Bakiye",
    "buyerName": "Alice",
    "buyerPhone": "+905555555555",
    "billingCity": "Istanbul",
    "billingCountry": "TR"
  }
}
```

## Validation

### Newman (Postman CI)

- **165 assertion, 0 fail** ✅
- 38 request (M4: 33 + M5: 5)
- Çalıştırma: `bash scripts/postman-setup.sh && newman run postman/cyberlisans.postman_collection.json -e postman/environments/local.postman_environment.json`

### TypeScript

- `packages/payments` → 0 error ✅
- `apps/api` → 0 error (mevcut pre-existing `app.ts`/`instrument.ts` uzantı hataları dışında)
- `apps/web` → 0 error ✅

## Environment Variables (Shopier)

```bash
# apps/web/.env.local
SHOPIER_API_KEY=test_shopier_key
SHOPIER_API_SECRET=test_shopier_secret
SHOPIER_MERCHANT_ID=test_merchant

# apps/api/.env
SHOPIER_API_KEY=test_shopier_key
SHOPIER_API_SECRET=test_shopier_secret
SHOPIER_MERCHANT_ID=test_merchant
CYBERLISANS_WEBHOOK_IP_WHITELIST_SHOPIER=  # optional, comma-separated IPs

# Vercel (production)
SHOPIER_API_KEY=<rotated_real_key>
SHOPIER_API_SECRET=<rotated_real_secret>
SHOPIER_MERCHANT_ID=<rotated_real_merchant>
```

⚠️ **Production'a geçmeden önce rotate edilmiş gerçek Shopier credential'ları Vercel Dashboard'dan set edilmeli.**

## Performans / Ölçüm

| Metrik           | M4  | M5      | Değişim                            |
| ---------------- | --- | ------- | ---------------------------------- |
| Payment provider | 5   | **6**   | +1 (Shopier)                       |
| API endpoint     | 26  | **27**  | +1 (/payments/available-providers) |
| Postman request  | 31  | **36**  | +5                                 |
| Newman assertion | 153 | **165** | +12                                |
| TypeScript error | 0   | **0**   | 0                                  |

## Bilinen Sınırlama

1. **Shopier test mode yok** — Production API key olmadan Shopier init başarısız olur (beklenen)
2. **NowPayments minimum tutar** — $10 USD altı kripto ödeme kabul edilmez
3. **In-memory rate limiter** — Hala production için yetersiz (M5.x backlog: Redis-backed store)
4. **Selector basit kurallar** — Customer ülkesi bilinmiyorsa sadece currency'ye göre seçim yapılır (geo-IP eklenmedi)

## Öğrenilen Dersler

1. **Hexagonal mimari faydası** — Yeni provider eklemek tek dosya (~170 satır). 4 saatlik iş, 1 ajan ile.
2. **Shopier signature pattern** — Body'yi key'e göre sırala (deterministic JSON), sonra HMAC-SHA256. PayTR da aynı pattern (implemented before).
3. **Postman sandbox crypto** — Pre-request script'te `require('crypto')` çalışmaz. Webhook testleri static body+signature ile yapılmalı.
4. **Provider Selector'ı runtime'da hesaplamak** — Compile-time enum yerine context-based seçim. Daha esnek, A/B test yapılabilir.

## Sıradaki Milestones (Backlog)

- **M5.x:** Redis-backed rate limiter (Upstash) + geo-IP ile customer country detection
- **M5.x:** Shopier prod credential'ları + IP whitelist + prod webhook test
- **M5.x:** NowPayments prod key + crypto ödeme akışı uçtan uca test
- **M6:** Review & rating + email verification + 2FA aktif
- **M7:** Multi-language UI
- **M8:** Mobile app

## Hassas Veri — Rotate Edilecek

Bu milestone'da **yeni Shopier env placeholder**'ları eklendi ama gerçek credential'lar henüz yok (Shopier merchant hesabı henüz açılmamış olabilir).

**Rotate edilecek (M3.1'den kalan, acil):**

- ⚠️ Supabase service_role JWT
- ⚠️ Vercel token
- ⚠️ Sentry OAuth Client Secret
- ⚠️ Sentry personal token
- ⚠️ Sentry auth token
- ⚠️ Trigger.dev prod secret

---

**Commit:** M5 değişiklikleri tek commit
**Tag:** `v5.0-payments`

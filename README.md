# CyberLisans

Cyberpunk temali dijital lisans satis platformu. Oyun key'leri, yazilim lisanslari ve AI API kredileri icin **tam escrow akisli** P2P marketplace. FunPay/Gamsgo modeli, Turkiye pazari.

---

## Hizli Bakis

|            |                                                 |
| ---------- | ----------------------------------------------- |
| **Domain** | https://cyberlisans-mp.vercel.app               |
| **Repo**   | github.com/meviza/cyberlisans                   |
| **Stack**  | Next.js 15, Hono, Supabase, Trigger.dev, Vercel |
| **Mimari** | Clean Architecture monorepo (Turborepo + pnpm)  |
| **Dil**    | TypeScript strict (her yerde)                   |
| **UI**     | TR locale, shadcn/ui, Tailwind                  |
| **Test**   | Postman/Newman + Vitest unit + TestSprite E2E   |

---

## Icerik Haritasi

Yeni bir AI agent veya gelistiriciysen okuma sirasi:

1. **[docs/STATUS.md](docs/STATUS.md)** — Projenin tek-sayfa ozeti (30 saniyede baglam kur).
2. **[docs/CONTEXT.md](docs/CONTEXT.md)** — Tam baglam: mimari kararlar, hassas veri politikasi, AI calisma akisi.
3. **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** — Clean Architecture katman detaylari, use-case/repository pattern.
4. **[docs/CHANGELOG.md](docs/CHANGELOG.md)** — Surum gecmisi (M0 -> M5.1 -> pre-launch).
5. **[docs/MILESTONE-\*.md](docs/)** — Her milestone'in detayli raporu.
6. **[docs/RUNBOOK.md](docs/RUNBOOK.md)** — Operasyonel playbook (incident, deploy, debug).
7. **[docs/ROADMAP.md](docs/ROADMAP.md)** — Onceki ve sonraki isler.
8. **[memory/YYYY-MM-DD.md](memory/)** — Gunluk ham calisma logu.

---

## Mimari Ozeti

```
                   Vercel Edge / CDN
                          |
        +-----------------+------------------+
        |                                    |
   apps/web (Next.js 15)              apps/api (Hono)
   App Router, RSC, ISR         Clean Architecture
        |                                    |
        |   Server Components                |   supabase-js
        |   /api/[...path]                   |   (HTTP PostgREST)
        +-----------------+------------------+
                          |
                   Supabase (PostgreSQL)
                   RLS + Vault (AES-256)
                          |
                   Trigger.dev (cron jobs)
```

### Monorepo Yapisi

```
cyberlisans/
+- apps/
|  +- web/             Next.js 15 storefront (App Router, RSC, ISR)
|  +- api/             Hono REST API (Clean Architecture)
+- packages/
|  +- auth/            JWT + bcrypt + HMAC
|  +- db/              Prisma schema (legacy, artik kullanilmiyor)
|  +- payments/        Payment abstraction (Shopier + Papara + Crypto)
|  +- types/           Paylasilan TypeScript tipleri
|  +- ui/              Paylasilan React bilesenleri (shadcn/ui bazli)
|  +- validators/      Zod semalari
|  +- 3d/              Three.js sahneleri
|  +- i18n/            Ceviri paketi
|  +- config/          Paylasilmis TS config'leri
+- supabase/
|  +- migrations/      SQL migration'lari (0001 -> 0021)
+- src/trigger/        Trigger.dev gorevleri (escrow release cron)
+- postman/            API collection + environment'lar
+- docs/               Tum dokumanlar (bkz. yukaridaki harita)
+- memory/             Gunluk calisma loglari
+- .github/workflows/  CI (api-tests.yml)
```

### Clean Architecture (apps/api/src/)

```
domain/                  Framework bagimsiz (User, Order, Escrow, Payout)
+- entities/             Is kurallari + dogrulama
+- errors/               AuthError, EscrowNotFound, vs.
+- security/             Brute-force, JWT imzalama

application/             Framework bagimsiz
+- ports/                IUserRepository, ISellerRepository (interface)
+- usecases/             Login, Register, CreateOrder, ReleaseEscrow (max 100 satir)

interface/               Hono'ya ozel
+- routes/               auth.ts, sellers.ts, escrow.ts (max 200 satir)
+- middleware/           CORS, security, rate-limit, error-handler
+- dto/                  Zod validation semalari

infrastructure/          Dis dunyaya bagimli
+- db.ts                 supabase-js alias
+- supabase-db.ts        PostgREST HTTP istemcisi
+- repositories/         user, seller, product, order, payment, audit, escrow, payout, dispute
```

### Veritabani (Supabase PostgreSQL)

36 tablo, 18+ RLS policy, 8 PL/pgSQL fonksiyon. CamelCase kolon adlari PostgREST icin optimize. Detayli sema: docs/ARCHITECTURE.md Bolum 5.

Onemli tablolar:

- **Core:** users, sessions, user_two_factors, consents
- **Wallet/Payment:** wallets, wallet_transactions, payments
- **Catalog:** categories, brands, products, product_keys, product_listings
- **Marketplace:** sellers, seller_kyc, seller_referral_codes, reviews
- **Escrow/Payout:** orders, order_items, escrow_transactions, commissions, seller_payouts, disputes, dispute_messages
- **Audit:** audit_logs

---

## Hizli Baslangic

### Gereksinimler

- Node.js 20+
- pnpm 10+ (`npm i -g pnpm`)
- Supabase CLI (`brew install supabase/tap/supabase`)
- cloudflared (lokal tunnel test icin, opsiyonel)

### Kurulum

```bash
git clone https://github.com/meviza/cyberlisans.git
cd cyberlisans
pnpm install
cp .env.example .env
cp .env.local.example .env.local  # opsiyonel: lokal Supabase baglantilari
pnpm dev
```

Bu komut apps/web (port 3000), apps/api (port 3001) ve Trigger dev'i (port 8080) paralel baslatir.

### Dogrulama

```bash
curl http://localhost:3001/api/health
# {"status":"ok",...}

curl http://localhost:3000
# HTML doner
```

### Seed Kullanicilari (lokal gelistirme)

| Email                   | Password         | Rol                         | Notlar                |
| ----------------------- | ---------------- | --------------------------- | --------------------- |
| admin@cyberlisans.com   | Admin!2026Safe   | ADMIN                       | Yonetici paneli       |
| erhan@cyberlisans.com   | Erhan!2026Safe   | SUPER_ADMIN                 | Tam sistem erisimi    |
| alice@cyberlisans.com   | Alice!2026Safe   | CUSTOMER + SELLER           | En zengin test verisi |
| bob@cyberlisans.com     | Bob!2026Safe     | CUSTOMER + SELLER           | %10 komisyon          |
| charlie@cyberlisans.com | Charlie!2026Safe | CUSTOMER + SELLER (PENDING) | KYC onayi bekliyor    |
| diana@cyberlisans.com   | Diana!2026Safe   | CUSTOMER                    | Saf alici             |

UYARI: Bu sifreler sadece lokal gelistirme icindir. Production ortaminda farkli guclu sifreler kullanilir.

---

## Gelistirme Komutlari

| Komut              | Aciklama                        |
| ------------------ | ------------------------------- |
| `pnpm dev`         | Tum uygulamalari paralel baslat |
| `pnpm build`       | Tum paketleri build et          |
| `pnpm lint`        | ESLint calistir (web + api)     |
| `pnpm typecheck`   | TypeScript strict kontrolu      |
| `pnpm test`        | Vitest unit testleri            |
| `pnpm clean`       | Build ciktilari temizle         |
| `pnpm format`      | Prettier ile formatla           |
| `pnpm trigger:dev` | Trigger.dev lokal dev sunucusu  |

### Belirli Paketlerle Calisma

```bash
pnpm --filter @cyberlisans/web dev          # Sadece storefront
pnpm --filter @cyberlisans/api dev          # Sadece API
pnpm --filter @cyberlisans/web test         # Sadece web testleri
pnpm --filter @cyberlisans/api typecheck    # Sadece API tsc
```

### DB Islemleri

```bash
# Migration durumu (Supabase Dashboard'dan daha detayli)
supabase migration list

# Yeni migration olustur
supabase migration new 0022_xxx

# Lokal migration'lari remote'a push (Supabase baglanti gerekir)
supabase db push

# Manuel SQL Editor talimatlari icin: SETUP_DB.md
```

---

## Test

### Unit Testler (Vitest)

```bash
pnpm --filter @cyberlisans/web test
# 18/18 PASS -- categories, product-filters, products-fetcher
```

### API Testleri (Postman/Newman)

```bash
npx newman run postman/cyberlisans.postman_collection.json \
  -e postman/environments/local.postman_environment.json
```

21 endpoint, 6 klasor, 105+ assertion. CI: `.github/workflows/api-tests.yml`.

### E2E Testler (TestSprite)

Opsiyonel, bulut tabanli tarayici otomasyonu. Konfigurasyon: `.testsprite/config.json`. Detay: `docs/RUNBOOK.md`.

### TypeScript / Lint

```bash
pnpm typecheck    # her iki app'te 0 hata
pnpm lint         # web'te 0 hata, 4 on-uyari
```

---

## Deploy

| Ortam      | URL                               | Tetikleyici                              |
| ---------- | --------------------------------- | ---------------------------------------- |
| Production | https://cyberlisans-mp.vercel.app | `main` branch push -> Vercel auto-deploy |
| Preview    | per-PR URL                        | PR acildiginda Vercel otomatik           |

### Vercel

`vercel.json` monorepo icin konfigureli (Turbo filter, fra1 region, security header'lari). Asagidaki env variable'lar Vercel Dashboard'da olmali:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (veya `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
- `NEXT_PUBLIC_API_URL` (Hono API base)
- `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_AUTH_TOKEN`
- Tum `SECRET_*` env'leri (Supabase Vault fallback)

Detay: `docs/OPERATIONS.md` ve `apps/web/VERCEL_SETUP.md`.

### Trigger.dev

Escrow release cron gorevleri. Dashboard: cloud.trigger.dev -> proj_sibrytqjplnlnkvxwfve. Deploy:

```bash
TRIGGER_SECRET_KEY=... pnpm trigger:deploy
```

### Supabase

Migration'lar `supabase/migrations/` altinda. Apply icin iki yol:

1. **Otomatik:** `supabase db push` (CLI, Supabase baglanti gerekir)
2. **Manuel:** Supabase Dashboard -> SQL Editor -> her migration dosyasini sirayla calistir. Detayli talimatlar: `SETUP_DB.md`.

---

## AI Agent'lar Icin

Bu repo AI-friendly tasarlandi. Yeni bir oturumda once su dosyalari oku:

1. `docs/STATUS.md` — nerede oldugumuzu anla
2. `docs/CONTEXT.md` — kurallar ve kararlar (hassas veri politikasi dahil)
3. `memory/<bugun>.md` ve `memory/<dun>.md` — yakin gecmis

Sonra `todowrite` ile todo listesi olustur ve calis. Milestone bitince:

- `docs/MILESTONE-<isim>.md` yaz (ne, neden, nasil, sonuclar)
- `docs/STATUS.md` ve `docs/CHANGELOG.md` guncelle
- `git commit` + tag

UYARI: Hassas veri politikasi (CONTEXT.md Bolum 8): Sifre, JWT, service-role key, OAuth secret **asla** loglama, dosyaya yazma veya echo etme. Seed sifreleri public repo dokumanlarinda olabilir (kullanici onayli), ama production secret'lari kesinlikle paylasma.

---

## Surum Gecmisi

| Tag                    | Milestone                             | Tarih      |
| ---------------------- | ------------------------------------- | ---------- |
| `v5.1-secret-store`    | Supabase Vault + rotation             | 2026-07-05 |
| `v5.0-payments`        | Shopier + provider selector           | 2026-07-04 |
| `v4.0-seller-products` | Satici urun CRUD + admin onay         | 2026-07-04 |
| `v3.0-escrow`          | Tam escrow + payout + dispute         | 2026-07-03 |
| `v2.1-supabase-rest`   | Prisma -> supabase-js gecis           | 2026-07-02 |
| `v2.0-marketplace`     | Seller onboarding + public storefront | 2026-07-01 |
| `v1.0-clean-arch`      | Clean Architecture + Hono backend     | 2026-06-28 |

Detayli degisiklikler: [docs/CHANGELOG.md](docs/CHANGELOG.md).

---

## Lisans

Ozel lisans — sahibi Meviza. Tum haklari saklidir. Detay: `LICENSE` (yoksa user'a sor).

---

## Iletisim

- **GitHub:** github.com/meviza/cyberlisans
- **Vercel:** mevizas-projects team, cyberlisans project
- **Supabase:** project ref `aobbnmasgvbnpjmitnyi`
- **Trigger.dev:** project ref `proj_sibrytqjplnlnkvxwfve`
- **Sentry:** meviza org, cyberlisans project

API test icin Postman workspace'i user'a ait.

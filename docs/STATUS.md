# CyberLisans — Proje Durumu (Status)

> **Bu dosya her oturum başında okunacak tek sayfa özettir.**
> Yeni AI agent veya ekip üyesi bu dosyayı okuyarak projeye 30 saniyede bağlam kurabilir.

**Son güncelleme:** 2026-07-05 22:50
**Mevcut milestone:** M5.1 (Supabase Vault) tamamlandı, M6 planlanıyor
**Production:** https://cyberlisans-mp.vercel.app (Vercel alias sorunu M3.1'de çözülecek)

---

## 🏁 Tek Cümlede

Cyberlisans, **Clean Architecture monorepo** olarak geliştirilen, **Supabase REST + PostgREST** ile Vercel'de host edilen, **Trigger.dev** ile zamanlanmış işleri yönetilen, **Postman/Newman CI** ile test edilen, **3 rol (CUSTOMER/SELLER/ADMIN)** ile çalışan, **tam escrow akışlı** dijital ürün marketplace'idir.

---

## 📊 Milestone İlerlemesi

| Milestone | Açıklama                                                           | Durum         | Tag                      |
| --------- | ------------------------------------------------------------------ | ------------- | ------------------------ |
| **M0**    | Marketplace pivot kararı, mevcut state analizi                     | ✅ Tamamlandı | —                        |
| **M1**    | Clean Architecture başlangıç, auth/login refactor                  | ✅ Tamamlandı | v1.0-clean-arch          |
| **M2**    | Marketplace schema + seller profile + public storefront            | ✅ Tamamlandı | v2.0-marketplace         |
| **M2.1**  | Prisma → Supabase REST migration, production login                 | ✅ Tamamlandı | v2.1-supabase-rest       |
| **M3**    | Escrow + payout + dispute tam akış                                 | ✅ Tamamlandı | **v3.0-escrow**          |
| **M3.1**  | Vercel alias düzeltme + Sentry clean install + rotate              | 🔴 Blocker    | —                        |
| **M4**    | Satıcı ürün yönetimi (CRUD + admin onay) + M4.1 security hardening | ✅ Tamamlandı | **v4.0-seller-products** |
| **M5**    | Shopier provider + provider selector + multi-PSP altyapı           | ✅ Tamamlandı | **v5.0-payments**        |
| **M5.1**  | Supabase Vault (AES-256 encrypted secret store) + rotation tools   | ✅ Tamamlandı | **v5.1-secret-store**    |
| **M6**    | Review/rating + email verification + 2FA aktif                     | ⚪ Plan       | v6.0-trust               |
| **M7**    | SEO + multi-language + landing page                                | ⚪ Plan       | v7.0-growth              |
| **M8**    | Beta launch + analytics + A/B test                                 | ⚪ Plan       | v8.0-launch              |

---

## 🏗 Mimari Özet

```
apps/web (Next.js 15) ──→ apps/api (Hono) ──→ Supabase (PostgREST)
       ↓                          ↓                    ↓
   static + SSR              Clean Architecture      PostgreSQL
   client UI                 use-case + ports        RLS policies
                             repository impl         8 PL/pgSQL fn
```

**Clean Architecture katmanları:**

- `apps/api/src/domain/` — entity, error, value object (framework bağımsız)
- `apps/api/src/application/` — use-case + port interface (framework bağımsız)
- `apps/api/src/interface/` — HTTP route + middleware + DTO (Hono'ya özel)
- `apps/api/src/infrastructure/` — repository impl + DB + external service

**Dosya limitleri:** use-case max 100 satır, route max 200, component max 200.

---

## 🔗 Entegrasyonlar

| Servis          | Amaç                 | Durum          | Erişim                                                   |
| --------------- | -------------------- | -------------- | -------------------------------------------------------- |
| **Supabase**    | DB + Auth + Storage  | ✅ Çalışıyor   | project `aobbnmasgvbnpjmitnyi`, REST API                 |
| **Vercel**      | Hosting + CDN        | ⚠️ Alias drift | project `prj_UJlBBLXtEra8Y6TsOUh5XPxpeEsu` (cyberlisans) |
| **Trigger.dev** | Cron + scheduled job | ✅ Çalışıyor   | project `proj_sibrytqjplnlnkvxwfve` (Cyberlisans)        |
| **Postman**     | API test + CI        | ✅ Çalışıyor   | workspace (user-owned)                                   |
| **Sentry**      | Error monitoring     | ⚠️ Kısmen      | project `cyberlisans` (org: meviza)                      |
| **PayTR**       | Ödeme                | ⏳ Mock        | —                                                        |
| **Papara**      | Ödeme                | ⏳ Mock        | —                                                        |
| **Crypto**      | Ödeme                | ⏳ Mock        | —                                                        |

---

## 👤 Roller

| Rol             | Erişim                                             | Sayı                         |
| --------------- | -------------------------------------------------- | ---------------------------- |
| **CUSTOMER**    | Browse, purchase, dispute, payout request (kendi)  | 5 seed                       |
| **SELLER**      | + sell products, manage balance, request payout    | 3 seed (Alice, Bob, Charlie) |
| **ADMIN**       | + approve sellers, resolve disputes, view all data | 1 seed                       |
| **SUPER_ADMIN** | + manage admins, system config                     | 1 seed                       |

**Test kullanıcıları:**

- `admin@cyberlisans.com / Admin!2026Safe`
- `alice@cyberlisans.com / Alice!2026Safe` (SELLER + CUSTOMER)
- `bob/charlie/diana/erhan@cyberlisans.com / *!2026Safe`

---

## 🔄 Ana Akışlar

### 1. Müşteri Satın Alma

```
Browse → Product Detail → Checkout (POST /api/orders)
   ↓
Order oluşur → Escrow oluşur (HELD, 7d) → Key müşteriye gösterilir
```

### 2. Escrow Release

```
7 gün otomatik (Trigger.dev 03:00 her gün)
   ↓
auto_release_escrow() → seller.balance += sellerAmount
   ↓
Commission kaydı oluşur
```

### 3. Dispute

```
Müşteri itiraz açar (POST /api/disputes) → escrow = DISPUTED
   ↓
Admin çözer: REFUND / RELEASE / PARTIAL
```

### 4. Payout

```
Satıcı payout talep eder (POST /api/payouts) → PENDING
   ↓
Admin onaylar (POST /api/admin/escrow/payouts/:id/approve)
   ↓
Bank transfer + status = COMPLETED
```

---

## 📁 Repo Yapısı

```
cyberlisans/
├── apps/
│   ├── api/            # Hono API + Clean Architecture
│   ├── web/            # Next.js 15 frontend
│   └── ... (admin, dealer kaldırıldı)
├── packages/
│   ├── auth/           # JWT + bcrypt
│   ├── db/             # Prisma schema (artık kullanılmıyor, supabase-js kullanılıyor)
│   ├── payments/       # Payment abstraction (mock)
│   ├── types/          # Shared TS types
│   ├── ui/             # Shared React components
│   └── validators/     # Zod schemas
├── supabase/
│   └── migrations/     # 0001_initial, 0002, 0003_marketplace, 0004_escrow_triggers, 0005_escrow_auto_release
├── src/trigger/        # Trigger.dev tasks (release-escrow)
├── trigger.config.ts   # Trigger.dev config
├── postman/            # API collection + environments
├── docs/               # TÜM DÖKÜMANLAR
│   ├── STATUS.md       # ← BU DOSYA
│   ├── ROADMAP.md
│   ├── ARCHITECTURE.md
│   ├── CHANGELOG.md
│   ├── CONTEXT.md      # AI agent'lar için
│   ├── RUNBOOK.md      # Operasyon rehberi
│   ├── MILESTONE-*.md  # Her milestone raporu
│   ├── OPERATIONS.md   # Eski operasyon
│   └── CLEAN_ARCH_REFACTOR_PLAN.md
├── memory/             # Günlük ham log (YYYY-MM-DD.md)
├── scripts/            # Helper scripts
└── .github/workflows/  # CI (api-tests.yml)
```

---

## 🚦 Hızlı Komutlar

### Local geliştirme

```bash
# Backend
cd apps/api && npx tsx src/index.ts  # port 3001

# Frontend
cd apps/web && pnpm dev              # port 3000

# Veya her ikisi (ayrı terminaller)
```

### Test

```bash
# API test (Postman + Newman)
npx newman run postman/cyberlisans.postman_collection.json \
  -e postman/environments/production.postman_environment.json

# Typecheck
pnpm --filter @cyberlisans/api typecheck
pnpm --filter @cyberlisans/web typecheck

# Build
pnpm --filter @cyberlisans/web build
```

### Deploy (M3.1'den sonra çalışacak)

```bash
# Vercel
vercel link --yes && vercel deploy --prod --yes

# Trigger.dev
TRIGGER_SECRET_KEY=... npx trigger.dev@latest deploy

# DB migration
supabase db push  # veya Supabase Dashboard'dan
```

### Debug

```bash
# Production health
curl https://cyberlisans-mp.vercel.app/api/health

# Production login
curl -X POST https://cyberlisans-mp.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@cyberlisans.com","password":"Alice!2026Safe"}'

# Trigger.dev manual run
# cloud.trigger.dev → Cyberlisans → release-escrow → Run now

# Sentry errors
# sentry.io → meviza/cyberlisans → Issues
```

---

## 🔴 Aktif Blocker'lar

| ID     | Blocker                                                   | Çözüm                                                        | Sahibi            |
| ------ | --------------------------------------------------------- | ------------------------------------------------------------ | ----------------- |
| M3.1-1 | Vercel alias drift (cyberlisans.vercel.app başka projede) | Manuel alias at veya yeni domain al                          | user              |
| M3.1-2 | Sentry source map upload (auth token yok)                 | SENTRY_AUTH_TOKEN al, Vercel env'e ekle                      | user              |
| M3.1-3 | Supabase service_role rotate edilmedi                     | Dashboard'dan roll, env güncelle                             | user              |
| M3.1-4 | Trigger dashboard'da secret eşleşmedi                     | API_URL + INTERNAL_SERVICE_SECRET'i Trigger dashboard'a ekle | user              |
| M3.1-5 | Vercel CLI broken (alias komutu deployment not found)     | vercel.json alias array kullan                               | done (workaround) |

---

## 📞 İletişim & Erişim

- **Repo:** github.com/meviza/cyberlisans (public)
- **Vercel:** mevizas-projects team
- **Supabase:** aobbnmasgvbnpjmitnyi project
- **Trigger.dev:** proj_sibrytqjplnlnkvxwfve (Cyberlisans)
- **Sentry:** meviza/cyberlisans project
- **Postman:** workspace (user-owned)

---

## 🎯 Sonraki Adımlar (M5.1)

**M5.1 (tamamlandı):**

- Supabase Vault (AES-256, pgcrypto)
- secret-store.ts runtime loader (env → Vault fallback, 60s cache)
- rotate-secret.ts CLI + vercel-env-update.sh scripts
- Admin secrets CRUD endpoints (auth + requireAdmin)
- 4 ardışık rotation test PASS

**Kullanıcı aksiyonu bekleniyor:**

- 6 hassas token'ı Dashboard'lardan rotate et
- `tsx scripts/rotate-secret.ts <name>` ile Vault'a yaz
- `bash scripts/vercel-env-update.sh <NAME> "<value>"` ile Vercel push

**M5.1.1 (sıradaki):**

- 0006-0011 diskte yok, reverse-engineer gerek (M4.1 hardening)
- Bu ayrı milestone, information_schema'dan SQL çıkarılacak

**M6 (planlanıyor):**

- Review/rating system (buyer → seller + seller → buyer)
- Email verification (SMTP provider entegrasyonu)
- 2FA aktif (TOTP) — schema zaten var, route eksik

---

**Bu dosyayı güncellemek için:** milestone tamamlandığında status, blocker ve next steps bölümlerini düzenle.

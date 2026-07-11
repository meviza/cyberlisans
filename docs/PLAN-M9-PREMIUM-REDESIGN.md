# M9 — Premium Redesign + Architecture Hardening Plan

> **Tarih:** 2026-07-11  
> **Durum:** Phase 1–3 in progress (shell + landing + tokens)  
> **Amaç:** CyberLisans’ı GamsGo modelinde, sade-premium-kurumsal, 3D landing + 3 dashboard ile production-ready kaliteye yükseltmek.

### İlerleme (2026-07-11)

| Phase             | Durum    | Not                                                |
| ----------------- | -------- | -------------------------------------------------- |
| 0 MCP + erişim    | ⚠️ Kısmi | GitHub ✅ Vercel ✅ Supabase CLI yanlış org        |
| 1 Design system   | ✅       | Tokens, Button/Badge/Card/Input, globals           |
| 2 Landing         | ✅       | Hero 3D lazy, trust strip, sections sadeleştirildi |
| 3 Dashboard       | ✅ Kısmi | AppShell 3 rol, mobile nav, admin route redirects  |
| 4 Backend cleanup | ⚪       |                                                    |
| 5 DB/perf         | ⚪       | Supabase link sonrası                              |
| 6 QA              | ⚪       | web vitest 18/18 geçti                             |

---

## 1. Mevcut Durum Özeti

### 1.1 Ürün

CyberLisans = Türkiye pazarı için **dijital ürün marketplace** (oyun key, yazılım lisansı, AI kredisi).  
FunPay / GamsGo modeli: escrow, komisyon, satıcı onayı, dispute.

| Rol                     | Ne yapar                                           | UI konumu (bugün)                                     |
| ----------------------- | -------------------------------------------------- | ----------------------------------------------------- |
| **CUSTOMER**            | Browse, sepet, ödeme, sipariş, cüzdan, dispute     | `/dashboard/*`                                        |
| **SELLER**              | Ürün CRUD, stok/key, payout, satış özeti           | `/dashboard/seller/*`                                 |
| **ADMIN / SUPER_ADMIN** | Satıcı KYC, ürün onayı, escrow, dispute, kullanıcı | `/admin/*` + `/dashboard/admin/*` (çift yol, dağınık) |

Production: https://cyberlisans-mp.vercel.app — health `200` / `healthy` (2026-07-11 doğrulandı).

### 1.2 Stack

```
Next.js 15 (apps/web) + Hono Clean Arch (apps/api)
  → Supabase Postgres (PostgREST) + Trigger.dev cron
  → Vercel + Sentry (kısmi) + Postman/Newman CI
```

Monorepo: Turborepo + pnpm. Packages: `auth`, `ui`, `3d`, `payments`, `validators`, `types`, `db` (legacy Prisma), `i18n`, `config`.

### 1.3 Güçlü yanlar

- Clean Architecture iskeleti backend’de var
- Escrow + payout + dispute domain’i çalışıyor
- 3D paket (`@cyberlisans/3d`) + GSAP + R3F mevcut
- Migration seti 0001→0021, secret store (Vault/pgcrypto)
- Vitest unit test + Newman API collection
- Production health OK

### 1.4 Zayıf yanlar / teknik borç

| Alan                  | Sorun                                                                                          |
| --------------------- | ---------------------------------------------------------------------------------------------- |
| **Tasarım**           | “Cyberpunk neon” (Orbitron + #00F0FF/#FF00C8) — göz yorucu, premium/kurumsal değil             |
| **Dashboard birliği** | `/admin` ve `/dashboard/admin` çift; dealer legacy UI hâlâ duruyor                             |
| **Clean Arch**        | Use-case’lerin bir kısmı hâlâ `domain/usecases` (eski) + `application/usecases` (yeni) karışık |
| **packages/db**       | Prisma legacy — kullanılmıyor, karmaşa yaratıyor                                               |
| **Landing**           | 11 section var ama stil tutarsız; 3D performans (dpr, mobile fallback) zayıf                   |
| **Responsive**        | Dashboard shell mobile-first değil                                                             |
| **Perf**              | 3D her zaman yükleniyor; code-split / reduced-motion kısmi                                     |
| **Ops**               | Supabase project CLI’da linked değil; M3.1 blocker’lar (alias, Sentry token, rotate) açık      |
| **MCP**               | Grok’ta hiç MCP yok — GitHub CLI, Vercel CLI, Trigger CLI var; Supabase org yanlış hesap       |

---

## 2. Erişim Matrisi (2026-07-11)

| Araç            | CLI                            | MCP | Not                                                                                                         |
| --------------- | ------------------------------ | --- | ----------------------------------------------------------------------------------------------------------- |
| **GitHub**      | ✅ `meviza` (repo/workflow)    | ❌  | `gh` tam erişim; MCP eklenebilir                                                                            |
| **Vercel**      | ✅ `meviza` / mevizas-projects | ❌  | `cyberlisans` projesi listede                                                                               |
| **Trigger.dev** | ✅ kerem_newton@hotmail.com    | ❌  | project `proj_sibrytqjplnlnkvxwfve`                                                                         |
| **Supabase**    | ⚠️ Farklı org                  | ❌  | CLI’da sadece `can.mimarlik` org; `aobbnmasgvbnpjmitnyi` görünmüyor → doğru hesapla login + `supabase link` |
| **Sentry**      | ❌ sentry-cli yok              | ❌  | OAuth MCP (`mcp.sentry.dev`) eklenebilir                                                                    |
| **Postman**     | ✅ lokal collection            | ❌  | Newman local; resmi MCP sınırlı — collection + GH Actions yeterli                                           |

---

## 3. Tasarım Yönü (Premium Corporate 3D)

### 3.1 İlkeler

1. **Sade** — Az renk, bol boşluk, net hiyerarşi
2. **Premium** — Glass/soft surface, subtle depth, kaliteli tipografi
3. **Göz yormayan** — Düşük doygunluk accent, koyu ama soft arka plan (saf #000 neon yok)
4. **Animasyon** — Anlamlı motion (scroll reveal, hover micro, 3D hero); `prefers-reduced-motion` zorunlu
5. **Kurumsal güven** — Escrow/güvenlik mesajı tipografi ve layout ile; glitch/neon “oyun kafe” estetiği terk

### 3.2 Design tokens (hedef)

| Token              | Değer (öneri)                                      | Rol                |
| ------------------ | -------------------------------------------------- | ------------------ |
| `--bg-base`        | `#0B0D12`                                          | Ana zemin          |
| `--bg-elevated`    | `#12151C`                                          | Kart / panel       |
| `--bg-glass`       | `rgba(18,21,28,0.72)`                              | Glass panel        |
| `--text-primary`   | `#F4F6F8`                                          | Başlık             |
| `--text-secondary` | `#9AA3B2`                                          | Body               |
| `--accent`         | `#5B8CFF` → soft blue                              | CTA (cyan yerine)  |
| `--accent-2`       | `#7C6CFF`                                          | Secondary gradient |
| `--success`        | `#3DDC97`                                          | Escrow / success   |
| `--warning`        | `#F5C542`                                          | Pending            |
| `--danger`         | `#F07178`                                          | Error / dispute    |
| `--border`         | `rgba(255,255,255,0.08)`                           | Hairline           |
| Font display       | **Söhne / Plus Jakarta / Geist** (Orbitron kaldır) |                    |
| Font body          | **Inter / Geist Sans**                             |                    |
| Font mono          | **JetBrains Mono** (sadece kod/ID)                 |                    |

> Eski `cyber-cyan` / `cyber-magenta` token’ları deprecate; bir migration alias dönemi (1 sprint) sonra sil.

### 3.3 3D stratejisi

| Cihaz / koşul            | Davranış                                                                        |
| ------------------------ | ------------------------------------------------------------------------------- |
| Desktop ≥ lg, GPU OK     | R3F hero: yumuşak floating geometry + subtle particles + soft environment light |
| Mobile / low-end         | Statik gradient mesh + CSS parallax (Canvas yok)                                |
| `prefers-reduced-motion` | Statik poster frame, animasyon kapalı                                           |
| Dashboard içi            | **3D yok** — performans + odak; sadece micro-interaction                        |

Paket: `@cyberlisans/3d` sadeleştirilir (neon-grid, glitch-text kaldır veya opsiyonel). Yeni: `PremiumHeroScene`, `SoftOrb`, lazy `dynamic(() => import(...), { ssr: false })`.

### 3.4 Landing bilgi mimarisi

1. **Hero** — Değer önerisi + CTA (Alışverişe başla / Satıcı ol) + 3D
2. **Trust strip** — Escrow, anında teslim, KVKK, ödeme logoları
3. **Kategoriler** — 3–6 vertical
4. **Öne çıkan ürünler** — ISR
5. **Nasıl çalışır** — 3 adım (Alıcı / Satıcı / Escrow)
6. **Satıcı CTA** — marketplace onboarding
7. **FAQ** + SEO JSON-LD
8. **Footer**

Kaldır / sadeleştir: aşırı “pricing tiers”, glitch testimonials, neon stats.

### 3.5 Üç dashboard shell (tek design system)

Ortak: `AppShell` (sidebar + topbar + content) — token’lar, spacing scale (4/8/12/16/24/32), card, table, empty state, skeleton.

| Shell        | Route prefix        | Sidebar modülleri                                                          |
| ------------ | ------------------- | -------------------------------------------------------------------------- |
| **Customer** | `/dashboard`        | Genel bakış, Siparişler, Cüzdan, Ayarlar, Satıcı ol                        |
| **Seller**   | `/dashboard/seller` | Özet, Ürünler, Stok/Key, Siparişler, Payout, Ayarlar                       |
| **Admin**    | `/admin`            | Başvurular (KYC), Ürün onay, Escrow, Dispute, Kullanıcılar, Audit, Ayarlar |

**Route birleştirme:**

- `/dashboard/admin/*` → `/admin/*` (redirect)
- Legacy `/dealer/*` → deprecation banner veya archive (ürün kararı)

---

## 4. Mimari Refactor Planı

### Phase 0 — MCP + erişim (1 gün)

1. Grok MCP ekle: GitHub, Supabase, Vercel, Sentry (OAuth), isteğe bağlı Trigger
2. Supabase: doğru hesapla login + `supabase link --project-ref aobbnmasgvbnpjmitnyi`
3. Pending migrations 0019–0021 apply doğrula
4. Production smoke: health, login, products list

### Phase 1 — Design system foundation (2–3 gün)

1. `packages/config` token rewrite + Tailwind preset
2. `packages/ui` atom/molecule restyle (Button, Card, Input, Badge, Table)
3. Typography + spacing + motion primitives
4. Story/demo sayfası veya `/dev/ui` (opsiyonel, prod’da kapalı)
5. Dark-only v1 (light theme sonra)

### Phase 2 — Landing redesign (3–4 gün)

1. Hero + 3D lazy + mobile fallback
2. Section rewrite (copy + layout)
3. Lighthouse hedef: Performance ≥ 90 desktop, ≥ 75 mobile; CLS < 0.1; LCP < 2.5s
4. SEO: mevcut JSON-LD koru, OG image yenile

### Phase 3 — Dashboard redesign (4–5 gün)

1. `AppShell` + role-aware nav
2. Customer screens
3. Seller screens (ürün CRUD UX polish)
4. Admin: KYC review queue + product approve + escrow/dispute
5. Empty/loading/error states tutarlı

### Phase 4 — Backend / Clean Arch cleanup (3–4 gün)

1. Kalan use-case’leri `application/usecases` altına taşı
2. `domain/usecases` sil veya re-export geçiş
3. `packages/db` (Prisma) kaldır veya `docs/legacy`
4. API response envelope standardı
5. Rate-limit + Sentry context polish

### Phase 5 — DB / perf / security (2–3 gün)

1. 0019–0021 production apply + Advisor temizliği
2. Composite index doğrulama (EXPLAIN hot paths)
3. Product list ISR/cache headers
4. Image/CDN + font subset
5. RLS smoke tests

### Phase 6 — QA + launch polish (2 gün)

1. Newman full suite
2. Vitest + kritik Playwright path’ler (login, checkout, seller apply, admin approve)
3. Accessibility pass (klavye, contrast AA)
4. Docs: STATUS, CHANGELOG, MILESTONE-9

**Toplam tahmin:** ~15–20 iş günü (paralel ajanlarla 8–12 güne sıkışabilir).

---

## 5. Performans Metrikleri (hedef)

| Metrik     | Landing                          | Dashboard     |
| ---------- | -------------------------------- | ------------- |
| LCP        | < 2.5s                           | < 2.0s        |
| INP        | < 200ms                          | < 200ms       |
| CLS        | < 0.1                            | < 0.05        |
| TBT        | < 200ms                          | < 150ms       |
| JS (route) | 3D lazy; initial < 200KB gzip UI | shell < 150KB |
| Bundle     | dynamic import sections          | no R3F        |

---

## 6. MCP Kurulum Komutları (onay sonrası)

```bash
# GitHub (official)
grok mcp add github -- npx -y @modelcontextprotocol/server-github
# veya: gh auth token ile env GITHUB_PERSONAL_ACCESS_TOKEN

# Supabase
grok mcp add --transport http supabase "https://mcp.supabase.com/mcp?project_ref=aobbnmasgvbnpjmitnyi"
# OAuth: /mcps modal → Authenticate

# Sentry
grok mcp add --transport http sentry https://mcp.sentry.dev/mcp

# Vercel (community / official as available)
# Option A: npx @vercel/mcp-server if published
# Option B: continue with `vercel` CLI + scripts/vercel-helpers.sh

# Trigger.dev — genelde CLI yeterli:
# TRIGGER_SECRET_KEY=... pnpm trigger:dev
```

Postman: resmi MCP zorunlu değil; `postman/` + Newman CI devam.

---

## 7. Riskler

| Risk                          | Mitigasyon                          |
| ----------------------------- | ----------------------------------- |
| Tasarım “çok sade → markasız” | Accent + 3D hero + motion identity  |
| 3D mobile FPS                 | Canvas kill-switch + poster         |
| Route migration kırılması     | 301 redirects + middleware map      |
| Token rename kırılması        | Geçici Tailwind alias map           |
| Supabase wrong org            | User re-login before any migration  |
| Scope creep                   | Phase gate: her phase merge + smoke |

---

## 8. Onay Bekleyen Kararlar

1. **Tasarım paleti:** Soft blue corporate (önerilen) vs. muted cyan (eski markaya yakın)
2. **`/dealer`:** Arşivle mi, ayrı ürün olarak tutulsun mu?
3. **Admin route:** Sadece `/admin` mi?
4. **MCP:** Hangilerini şimdi kuralım? (min: GitHub + Supabase + Sentry)
5. **Supabase hesap:** `aobbnmasgvbnpjmitnyi` hangi e-posta ile? CLI’da görünmüyor

---

## 9. İlk Sprint (onaydan sonra hemen)

1. Phase 0 MCP + Supabase link
2. Design tokens PR
3. Landing hero + shell mock (customer)
4. STATUS.md güncelle → M9 in progress

```

```

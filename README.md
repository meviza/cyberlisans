# CyberLisans

Cyberpunk temalı dijital lisans satış platformu. Monorepo yapısında Next.js (web & admin) ve Hono (api) uygulamaları, ortak paketlerle (ui, db, auth, payments, 3d, i18n, validators, types, config) çalışır.

## Kurulum

```bash
pnpm install
cp .env.example .env
pnpm dev
```

## Dizin Yapısı

`apps/` altında `web` (Next.js storefront), `admin` (Next.js yönetim paneli) ve `api` (Hono REST) bulunur. `packages/` altında UI bileşenleri, veritabanı şeması, auth, ödeme entegrasyonları (PayTR, Papara, NOWPayments, Stripe), 3D sahneleri, i18n, validators ve types yer alır. Turbo + pnpm workspaces ile tüm paketler paralel geliştirilir.

## Komutlar

| Komut            | Açıklama                       |
| ---------------- | ------------------------------ |
| `pnpm dev`       | Tüm uygulamaları paralel başlat |
| `pnpm build`     | Tüm paketleri build et         |
| `pnpm lint`      | Lint çalıştır                  |
| `pnpm typecheck` | TypeScript kontrolü            |
| `pnpm test`      | Testleri çalıştır              |
| `pnpm clean`     | Build çıktılarını temizle      |
| `pnpm format`    | Prettier ile formatla          |
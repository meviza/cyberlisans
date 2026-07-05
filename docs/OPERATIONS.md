# Operasyon Rehberi

## Günlük kontrol

```bash
./scripts/health-check.sh
```

## Deploy

```bash
./scripts/pre-deploy.sh && vercel deploy --prod --yes
```

## Log

```bash
./scripts/vercel-helpers.sh logs
# veya
vercel logs --follow --production
```

## Env yönetimi

```bash
./scripts/vercel-helpers.sh env:ls
vercel env add <KEY> production
```

## Domain

```bash
./scripts/vercel-helpers.sh alias
```

## Acil durum (rollback)

```bash
vercel rollback
# veya eski deployment'a alias
```

## Trigger.dev auto-release izleme

Trigger.dev dashboard → cyberlisans → release-escrow → Runs

## Sentry izleme

sentry.io → meviza/cyberlisans → Issues

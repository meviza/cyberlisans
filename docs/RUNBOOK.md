# CyberLisans — Runbook (Operasyon Rehberi)

> **Günlük operasyonlar, deploy, rollback, debug, monitoring için tek referans.**

---

## 📅 Günlük Kontrol

### Hızlı sağlık kontrolü (5 dakika)

```bash
cd /Users/keremcelik/Projects/cyberlisans

# 1. Production health
curl -sS https://cyberlisans-mp.vercel.app/api/health | jq

# 2. Login test (herhangi bir customer ile)
TOKEN=$(curl -sS -X POST https://cyberlisans-mp.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@cyberlisans.com","password":"Alice!2026Safe"}' | jq -r .accessToken)

# 3. Authenticated endpoint test
curl -sS https://cyberlisans-mp.vercel.app/api/sellers/me \
  -H "Authorization: Bearer $TOKEN" | jq

# 4. Trigger.dev dashboard kontrol
# → cloud.trigger.dev → Cyberlisans → release-escrow → Last run (bugün mü?)
```

### Alternatif: helper script

```bash
./scripts/health-check.sh
```

---

## 🚀 Deploy

### Pre-deploy checklist

```bash
cd /Users/keremcelik/Projects/cyberlisans

# 1. Typecheck
pnpm --filter @cyberlisans/api typecheck
pnpm --filter @cyberlisans/web typecheck

# 2. Build (production sim)
pnpm --filter @cyberlisans/web build

# 3. Newman test (production)
npx newman run postman/cyberlisans.postman_collection.json \
  -e postman/environments/production.postman_environment.json

# 4. Pre-deploy script (hepsini birden)
./scripts/pre-deploy.sh
```

### Vercel deploy

```bash
# ÖNEMLİ: cyberlisans.vercel.app başka projeye atanmış olabilir.
# cyberlisans-mp.vercel.app kullan (M3.1'de düzeltilecek)

cd /Users/keremcelik/Projects/cyberlisans
vercel link --yes  # project: prj_UJlBBLXtEra8Y6TsOUh5XPxpeEsu

# Production deploy
vercel deploy --prod --yes

# Force rebuild (cache bypass)
rm -rf .next
pnpm --filter @cyberlisans/web build
vercel deploy --prod --yes --force
```

### Trigger.dev deploy

```bash
cd /Users/keremcelik/Projects/cyberlisans
TRIGGER_SECRET_KEY="<trigger-personal-token>" \
  npx trigger.dev@latest deploy
```

### Database migration

```bash
# Supabase CLI ile
supabase db push

# Veya Supabase Dashboard'dan SQL Editor → yapıştır → Run
# Migration'lar: supabase/migrations/000X_*.sql
```

---

## ⏪ Rollback

### Vercel rollback (son 5 dakika içinde)

```bash
# List son deployments
vercel ls --prod

# Belirli bir deployment'a alias ata
vercel alias set cyberlisans-mp.vercel.app <deployment-url>

# Veya "promote" et (son deploy'u production yap)
vercel promote <deployment-id>
```

### Trigger.dev rollback

- Dashboard → Deployments → eski version'ı "Promote to production"

### Database rollback

- **DİKKAT:** Migration'lar geri alınmaz. Yeni bir geri-alma migration'ı yaz.
- Supabase Dashboard → SQL Editor → geri-alma SQL'i yapıştır → Run
- Her zaman **önce local'de test et**.

---

## 🔍 Debug

### 1. API 500 hatası alıyorum

```bash
# Vercel log (son 100 satır)
vercel logs --production | tail -100

# Veya real-time
vercel logs --production --follow

# apps/api local'de çalıştır (debug için)
cd apps/api
INTERNAL_SERVICE_SECRET=... npx tsx src/index.ts
```

### 2. Login çalışmıyor

```bash
# Test et
curl -sS -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@cyberlisans.com","password":"Alice!2026Safe"}'

# 401 → şifre yanlış, kullanıcı yok
# 500 → DB bağlantı sorunu
# 200 → token döner

# DB'de user var mı kontrol
supabase db execute "SELECT id, email, role FROM users WHERE email = 'alice@cyberlisans.com'"
```

### 3. Supabase bağlantı sorunu

```bash
# apps/api/.env kontrol
cat apps/api/.env

# SERVICE_ROLE_KEY doğru mu?
# https://supabase.com/dashboard/project/aobbnmasgvbnpjmitnyi/settings/api

# Local'de supabaseAdmin() test
cd apps/api
node -e "
  const { supabaseAdmin } = require('./src/infrastructure/supabase-db.ts');
  supabaseAdmin().from('users').select('id', { count: 'exact', head: true }).then(r => console.log(r));
"
```

### 4. Trigger.dev cron çalışmıyor

- Dashboard → Cyberlisans → release-escrow → Runs
- Son run ne zaman? Hata var mı?
- `globals` secret doğru set edilmiş mi? (API_URL, INTERNAL_SERVICE_SECRET)
- Test için "Test" tab → "Trigger run now"

### 5. Sentry error tracking

- sentry.io → meviza/cyberlisans → Issues
- Source map upload başarılı mı? (Settings → Source Maps)
- DSN env'e eklenmiş mi? (Vercel env)

---

## 📊 Monitoring Dashboard

| Metrik             | Tool           | URL                                                 |
| ------------------ | -------------- | --------------------------------------------------- |
| **Uptime**         | Vercel         | vercel.com/dashboard → cyberlisans → Analytics      |
| **Errors**         | Sentry         | sentry.io → meviza/cyberlisans                      |
| **API usage**      | Supabase       | supabase.com/dashboard/project/.../reports/api      |
| **DB performance** | Supabase       | supabase.com/dashboard/project/.../reports/database |
| **Cron runs**      | Trigger.dev    | cloud.trigger.dev → Cyberlisans → release-escrow    |
| **CI tests**       | GitHub Actions | github.com/meviza/cyberlisans/actions               |
| **API tests**      | Postman        | postman.com → workspace → Cyberlisans               |

---

## 🔐 Security

### Hassas env variable'lar

**ASLA echo etme, loglama, commit etme:**

- `SUPABASE_SERVICE_ROLE_KEY` — tüm DB'ye erişim
- `JWT_SECRET` — JWT sign
- `INTERNAL_SERVICE_SECRET` — HMAC auth
- `SENTRY_AUTH_TOKEN` — source map upload
- `TRIGGER_SECRET_KEY` — Trigger deploy

**Vercel'de encrypted saklanır**, ama yine de dikkatli ol.

### Key rotation prosedürü

**Supabase service_role rotate:**

1. https://supabase.com/dashboard/project/aobbnmasgvbnpjmitnyi/settings/api
2. "Service Role" → "Roll key" (buton)
3. Yeni key'i al
4. Vercel env: `vercel env rm SUPABASE_SERVICE_ROLE_KEY production --yes`
5. `vercel env add SUPABASE_SERVICE_ROLE_KEY production` → yeni key
6. `apps/api/.env`'i güncelle (local dev)
7. Redeploy

**Trigger secret rotate:**

1. Trigger dashboard → Settings → API Keys
2. Eski'yi revoke, yeni oluştur
3. Local'de `export TRIGGER_SECRET_KEY=<yeni>`
4. `npx trigger.dev@latest deploy`

### Sızıntı durumunda

**Eğer hassas bir key paylaşıldıysa (Slack, GitHub, log):**

1. Hemen rotate et
2. Eski key'i invalidate et
3. Log'ları kontrol et (key kimin eriştiği?)
4. Audit log'a kayıt düş

---

## 🧪 Test

### Local test

```bash
# Newman (Postman)
npx newman run postman/cyberlisans.postman_collection.json \
  -e postman/environments/local.postman_environment.json

# Manuel curl test (kullanıcılar)
# admin: admin@cyberlisans.com / Admin!2026Safe
# alice: alice@cyberlisans.com / Alice!2026Safe
# bob/diana/erhan: <adı>@cyberlisans.com / <Adı>!2026Safe

# Bir endpoint'i test et
curl -sS http://localhost:3001/health
```

### CI test (GitHub Actions)

- PR açıldığında otomatik Newman çalışır
- `postman/reports/newman-report.html` artifact olarak indirilebilir
- Test başarısızsa merge bloklanır

---

## 🔄 Trigger.dev Operations

### Task listele

```bash
# Local
npx trigger.dev@latest ls

# Dashboard
# cloud.trigger.dev/projects/v3/proj_sibrytqjplnlnkvxwfve
```

### Manual run

- Dashboard → release-escrow → Test → "Trigger test"
- Local'de: `npx trigger.dev@latest dev` (development mode)

### Schedule değiştir

- `src/trigger/release-escrow.ts` → `cron: { pattern, timezone }`
- Deploy: `npx trigger.dev@latest deploy`

---

## 📞 Acil Durum

### Production tamamen düştü

1. **Vercel:** `vercel ls --prod` → son 3 deployment listele
2. **Rollback:** `vercel alias set cyberlisans-mp.vercel.app <son-çalışan-deployment>`
3. **Kök neden:** `vercel logs --production --follow`
4. **Bildir:** Kullanıcıya + ekibe haber ver

### DB bozulması

1. **Hemen:** Supabase Dashboard → Read-only mode (opsiyonel)
2. **Backup:** Otomatik günlük backup var, restore için Supabase support
3. **Manual fix:** Yeni migration yaz (geri alma değil)

### Hassas veri sızıntısı

1. **Hemen:** Key'i rotate et
2. **Bildir:** Kullanıcıya
3. **Dokümante et:** memory/YYYY-MM-DD.md'ye kayıt

---

## 📝 Checklist: Yeni Milestone

- [ ] Milestone planı (`docs/ROADMAP.md`'de güncelle)
- [ ] DB migration (gerekirse)
- [ ] Backend use-case + route
- [ ] Frontend page + component
- [ ] Test: Newman + manuel curl
- [ ] Postman collection güncelle
- [ ] docs/MILESTONE-X.md yaz
- [ ] docs/STATUS.md güncelle
- [ ] docs/CHANGELOG.md güncelle (semver)
- [ ] memory/YYYY-MM-DD.md yaz
- [ ] git commit (ref: MILESTONE-X.md)
- [ ] git tag vX.Y.Z-<name>
- [ ] Deploy: Vercel + Trigger
- [ ] Post-deploy health check

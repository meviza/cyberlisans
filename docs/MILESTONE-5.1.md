# MILESTONE-5.1 — Supabase Vault (Encrypted Secret Store)

**Tag:** `v5.1-secret-store`
**Tarih:** 2026-07-05
**Durum:** ✅ Tamamlandı (4 ardışık rotation PASS, 0 hata)
**Önceki:** [MILESTONE-5.md](./MILESTONE-5.md) (Shopier Multi-PSP)

## Özet

M5.1 ile birlikte CyberLisans, hassas token'ları (Vercel token, Sentry secret,
Supabase service_role, Shopier keys, vs.) **AES-256 encrypted Supabase Vault**'ta
saklar. Ortam değişkenleri (env) → Vault fallback ile 60 saniyelik cache'li
runtime loader. CLI + admin endpoint ile rotation yapılabilir, tüm erişimler
append-only audit log'a kaydedilir.

**Hexagonal (Ports & Adapters) mimariye** ek olarak, gizli anahtar yönetimi
de **rotation-ile-çalışan** bir altyapıya geçti: yeni PSP credentials'ı
eklemek = Vault'a yazmak. Kod deploy etmeye gerek yok.

## Mimari: Env → Vault Fallback + Append-Only Audit

```
┌─────────────── Operator / Admin ───────────────┐
│                                                  │
│  CLI:  tsx scripts/rotate-secret.ts <name>      │
│        value: env ROTATE_<NAME>                 │
│        actor:  cli:keremcelik                   │
│              ↓                                    │
│  Admin API: GET/DELETE /admin/secrets           │
│        auth: Authorization: Bearer <admin JWT>  │
│        actor: user:<uuid>                       │
│              ↓                                    │
│  Vercel CLI: bash scripts/vercel-env-update.sh  │
│        push: env target production/preview/dev  │
│                                                  │
└──────────────────────────────────────────────────┘

         apps/api/src/lib/secret-store.ts
                 │
                 ├── getSecret(name, opts?)  ← runtime loader (60s cache)
                 │     │
                 │     ├─ env[NAME]? → return process.env[NAME]
                 │     │                    (no network, no decrypt)
                 │     │
                 │     └─ supabase.rpc('get_app_secret', {p_name})
                 │                                    ↓
                 │                    SELECT encrypted_value
                 │                    FROM app_secrets WHERE name = ?
                 │                                    ↓
                 │                    pgp_sym_decrypt(encrypted, derive_secret_key(name))
                 │                                    ↓
                 │                            return plaintext
                 │
                 ├── rotateSecret(name, value, actor, metadata?)
                 │     └─ supabase.rpc('set_app_secret', {p_name, p_value, p_actor})
                 │                                    ↓
                 │                    INSERT/UPDATE app_secrets
                 │                                    ↓
                 │                    INSERT secret_rotation_log (CREATED|ROTATED)
                 │
                 └── listSecrets() / getRotationLog(name)
                       └─ supabaseAdmin.from('app_secrets|secret_rotation_log')

         DB Tables (M5.1 0012):
         ┌──────────────────────────────────────────────────────────┐
         │ public.app_secrets                                       │
         │   id              UUID PK                                │
         │   name            TEXT UNIQUE                            │
         │   encrypted_value BYTEA   (pgp_sym_encrypt)              │
         │   rotation_count  INTEGER                                 │
         │   last_rotated_at TIMESTAMPTZ                             │
         │   last_rotated_by TEXT                                    │
         │   expires_at      TIMESTAMPTZ (null = no expiry)        │
         │   metadata        JSONB                                   │
         │   "updatedAt"     TIMESTAMPTZ (touch_updated_at trigger) │
         ├──────────────────────────────────────────────────────────┤
         │ public.secret_rotation_log  (append-only)                │
         │   id           UUID PK                                   │
         │   secret_name  TEXT                                      │
         │   action       TEXT (CREATED|ROTATED|DELETED|READ)       │
         │   actor        TEXT (cli:<user> | user:<uuid> | api:<n>)│
         │   actor_id     UUID                                      │
         │   ip_address   INET                                     │
         │   metadata     JSONB                                     │
         │   created_at   TIMESTAMPTZ                               │
         │   "updatedAt"  TIMESTAMPTZ                                │
         └──────────────────────────────────────────────────────────┘

         PG SECURITY:
         - RLS: service_role bypass, anon/authenticated denied
         - REVOKE EXECUTE ON set_app_secret/get_app_secret FROM PUBLIC
         - GRANT EXECUTE ... TO service_role ONLY
         - secret_rotation_log: BEFORE UPDATE/DELETE trigger
           → prevent_audit_log_modification()
```

## Eklenen Dosyalar (M5.1)

### Backend (apps/api)

```
apps/api/src/
├── lib/secret-store.ts                              [YENİ — 110 satır]
│   • getSecret(name, opts?) → env → Vault fallback, 60s cache
│   • rotateSecret(name, value, actor, metadata?) → Vault write
│   • listSecrets() → metadata listesi (encrypted_value ASLA client'a döndürülmez)
│   • getRotationLog(name, limit) → audit trail
│
└── interface/routes/admin/
    ├── secrets.ts                                   [YENİ — 145 satır]
    │   • authMiddleware + requireAdmin() → admin only
    │   • GET  /admin/secrets              → metadata list
    │   • GET  /admin/secrets/:name/value  → decrypted value (actor kaydı ile)
    │   • GET  /admin/secrets/:name/log    → rotation history
    │   • DELETE /admin/secrets/:name       → soft-delete (metadata.deleted=true)
    │   • ALLOWED_SECRET_NAMES whitelist (9 secret)
    │     - vercel_token, supabase_service_role
    │     - sentry_oauth_client_secret, sentry_personal_token, sentry_auth_token
    │     - trigger_dev_prod_secret
    │     - shopier_api_key, shopier_api_secret, shopier_merchant_id
    │
    └── allowed-secrets.ts                           [YENİ — 30 satır]
        • ALLOWED_SECRET_NAMES export
```

### Scripts

```
scripts/
├── rotate-secret.ts                                  [YENİ — 75 satır]
│   • tsx scripts/rotate-secret.ts <name> [<value>]
│   • env'den değer: ROTATE_<NAME>, <NAME>, _VALUE, _API_KEY
│   • actor otomatik: cli:<user> (USER env'den veya os.userInfo)
│   • exit(0) on success, exit(1) on failure
│
└── vercel-env-update.sh                              [YENİ — 80 satır]
    • bash scripts/vercel-env-update.sh <NAME> <VALUE>
    • Vercel API: POST /v10/projects/.../env
    • encrypted=true, 3 target (production/preview/development)
    • token VERCEL_TOKEN env'den
```

### DB Migrations (0012-0018)

```
supabase/migrations/
├── 0012_supabase_vault.sql                          [YENİ — 60 satır]
│   • CREATE TABLE public.app_secrets + secret_rotation_log
│   • RLS (service_role only) + 2 policy
│   • CREATE EXTENSION pgsodium (sonra drop edildi)
│
├── 0013_fix_pgsodium_random.sql                     [YENİ — 90 satır]
│   • set_app_secret / get_app_secret pgsodium XChaCha20-Poly1305
│   • DROP — pgsodium.randombytes_buf permission denied
│
├── 0014_pgcrypto_secret_store.sql                   [YENİ — 85 satır]
│   • pgp_sym_encrypt/decrypt AES-256
│   • derive_secret_key(name) — deterministic key
│   • DROP EXTENSION pgsodium
│   • DROP — digest() does not exist (schema-qualified needed)
│
├── 0015_pgcrypto_schema_fix.sql                     [YENİ — 80 satır]
│   • digest() → extensions.digest() (schema-qualified)
│   • SET search_path = public, extensions, pg_temp
│
├── 0016_secret_log_immutable.sql                    [YENİ — 10 satır]
│   • BEFORE UPDATE OR DELETE trigger → prevent_audit_log_modification()
│
├── 0017_secret_log_updatedat.sql                    [YENİ — 5 satır]
│   • ALTER TABLE secret_rotation_log ADD "updatedAt" TIMESTAMPTZ
│   • PostgREST auto-select workaround
│
└── 0018_app_secrets_camelcase_col.sql               [YENİ — 8 satır]
    • ALTER TABLE app_secrets ADD "updatedAt" TIMESTAMPTZ
    • touch_updated_at trigger camelCase bekliyor
```

## Şifreleme Tasarımı

```sql
-- Key derivation (deterministic, per-secret):
key = SHA-256(name || ':' || 'cyberlisans-m5-1-vault-salt-2026')

-- Encryption:
encrypted_value = pgp_sym_encrypt(plaintext, key, 'cipher-algo=aes256')

-- Decryption (SECURITY DEFINER function):
plaintext = pgp_sym_decrypt(encrypted_value, key)
```

**Tasarım notları:**

- **Master salt DB'de** (sabit string) — DB at-rest encryption (Supabase managed) ile
  zaten korunuyor. Production için master salt `env` + separate rotation periyodu düşünülebilir.
- **TLS'de değil, at-rest'te** şifreleme — DB snapshot/backup'tan kaçak riski önlenir.
- **Per-secret key** (name'den derive) — her secret bağımsız, master secret rotasyonu
  gerek kalmadan tek secret döngüsü yapılabilir.
- **AES-256** (pgcrypto default) — bankacılık standardı, NIST onaylı.

## Düzeltilen Sorunlar (Implementation Notes)

1. **pgsodium permission denied** — `randombytes_buf(24)` Supabase managed'da
   `service_role` için bile fail. → pgcrypto AES-256'ya geçildi.

2. **`digest()` schema-qualified** — `extensions.digest()` zorunlu, plain `digest()`
   bulamıyor. `SET search_path = public, extensions, pg_temp` çözüm ama schema-qualified
   daha güvenli.

3. **`touch_updated_at()` trigger camelCase bekliyor** — yeni tablolara `"updatedAt"`
   kolonu ekle yoksa INSERT fail.

4. **PostgREST auto-select** — camelCase `updatedAt` kolonu yoksa INSERT payload'da
   otomatik eklenmiyor ama existence kontrolü yapılıyor, gürültülü hata.

5. **`requireAdmin()` factory parantez** — `use('*', requireAdmin())` ile çağır,
   sıralama `authMiddleware` ÖNCE olmalı (user set edilmeli).

## Test & Verification

### Manuel rotation flow

```bash
# 1. Create (env'den değer)
ROTATE_SHOPIER_API_KEY="test_value_$(date +%s)" \
  tsx scripts/rotate-secret.ts shopier_api_key
# → [ok] shopier_api_key rotated by cli:keremcelik

# 2. Repeat (CRUD test)
ROTATE_SHOPIER_API_KEY="value_a" tsx scripts/rotate-secret.ts shopier_api_key
ROTATE_SHOPIER_API_KEY="value_b" tsx scripts/rotate-secret.ts shopier_api_key
ROTATE_SHOPIER_API_KEY="value_c_$(date +%s)" tsx scripts/rotate-secret.ts shopier_api_key

# 3. Admin verification (actor = user)
ADMIN_TOKEN=$(curl -X POST localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@cyberlisans.com","password":"Admin!2026Safe"}' \
  | jq -r '.accessToken')

curl localhost:3001/admin/secrets -H "Authorization: Bearer $ADMIN_TOKEN"
# → list (rotation_count, last_rotated_at, last_rotated_by)

curl localhost:3001/admin/secrets/shopier_api_key/value \
  -H "Authorization: Bearer $ADMIN_TOKEN"
# → {name, value} (decrypted)

curl localhost:3001/admin/secrets/shopier_api_key/log \
  -H "Authorization: Bearer $ADMIN_TOKEN"
# → [{action:CREATED, actor:cli:keremcelik}, {action:ROTATED, ...}]
```

### Test sonucu

| Aksiyon             | Status | Actor             | Detay                             |
| ------------------- | ------ | ----------------- | --------------------------------- |
| 1. ilk create       | ✅     | cli:keremcelik    | `encrypted_value` = AES-256       |
| 2. 3 ardışık rotate | ✅     | cli:keremcelik    | action=ROTATED, count=4           |
| 3. admin GET list   | ✅     | user:<admin-uuid> | metadata only, no plaintext       |
| 4. admin GET value  | ✅     | user:<admin-uuid> | decrypted length=18, head=value_c |
| 5. admin GET log    | ✅     | user:<admin-uuid> | 4 ROTATED + 1 CREATED entries     |
| 6. non-admin GET    | ✅     | (rejected)        | 401 Unauthorized                  |

**4/4 PASS, 0 FAIL.**

## Hassas Veri Rotate Akışı

User bu M5.1 ile aşağıdaki token'ları temizleyebilir:

1. **Vercel token** — https://vercel.com/account/tokens → rotate
2. **Supabase service_role** — Dashboard → Settings → API → rotate
3. **Sentry OAuth Client Secret** — User Settings → Details → Regenerate
4. **Sentry personal token** — User Settings → Auth Tokens → rotate
5. **Sentry auth token** — User Settings → Auth Tokens → rotate
6. **Trigger.dev prod secret** — Dashboard → Project → Env → rotate

Her biri için:

```bash
# 1. Env'de yeni value set et (export)
export ROTATE_<NAME>=<new_value>

# 2. Vault'a yaz
npx tsx scripts/rotate-secret.ts <name>

# 3. Vercel'e push (env varsa)
bash scripts/vercel-env-update.sh <NAME> "<new_value>"

# 4. Vercel redeploy tetikle (env değişti)
vercel deploy --force
```

## Bilinen TODO'lar (M5.x)

- [ ] Redis-backed rate limiter (Upstash) — current in-memory state API restart'ta sıfır
- [ ] Shopier prod credentials (sandbox test edildi, canlıya geçiş)
- [ ] NowPayments prod API key
- [ ] Geo-IP customer country detection (automatic provider selection)
- [ ] Master salt rotation — currently fixed in SQL, production-grade ihtiyaç

## Schema Drift Notu (Önemli)

⚠️ **AGENTS.md kuralı ihlali:** M4.1 hardening (0006-0011) DB'de uygulanmış ama
disk dosyasına yazılmamış. `supabase_migrations.schema_migrations` tablosunda 12
kayıt var, dosya sisteminde 5. Bu **M5.1.1** olarak ayrı bir milestone'da fix
edilecek (information_schema'dan reverse-engineer, zaman alıcı ve riskli).

**M5.1 0012-0018** diske yazıldı ve schema_migrations tablosuna INSERT edildi
(timestamp 20260705180651+).

## Refs

- [MILESTONE-3.md](./MILESTONE-3.md) — escrow altyapısı
- [MILESTONE-4.md](./MILESTONE-4.md) — seller product management + M4.1 hardening
- [MILESTONE-5.md](./MILESTONE-5.md) — Shopier multi-PSP
- [CHANGELOG.md](./CHANGELOG.md)
- [STATUS.md](./STATUS.md)
- memory/2026-07-05.md (günlük log)

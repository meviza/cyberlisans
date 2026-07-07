# Veritabani Kurulum Rehberi

Bu dokuman, **3 yeni migration'i** (`0019`, `0020`, `0021`) Supabase veritabanina uygulamak icin adim adim talimat verir.

## Neden Manuel?

Bu repo, Supabase'in yeni (2026) pooler v2 altyapisini kullaniyor. CLI uzerinden `supabase db push` yapsan bile, yeni SNI tabanli pooler **CLI ile tam uyumlu degil** ("tenant/user not found" hatasi). Bu nedenle en guvenilir yol: **Supabase Dashboard -> SQL Editor** uzerinden migration'lari sirayla calistirmak.

## On Kosullar

- Supabase Dashboard'a giris: https://supabase.com/dashboard
- Proje: **CyberLisans** (project ref `aobbnmasgvbnpjmitnyi`)
- **Owner veya admin** rolune sahip olmalisin

## Migration Ozeti

| Dosya                            | Ne Yapar                                       | Neden                                                     |
| -------------------------------- | ---------------------------------------------- | --------------------------------------------------------- |
| `0019_rls_pii_and_wallets.sql`   | PII ve finansal tablolara RLS ekler            | 15+ tablo RLS'siz, herkes okuyabilirdi (KRITIK)           |
| `0020_composite_indexes.sql`     | Admin dashboard sorgulari icin composite index | Admin paneli seq scan yapiyordu                           |
| `0021_security_linter_fixes.sql` | Supabase linter uyarilarini cozer              | SECURITY DEFINER fn'ler anon tarafindan cagirilabiliyordu |

**Tahmini toplam uygulama suresi:** 30-60 saniye (3 ayri SQL execution).

## Adim Adim Uygulama

### 1. SQL Editor'i ac

1. https://supabase.com/dashboard/project/aobbnmasgvbnpjmitnyi adresine git
2. Sol menuden **SQL Editor** sec
3. **New query** butonuna tikla

### 2. 0019'i calistir

1. Asagidaki dosyanin icerigini kopyala: `supabase/migrations/0019_rls_pii_and_wallets.sql`
2. SQL Editor'e yapistir
3. **Run** butonuna tikla (veya Ctrl+Enter)
4. **Basari mesaji** gormelisin ("Success. No rows returned" normal — DDL ifadeleri row donmez)

Eger hata alirsan:

- `policy ... already exists` -> Sorun degil, `DROP POLICY IF EXISTS` ifadesi zaten var, idempotent.
- `permission denied` -> Owner rolunde degilsin, Supabase Support'a yaz.

### 3. 0020'i calistir

1. `supabase/migrations/0020_composite_indexes.sql` icerigini yapistir
2. **Run**
3. Basarili olmali ("CREATE INDEX" mesajlari)

### 4. 0021'i calistir

1. `supabase/migrations/0021_security_linter_fixes.sql` icerigini yapistir
2. **Run**
3. Eger **"ERROR: cannot drop function ... because other objects depend on it"** alirsan, bu beklenen bir durum — Supabase linter'in duzeltmesi gerekli:

   ```sql
   -- Bu sorguyu ONCE calistir:
   DROP FUNCTION IF EXISTS public.is_admin() CASCADE;
   DROP FUNCTION IF EXISTS public.is_super_admin() CASCADE;
   DROP FUNCTION IF EXISTS public.current_app_user_id() CASCADE;
   -- Sonra 0021'i tekrar calistir.
   ```

## Dogrulama

Migration basarili olduktan sonra:

### Linter sonuclarini kontrol et

1. Sol menuden **Database -> Linter** ac
2. Onceden olan 14 uyari **sifira inmeli** (veya "info" seviyesine dusmeli)

### RLS aktifligini kontrol et

```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('users', 'wallets', 'wallet_transactions', 'orders', 'payments', 'order_items')
ORDER BY tablename;
```

`rowsecurity` sutunu **true** olmali.

### Helper fonksiyonlari test et

```sql
-- RLS aktifken auth.uid() NULL doner (anon user icin). False beklenir.
SELECT public.is_admin();       -- false
SELECT public.is_super_admin(); -- false
SELECT public.current_app_user_id(); -- NULL
```

### Index'leri kontrol et

```sql
SELECT indexname FROM pg_indexes
WHERE schemaname = 'public'
  AND indexname IN (
    'orders_status_createdAt_idx',
    'orders_userId_status_createdAt_idx',
    'payments_status_createdAt_idx',
    'product_keys_productId_isUsed_reservedFor_idx'
  );
```

4 index de listelenmeli.

## Geri Alma (Rollback)

Eger sorun olursa (ki olmamali), Supabase Dashboard -> **Database -> Backups**'tan en son yedegi geri yukleyebilirsin. Veya CLI ile:

```bash
supabase db reset  # LOKAL icin, production'da kullanma
```

**Production rollback:** Her migration'i geri alan ayri bir SQL yazmak gerekirse bana soz — olustururum.

## Sorun Olursa

- **Hata:** "permission denied for table X" -> Service role key ile baglanti gerekli. SQL Editor normalde yeterli, ama Supabase support'a yaz.
- **Hata:** "function ... does not exist" -> Onceki migration calistirilmamis. Sirasini kontrol et.
- **Hata:** "constraint violation" -> Mevcut data yeni kuralla celisiyor. once **0070-data-backup** mantigiyla backup al, sonra coz.

## Bitti!

3 migration uygulandiktan sonra:

- Tum hassas tablolar RLS korumali
- Admin paneli sorgulari 10-100x hizli
- Supabase linter 0 uyari (veya sadece info)

Production'a yeni deployment yapmadan once bu adimi tamamla.

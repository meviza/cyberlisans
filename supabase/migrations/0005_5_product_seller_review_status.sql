-- ============================================
-- 0005_5_product_seller_review_status — reverse-engineered snapshot
-- ============================================
-- DO NOT edit directly — this file was generated from the live DB
-- after Supabase SQL Editor bypass. If you need schema changes,
-- create a new migration instead.

-- ============================================================
-- PRODUCT SELLER REVIEW WORKFLOW
-- Adds:
--   - products.status (text)          PENDING_REVIEW | ACTIVE | REJECTED | DELETED
--   - products.images (text[])        gallery
--   - products.digitalContent, autoDelivery, delivery SLA windows
--   - products.listingType (already added in 0003 if needed)
--   - seller/approval/rejection audit fields
--   - seller_id FK to sellers (nullable: PLATFORM products have no seller)
--   - status CHECK constraint + indexes
-- ============================================================

-- 1. New columns
ALTER TABLE "products"
    ADD COLUMN IF NOT EXISTS "listingType"      "ListingType" NOT NULL DEFAULT 'PLATFORM',
    ADD COLUMN IF NOT EXISTS "digitalContent"   TEXT,
    ADD COLUMN IF NOT EXISTS "autoDelivery"     BOOLEAN     NOT NULL DEFAULT true,
    ADD COLUMN IF NOT EXISTS "minDeliverySeconds" INTEGER    NOT NULL DEFAULT 60,
    ADD COLUMN IF NOT EXISTS "maxDeliverySeconds" INTEGER    NOT NULL DEFAULT 86400,
    ADD COLUMN IF NOT EXISTS "status"           TEXT        NOT NULL DEFAULT 'ACTIVE',
    ADD COLUMN IF NOT EXISTS "images"           TEXT[]      NOT NULL DEFAULT '{}'::text[],
    ADD COLUMN IF NOT EXISTS "sellerId"         UUID,
    ADD COLUMN IF NOT EXISTS "approvedById"     UUID,
    ADD COLUMN IF NOT EXISTS "approvedAt"       TIMESTAMP,
    ADD COLUMN IF NOT EXISTS "rejectedById"     UUID,
    ADD COLUMN IF NOT EXISTS "rejectedAt"       TIMESTAMP,
    ADD COLUMN IF NOT EXISTS "rejectedReason"   TEXT,
    ADD COLUMN IF NOT EXISTS "deletedAt"        TIMESTAMP;

-- 2. CHECK constraint for product.status
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'products_status_check'
    ) THEN
        ALTER TABLE "products"
            ADD CONSTRAINT "products_status_check"
            CHECK (status = ANY (ARRAY[
                'PENDING_REVIEW'::text,
                'ACTIVE'::text,
                'REJECTED'::text,
                'DELETED'::text
            ]));
    END IF;
END $$;

-- 3. FK products.sellerId -> sellers.id (SET NULL on seller delete)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'products_sellerId_fkey') THEN
        ALTER TABLE "products"
            ADD CONSTRAINT "products_sellerId_fkey"
            FOREIGN KEY ("sellerId") REFERENCES "sellers"("id") ON DELETE SET NULL;
    END IF;
END $$;

-- 4. Indexes
CREATE INDEX IF NOT EXISTS "products_sellerId_idx"           ON "products"("sellerId");
CREATE INDEX IF NOT EXISTS "products_sellerId_status_idx"    ON "products"("sellerId", status);
CREATE INDEX IF NOT EXISTS "products_listingType_idx"        ON "products"("listingType");
CREATE INDEX IF NOT EXISTS products_status_idx               ON "products"(status);
CREATE INDEX IF NOT EXISTS "products_isFeatured_isActive_idx" ON "products"("isFeatured", "isActive");
CREATE INDEX IF NOT EXISTS "products_brandId_isActive_idx"   ON "products"("brandId", "isActive");
CREATE INDEX IF NOT EXISTS "products_stock_isActive_idx"     ON "products"(stock, "isActive");
CREATE INDEX IF NOT EXISTS "products_categoryId_isActive_sortOrder_idx"
    ON "products"("categoryId", "isActive", "sortOrder");
CREATE INDEX IF NOT EXISTS "products_slug_idx"               ON "products"(slug);
CREATE UNIQUE INDEX IF NOT EXISTS "products_slug_key"         ON "products"(slug);

-- 5. Trigger: touch updatedAt
DROP TRIGGER IF EXISTS trg_touch_products ON "products";
CREATE TRIGGER trg_touch_products
    BEFORE UPDATE ON "products"
    FOR EACH ROW
    EXECUTE FUNCTION touch_updated_at();

-- 6. Stock sync helper (used by product_keys trigger)
CREATE OR REPLACE FUNCTION public.sync_product_stock(p_product uuid)
RETURNS void
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
    UPDATE public.products SET "stock" = (
        SELECT COUNT(*)::int FROM public.product_keys k
        WHERE k."productId" = p_product AND k."isUsed" = false AND k."reservedAt" IS NULL
    ) WHERE "id" = p_product;
END;
$function$;

CREATE OR REPLACE FUNCTION public.trg_sync_product_stock()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
    IF TG_OP = 'DELETE' THEN
        PERFORM public.sync_product_stock(OLD."productId");
        RETURN OLD;
    END IF;
    PERFORM public.sync_product_stock(NEW."productId");
    RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS trg_stock_sync ON "product_keys";
CREATE TRIGGER trg_stock_sync
    AFTER INSERT OR UPDATE OR DELETE ON "product_keys"
    FOR EACH ROW
    EXECUTE FUNCTION trg_sync_product_stock();

-- ============================================================
-- RLS — products: read-by-active, write via admin only
-- (Public reads only see isActive=true items; admin sees all;
--  seller-side writes flow through PLATFORM listing rows.)
-- ============================================================

ALTER TABLE "products" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS products_read ON "products";
CREATE POLICY products_read ON "products"
    FOR SELECT
    USING ("isActive" = true);

DROP POLICY IF EXISTS products_admin_write ON "products";
CREATE POLICY products_admin_write ON "products"
    FOR ALL
    USING (is_admin(auth.uid()))
    WITH CHECK (is_admin(auth.uid()));

-- ============================================================
-- RLS — product_keys: admin-only (delivery happens server-side)
-- ============================================================

ALTER TABLE "product_keys" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS product_keys_admin_all ON "product_keys";
CREATE POLICY product_keys_admin_all ON "product_keys"
    FOR ALL
    USING (is_admin())
    WITH CHECK (is_admin());
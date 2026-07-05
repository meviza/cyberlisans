-- ============================================
-- 0003_marketplace_core — reverse-engineered snapshot
-- ============================================
-- DO NOT edit directly — this file was generated from the live DB
-- after Supabase SQL Editor bypass. If you need schema changes,
-- create a new migration instead.

-- ============================================================
-- ENUMS
-- ============================================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ListingType') THEN
        CREATE TYPE "ListingType" AS ENUM ('PLATFORM', 'SELLER');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'KycStatus') THEN
        CREATE TYPE "KycStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED', 'EXPIRED');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'SellerStatus') THEN
        CREATE TYPE "SellerStatus" AS ENUM ('PENDING', 'APPROVED', 'SUSPENDED', 'REJECTED');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'SellerPayoutStatus') THEN
        CREATE TYPE "SellerPayoutStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'REJECTED');
    END IF;
END $$;

-- ============================================================
-- TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS "sellers" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "taxId" TEXT NOT NULL,
    "taxOffice" TEXT,
    "address" TEXT,
    "phone" TEXT,
    "websiteUrl" TEXT,
    "logoUrl" TEXT,
    "bio" TEXT,
    "commissionRate" NUMERIC(5,2) NOT NULL DEFAULT 12.00,
    "balance" NUMERIC(18,2) NOT NULL DEFAULT 0,
    "pendingBalance" NUMERIC(18,2) NOT NULL DEFAULT 0,
    "totalSales" NUMERIC(18,2) NOT NULL DEFAULT 0,
    "totalOrders" INTEGER NOT NULL DEFAULT 0,
    "rating" NUMERIC(3,2) DEFAULT 0,
    "ratingCount" INTEGER NOT NULL DEFAULT 0,
    "status" "SellerStatus" NOT NULL DEFAULT 'PENDING',
    "kycStatus" "KycStatus" NOT NULL DEFAULT 'PENDING',
    "approvedById" UUID,
    "approvedAt" TIMESTAMP,
    "rejectionReason" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sellers_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "sellers_userId_key" UNIQUE ("userId"),
    CONSTRAINT "sellers_slug_key" UNIQUE (slug)
);

CREATE TABLE IF NOT EXISTS "seller_kyc" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "sellerId" UUID NOT NULL,
    "documentType" TEXT NOT NULL,
    "documentNumber" TEXT NOT NULL,
    "documentFrontUrl" TEXT,
    "documentBackUrl" TEXT,
    "selfieUrl" TEXT,
    "addressProofUrl" TEXT,
    "taxCertificateUrl" TEXT,
    "status" "KycStatus" NOT NULL DEFAULT 'PENDING',
    "reviewedById" UUID,
    "reviewedAt" TIMESTAMP,
    "rejectionReason" TEXT,
    "expiresAt" TIMESTAMP,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "seller_kyc_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "seller_kyc_sellerId_key" UNIQUE ("sellerId")
);

CREATE TABLE IF NOT EXISTS "seller_referral_codes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "sellerId" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "productId" UUID,
    "discountPercent" INTEGER NOT NULL DEFAULT 0,
    "maxUses" INTEGER,
    "currentUses" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" TIMESTAMP,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "seller_referral_codes_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "seller_referral_codes_code_key" UNIQUE (code)
);

CREATE TABLE IF NOT EXISTS "seller_payouts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "sellerId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "amount" NUMERIC(18,2) NOT NULL,
    "currency" "Currency" NOT NULL,
    "method" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "status" "SellerPayoutStatus" NOT NULL DEFAULT 'PENDING',
    "processedById" UUID,
    "processedAt" TIMESTAMP,
    "rejectionReason" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "seller_payouts_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "product_listings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "sellerId" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "price" NUMERIC(18,2) NOT NULL,
    "currency" "Currency" NOT NULL DEFAULT 'TRY',
    "stock" INTEGER NOT NULL DEFAULT 0,
    "digitalContent" TEXT,
    "autoDelivery" BOOLEAN NOT NULL DEFAULT true,
    "minDeliverySeconds" INTEGER NOT NULL DEFAULT 60,
    "maxDeliverySeconds" INTEGER NOT NULL DEFAULT 86400,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "totalSold" INTEGER NOT NULL DEFAULT 0,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_listings_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "product_listings_sellerId_productId_key" UNIQUE ("sellerId", "productId")
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE UNIQUE INDEX IF NOT EXISTS "sellers_slug_key" ON "sellers"(slug);
CREATE UNIQUE INDEX IF NOT EXISTS "sellers_userId_key" ON "sellers"("userId");
CREATE INDEX IF NOT EXISTS sellers_slug_idx ON "sellers"(slug);
CREATE INDEX IF NOT EXISTS sellers_status_idx ON "sellers"(status);
CREATE INDEX IF NOT EXISTS "sellers_kycStatus_idx" ON "sellers"("kycStatus");

CREATE INDEX IF NOT EXISTS "seller_payouts_sellerId_idx" ON "seller_payouts"("sellerId");
CREATE INDEX IF NOT EXISTS seller_payouts_status_idx ON "seller_payouts"(status);

CREATE INDEX IF NOT EXISTS "seller_referral_codes_sellerId_idx" ON "seller_referral_codes"("sellerId");
CREATE INDEX IF NOT EXISTS "seller_referral_codes_productId_idx" ON "seller_referral_codes"("productId");
CREATE UNIQUE INDEX IF NOT EXISTS "seller_referral_codes_code_key" ON "seller_referral_codes"(code);

CREATE INDEX IF NOT EXISTS "product_listings_sellerId_idx" ON "product_listings"("sellerId");
CREATE INDEX IF NOT EXISTS "product_listings_productId_idx" ON "product_listings"("productId");
CREATE INDEX IF NOT EXISTS product_listings_active_idx ON "product_listings"("isActive", price);
CREATE UNIQUE INDEX IF NOT EXISTS "product_listings_sellerId_productId_key"
    ON "product_listings"("sellerId", "productId");

-- ============================================================
-- FOREIGN KEYS
-- ============================================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'sellers_userId_fkey') THEN
        ALTER TABLE "sellers"
            ADD CONSTRAINT "sellers_userId_fkey"
            FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'sellers_approvedById_fkey') THEN
        ALTER TABLE "sellers"
            ADD CONSTRAINT "sellers_approvedById_fkey"
            FOREIGN KEY ("approvedById") REFERENCES "users"("id") ON DELETE SET NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'seller_kyc_sellerId_fkey') THEN
        ALTER TABLE "seller_kyc"
            ADD CONSTRAINT "seller_kyc_sellerId_fkey"
            FOREIGN KEY ("sellerId") REFERENCES "sellers"("id") ON DELETE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'seller_kyc_reviewedById_fkey') THEN
        ALTER TABLE "seller_kyc"
            ADD CONSTRAINT "seller_kyc_reviewedById_fkey"
            FOREIGN KEY ("reviewedById") REFERENCES "users"("id") ON DELETE SET NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'seller_payouts_sellerId_fkey') THEN
        ALTER TABLE "seller_payouts"
            ADD CONSTRAINT "seller_payouts_sellerId_fkey"
            FOREIGN KEY ("sellerId") REFERENCES "sellers"("id") ON DELETE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'seller_payouts_userId_fkey') THEN
        ALTER TABLE "seller_payouts"
            ADD CONSTRAINT "seller_payouts_userId_fkey"
            FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'seller_payouts_processedById_fkey') THEN
        ALTER TABLE "seller_payouts"
            ADD CONSTRAINT "seller_payouts_processedById_fkey"
            FOREIGN KEY ("processedById") REFERENCES "users"("id") ON DELETE SET NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'seller_referral_codes_sellerId_fkey') THEN
        ALTER TABLE "seller_referral_codes"
            ADD CONSTRAINT "seller_referral_codes_sellerId_fkey"
            FOREIGN KEY ("sellerId") REFERENCES "sellers"("id") ON DELETE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'seller_referral_codes_productId_fkey') THEN
        ALTER TABLE "seller_referral_codes"
            ADD CONSTRAINT "seller_referral_codes_productId_fkey"
            FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE SET NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'product_listings_sellerId_fkey') THEN
        ALTER TABLE "product_listings"
            ADD CONSTRAINT "product_listings_sellerId_fkey"
            FOREIGN KEY ("sellerId") REFERENCES "sellers"("id") ON DELETE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'product_listings_productId_fkey') THEN
        ALTER TABLE "product_listings"
            ADD CONSTRAINT "product_listings_productId_fkey"
            FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT;
    END IF;
END $$;

-- ============================================================
-- HELPER FUNCTION: is_super_admin
-- ============================================================

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE "supabaseAuthId" = auth.uid() AND role = 'SUPER_ADMIN'
  );
$function$;

-- ============================================================
-- TRIGGERS: touch_updated_at
-- ============================================================

CREATE OR REPLACE FUNCTION public.trg_set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS set_updated_at ON "sellers";
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON "sellers"
    FOR EACH ROW
    EXECUTE FUNCTION trg_set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON "seller_kyc";
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON "seller_kyc"
    FOR EACH ROW
    EXECUTE FUNCTION trg_set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON "seller_payouts";
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON "seller_payouts"
    FOR EACH ROW
    EXECUTE FUNCTION trg_set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON "product_listings";
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON "product_listings"
    FOR EACH ROW
    EXECUTE FUNCTION trg_set_updated_at();

-- ============================================================
-- RLS
-- ============================================================

ALTER TABLE "sellers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "seller_kyc" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "seller_referral_codes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "seller_payouts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "product_listings" ENABLE ROW LEVEL SECURITY;

-- sellers
DROP POLICY IF EXISTS sellers_public_read ON "sellers";
CREATE POLICY sellers_public_read ON "sellers"
    FOR SELECT
    USING (status = 'APPROVED'::"SellerStatus" OR is_admin(auth.uid()));

DROP POLICY IF EXISTS sellers_owner_insert ON "sellers";
CREATE POLICY sellers_owner_insert ON "sellers"
    FOR INSERT
    WITH CHECK (auth.uid() = "userId" OR is_admin(auth.uid()));

DROP POLICY IF EXISTS sellers_owner_update ON "sellers";
CREATE POLICY sellers_owner_update ON "sellers"
    FOR UPDATE
    USING (auth.uid() = "userId" OR is_admin(auth.uid()))
    WITH CHECK (auth.uid() = "userId" OR is_admin(auth.uid()));

DROP POLICY IF EXISTS sellers_admin_delete ON "sellers";
CREATE POLICY sellers_admin_delete ON "sellers"
    FOR DELETE
    USING (is_admin(auth.uid()));

-- seller_kyc: owner or admin
DROP POLICY IF EXISTS seller_kyc_owner ON "seller_kyc";
CREATE POLICY seller_kyc_owner ON "seller_kyc"
    FOR ALL
    USING (EXISTS (
        SELECT 1 FROM sellers s
        WHERE s.id = seller_kyc."sellerId"
          AND s."userId" = auth.uid()
    ) OR is_admin(auth.uid()))
    WITH CHECK (EXISTS (
        SELECT 1 FROM sellers s
        WHERE s.id = seller_kyc."sellerId"
          AND s."userId" = auth.uid()
    ) OR is_admin(auth.uid()));

-- seller_referral_codes
DROP POLICY IF EXISTS src_public_read ON "seller_referral_codes";
CREATE POLICY src_public_read ON "seller_referral_codes"
    FOR SELECT
    USING ("isActive" = true OR EXISTS (
        SELECT 1 FROM sellers s
        WHERE s.id = seller_referral_codes."sellerId"
          AND s."userId" = auth.uid()
    ) OR is_admin(auth.uid()));

DROP POLICY IF EXISTS src_seller_write ON "seller_referral_codes";
CREATE POLICY src_seller_write ON "seller_referral_codes"
    FOR ALL
    USING (EXISTS (
        SELECT 1 FROM sellers s
        WHERE s.id = seller_referral_codes."sellerId"
          AND s."userId" = auth.uid()
    ) OR is_admin(auth.uid()))
    WITH CHECK (EXISTS (
        SELECT 1 FROM sellers s
        WHERE s.id = seller_referral_codes."sellerId"
          AND s."userId" = auth.uid()
    ) OR is_admin(auth.uid()));

-- seller_payouts
DROP POLICY IF EXISTS sp_owner_read ON "seller_payouts";
CREATE POLICY sp_owner_read ON "seller_payouts"
    FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM sellers s
        WHERE s.id = seller_payouts."sellerId"
          AND s."userId" = auth.uid()
    ) OR is_admin(auth.uid()));

DROP POLICY IF EXISTS sp_owner_insert ON "seller_payouts";
CREATE POLICY sp_owner_insert ON "seller_payouts"
    FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM sellers s
        WHERE s.id = seller_payouts."sellerId"
          AND s."userId" = auth.uid()
    ));

DROP POLICY IF EXISTS sp_admin_update ON "seller_payouts";
CREATE POLICY sp_admin_update ON "seller_payouts"
    FOR UPDATE
    USING (is_admin(auth.uid()))
    WITH CHECK (is_admin(auth.uid()));

-- product_listings
DROP POLICY IF EXISTS pl_public_read ON "product_listings";
CREATE POLICY pl_public_read ON "product_listings"
    FOR SELECT
    USING ("isActive" = true OR EXISTS (
        SELECT 1 FROM sellers s
        WHERE s.id = product_listings."sellerId"
          AND s."userId" = auth.uid()
    ) OR is_admin(auth.uid()));

DROP POLICY IF EXISTS pl_seller_write ON "product_listings";
CREATE POLICY pl_seller_write ON "product_listings"
    FOR ALL
    USING (EXISTS (
        SELECT 1 FROM sellers s
        WHERE s.id = product_listings."sellerId"
          AND s."userId" = auth.uid()
    ) OR is_admin(auth.uid()))
    WITH CHECK (EXISTS (
        SELECT 1 FROM sellers s
        WHERE s.id = product_listings."sellerId"
          AND s."userId" = auth.uid()
    ) OR is_admin(auth.uid()));
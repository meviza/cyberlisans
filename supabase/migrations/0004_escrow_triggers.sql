-- ============================================
-- 0004_escrow_triggers — reverse-engineered snapshot
-- ============================================================
-- DO NOT edit directly — this file was generated from the live DB
-- after Supabase SQL Editor bypass. If you need schema changes,
-- create a new migration instead.

-- ============================================================
-- ENUMS
-- ============================================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'EscrowStatus') THEN
        CREATE TYPE "EscrowStatus" AS ENUM ('HELD', 'RELEASED', 'REFUNDED', 'DISPUTED');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'DisputeStatus') THEN
        CREATE TYPE "DisputeStatus" AS ENUM ('OPEN', 'INVESTIGATING', 'RESOLVED', 'CLOSED');
    END IF;
END $$;

-- ============================================================
-- TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS "escrow_transactions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "orderId" UUID NOT NULL,
    "sellerId" UUID NOT NULL,
    "customerId" UUID NOT NULL,
    "amount" NUMERIC(18,2) NOT NULL,
    "sellerAmount" NUMERIC(18,2) NOT NULL,
    "commissionAmount" NUMERIC(18,2) NOT NULL,
    "currency" "Currency" NOT NULL,
    "status" "EscrowStatus" NOT NULL DEFAULT 'HELD',
    "heldAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "releaseAt" TIMESTAMP,
    "releasedAt" TIMESTAMP,
    "refundedAt" TIMESTAMP,
    "releaseReason" TEXT,
    "paymentId" UUID,
    "metadata" JSONB,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "escrow_transactions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "disputes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "escrowId" UUID NOT NULL,
    "orderId" UUID NOT NULL,
    "openedById" UUID NOT NULL,
    "openedByRole" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "DisputeStatus" NOT NULL DEFAULT 'OPEN',
    "resolution" TEXT,
    "resolvedById" UUID,
    "resolvedAt" TIMESTAMP,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "disputes_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "disputes_openedByRole_check"
        CHECK ("openedByRole" = ANY (ARRAY['CUSTOMER'::text, 'SELLER'::text])),
    CONSTRAINT "disputes_resolution_check"
        CHECK (resolution = ANY (ARRAY['REFUND'::text, 'RELEASE'::text, 'SPLIT'::text]))
);

CREATE TABLE IF NOT EXISTS "dispute_messages" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "disputeId" UUID NOT NULL,
    "senderId" UUID,
    "senderRole" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "attachmentUrl" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dispute_messages_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "dispute_messages_senderRole_check"
        CHECK ("senderRole" = ANY (ARRAY['CUSTOMER'::text, 'SELLER'::text, 'ADMIN'::text]))
);

CREATE TABLE IF NOT EXISTS "commissions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "escrowId" UUID NOT NULL,
    "sellerId" UUID NOT NULL,
    "grossAmount" NUMERIC(18,2) NOT NULL,
    "commissionRate" NUMERIC(5,2) NOT NULL,
    "commissionAmount" NUMERIC(18,2) NOT NULL,
    "netAmount" NUMERIC(18,2) NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "commissions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "payouts" (
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

    CONSTRAINT "payouts_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "reviews" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "orderId" UUID NOT NULL,
    "sellerId" UUID NOT NULL,
    "customerId" UUID NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "sellerReply" TEXT,
    "isVerifiedPurchase" BOOLEAN NOT NULL DEFAULT true,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "reviews_orderId_key" UNIQUE ("orderId"),
    CONSTRAINT "reviews_rating_check" CHECK (rating >= 1 AND rating <= 5)
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS "escrow_transactions_orderId_idx" ON "escrow_transactions"("orderId");
CREATE INDEX IF NOT EXISTS "escrow_transactions_sellerId_idx" ON "escrow_transactions"("sellerId");
CREATE INDEX IF NOT EXISTS "escrow_transactions_customerId_idx" ON "escrow_transactions"("customerId");
CREATE INDEX IF NOT EXISTS "escrow_transactions_releaseAt_idx" ON "escrow_transactions"("releaseAt");
CREATE INDEX IF NOT EXISTS escrow_transactions_status_idx ON "escrow_transactions"(status);

CREATE INDEX IF NOT EXISTS "disputes_escrowId_idx" ON "disputes"("escrowId");
CREATE INDEX IF NOT EXISTS "disputes_orderId_idx" ON "disputes"("orderId");
CREATE INDEX IF NOT EXISTS "disputes_openedById_idx" ON "disputes"("openedById");
CREATE INDEX IF NOT EXISTS disputes_status_idx ON "disputes"(status);

CREATE INDEX IF NOT EXISTS "dispute_messages_disputeId_idx" ON "dispute_messages"("disputeId");

CREATE INDEX IF NOT EXISTS "commissions_escrowId_idx" ON "commissions"("escrowId");
CREATE INDEX IF NOT EXISTS "commissions_sellerId_idx" ON "commissions"("sellerId");

CREATE INDEX IF NOT EXISTS "payouts_sellerId_idx" ON "payouts"("sellerId");
CREATE INDEX IF NOT EXISTS "payouts_userId_idx" ON "payouts"("userId");
CREATE INDEX IF NOT EXISTS payouts_status_idx ON "payouts"(status);

CREATE UNIQUE INDEX IF NOT EXISTS "reviews_orderId_key" ON "reviews"("orderId");
CREATE INDEX IF NOT EXISTS "reviews_sellerId_idx" ON "reviews"("sellerId");
CREATE INDEX IF NOT EXISTS "reviews_customerId_idx" ON "reviews"("customerId");
CREATE INDEX IF NOT EXISTS reviews_public_idx ON "reviews"("isPublic", "createdAt");

-- ============================================================
-- FOREIGN KEYS
-- ============================================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'escrow_transactions_orderId_fkey') THEN
        ALTER TABLE "escrow_transactions"
            ADD CONSTRAINT "escrow_transactions_orderId_fkey"
            FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE RESTRICT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'escrow_transactions_sellerId_fkey') THEN
        ALTER TABLE "escrow_transactions"
            ADD CONSTRAINT "escrow_transactions_sellerId_fkey"
            FOREIGN KEY ("sellerId") REFERENCES "sellers"("id") ON DELETE RESTRICT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'escrow_transactions_customerId_fkey') THEN
        ALTER TABLE "escrow_transactions"
            ADD CONSTRAINT "escrow_transactions_customerId_fkey"
            FOREIGN KEY ("customerId") REFERENCES "users"("id") ON DELETE RESTRICT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'escrow_transactions_paymentId_fkey') THEN
        ALTER TABLE "escrow_transactions"
            ADD CONSTRAINT "escrow_transactions_paymentId_fkey"
            FOREIGN KEY ("paymentId") REFERENCES "payments"("id") ON DELETE SET NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'disputes_escrowId_fkey') THEN
        ALTER TABLE "disputes"
            ADD CONSTRAINT "disputes_escrowId_fkey"
            FOREIGN KEY ("escrowId") REFERENCES "escrow_transactions"("id") ON DELETE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'disputes_orderId_fkey') THEN
        ALTER TABLE "disputes"
            ADD CONSTRAINT "disputes_orderId_fkey"
            FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'disputes_openedById_fkey') THEN
        ALTER TABLE "disputes"
            ADD CONSTRAINT "disputes_openedById_fkey"
            FOREIGN KEY ("openedById") REFERENCES "users"("id") ON DELETE RESTRICT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'disputes_resolvedById_fkey') THEN
        ALTER TABLE "disputes"
            ADD CONSTRAINT "disputes_resolvedById_fkey"
            FOREIGN KEY ("resolvedById") REFERENCES "users"("id") ON DELETE SET NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'dispute_messages_disputeId_fkey') THEN
        ALTER TABLE "dispute_messages"
            ADD CONSTRAINT "dispute_messages_disputeId_fkey"
            FOREIGN KEY ("disputeId") REFERENCES "disputes"("id") ON DELETE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'dispute_messages_senderId_fkey') THEN
        ALTER TABLE "dispute_messages"
            ADD CONSTRAINT "dispute_messages_senderId_fkey"
            FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE SET NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'commissions_escrowId_fkey') THEN
        ALTER TABLE "commissions"
            ADD CONSTRAINT "commissions_escrowId_fkey"
            FOREIGN KEY ("escrowId") REFERENCES "escrow_transactions"("id") ON DELETE RESTRICT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'commissions_sellerId_fkey') THEN
        ALTER TABLE "commissions"
            ADD CONSTRAINT "commissions_sellerId_fkey"
            FOREIGN KEY ("sellerId") REFERENCES "sellers"("id") ON DELETE RESTRICT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'payouts_sellerId_fkey') THEN
        ALTER TABLE "payouts"
            ADD CONSTRAINT "payouts_sellerId_fkey"
            FOREIGN KEY ("sellerId") REFERENCES "sellers"("id") ON DELETE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'payouts_userId_fkey') THEN
        ALTER TABLE "payouts"
            ADD CONSTRAINT "payouts_userId_fkey"
            FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'payouts_processedById_fkey') THEN
        ALTER TABLE "payouts"
            ADD CONSTRAINT "payouts_processedById_fkey"
            FOREIGN KEY ("processedById") REFERENCES "users"("id") ON DELETE SET NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'reviews_orderId_fkey') THEN
        ALTER TABLE "reviews"
            ADD CONSTRAINT "reviews_orderId_fkey"
            FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'reviews_sellerId_fkey') THEN
        ALTER TABLE "reviews"
            ADD CONSTRAINT "reviews_sellerId_fkey"
            FOREIGN KEY ("sellerId") REFERENCES "sellers"("id") ON DELETE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'reviews_customerId_fkey') THEN
        ALTER TABLE "reviews"
            ADD CONSTRAINT "reviews_customerId_fkey"
            FOREIGN KEY ("customerId") REFERENCES "users"("id") ON DELETE CASCADE;
    END IF;
END $$;

-- ============================================================
-- HELPER: is_admin(uid) - takes explicit user id arg
-- ============================================================

CREATE OR REPLACE FUNCTION public.is_admin(uid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path TO 'public', 'pg_temp'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM "users"
    WHERE "id" = uid
      AND "role" IN ('ADMIN','SUPER_ADMIN')
      AND "status" = 'ACTIVE'
  );
$function$;

-- ============================================================
-- ESCROW / DISPUTE / PAYOUT FUNCTIONS (SD)
-- ============================================================

-- open_dispute
CREATE OR REPLACE FUNCTION public.open_dispute(
    p_escrow_id uuid,
    p_opened_by_id uuid,
    p_reason text,
    p_role text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
    v_escrow RECORD;
    v_dispute_id UUID;
BEGIN
    SELECT * INTO v_escrow FROM "escrow_transactions" WHERE "id" = p_escrow_id FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'Escrow not found'; END IF;
    IF v_escrow."status" NOT IN ('HELD','RELEASED') THEN
        RAISE EXCEPTION 'Escrow cannot be disputed (current: %)', v_escrow."status";
    END IF;
    IF p_role NOT IN ('CUSTOMER','SELLER') THEN
        RAISE EXCEPTION 'Invalid role';
    END IF;

    UPDATE "escrow_transactions"
        SET "status" = 'DISPUTED', "updatedAt" = CURRENT_TIMESTAMP
        WHERE "id" = p_escrow_id;

    INSERT INTO "disputes"("escrowId","orderId","openedById","openedByRole","reason","status")
    VALUES (p_escrow_id, v_escrow."orderId", p_opened_by_id, p_role, p_reason, 'OPEN')
    RETURNING "id" INTO v_dispute_id;

    INSERT INTO "audit_logs"("actorId","action","targetType","targetId","payload","createdAt")
    VALUES (p_opened_by_id, 'STATUS_CHANGE', 'escrow', p_escrow_id,
        jsonb_build_object('event','DISPUTE_OPENED','reason',p_reason,'role',p_role),
        CURRENT_TIMESTAMP);

    RETURN jsonb_build_object('success', true, 'disputeId', v_dispute_id);
END;
$function$;

-- refund_escrow (NEW signature: reason, actor_id) - takes priority
CREATE OR REPLACE FUNCTION public.refund_escrow(
    p_escrow_id uuid,
    p_reason text,
    p_actor_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
    v_escrow RECORD;
BEGIN
    SELECT * INTO v_escrow FROM "escrow_transactions" WHERE "id" = p_escrow_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Escrow not found: %', p_escrow_id;
    END IF;
    IF v_escrow."status" NOT IN ('HELD','DISPUTED') THEN
        RAISE EXCEPTION 'Escrow cannot be refunded (current: %)', v_escrow."status";
    END IF;

    UPDATE "escrow_transactions"
        SET "status" = 'REFUNDED',
            "refundedAt" = CURRENT_TIMESTAMP,
            "releaseReason" = p_reason,
            "updatedAt" = CURRENT_TIMESTAMP
        WHERE "id" = p_escrow_id;

    UPDATE "sellers"
        SET "pendingBalance" = "pendingBalance" - v_escrow."sellerAmount",
            "updatedAt" = CURRENT_TIMESTAMP
        WHERE "id" = v_escrow."sellerId";

    UPDATE "orders"
        SET "status" = 'REFUNDED', "refundedAt" = CURRENT_TIMESTAMP, "updatedAt" = CURRENT_TIMESTAMP
        WHERE "id" = v_escrow."orderId";

    IF v_escrow."currency" = 'TRY' THEN
        UPDATE "wallets" SET "balanceTry" = "balanceTry" + v_escrow."amount", "updatedAt" = CURRENT_TIMESTAMP
            WHERE "userId" = v_escrow."customerId";
    ELSIF v_escrow."currency" = 'USD' THEN
        UPDATE "wallets" SET "balanceUsd" = "balanceUsd" + v_escrow."amount", "updatedAt" = CURRENT_TIMESTAMP
            WHERE "userId" = v_escrow."customerId";
    ELSIF v_escrow."currency" = 'EUR' THEN
        UPDATE "wallets" SET "balanceEur" = "balanceEur" + v_escrow."amount", "updatedAt" = CURRENT_TIMESTAMP
            WHERE "userId" = v_escrow."customerId";
    ELSIF v_escrow."currency" = 'USDT' THEN
        UPDATE "wallets" SET "balanceUsdt" = "balanceUsdt" + v_escrow."amount", "updatedAt" = CURRENT_TIMESTAMP
            WHERE "userId" = v_escrow."customerId";
    END IF;

    INSERT INTO "wallet_transactions"("userId","type","currency","amount","balanceAfter","referenceType","referenceId","description","createdAt")
    SELECT v_escrow."customerId", 'REFUND', v_escrow."currency", v_escrow."amount",
        COALESCE((SELECT w.balance_after FROM (
            SELECT CASE v_escrow."currency"
                WHEN 'TRY' THEN "balanceTry" WHEN 'USD' THEN "balanceUsd"
                WHEN 'EUR' THEN "balanceEur" ELSE "balanceUsdt" END AS balance_after
            FROM "wallets" WHERE "userId" = v_escrow."customerId"
        ) w), 0),
        'escrow', p_escrow_id, 'Escrow refund: ' || p_reason, CURRENT_TIMESTAMP;

    INSERT INTO "audit_logs"("actorId","action","targetType","targetId","payload","createdAt")
    VALUES (p_actor_id, 'STATUS_CHANGE', 'escrow', p_escrow_id,
        jsonb_build_object('event','REFUND','reason',p_reason,'amount',v_escrow."amount"),
        CURRENT_TIMESTAMP);

    RETURN jsonb_build_object('success', true, 'escrowId', p_escrow_id, 'status','REFUNDED');
END;
$function$;

-- release_escrow (NEW signature: reason, actor_id) - takes priority
CREATE OR REPLACE FUNCTION public.release_escrow(
    p_escrow_id uuid,
    p_reason text,
    p_actor_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
    v_escrow RECORD;
    v_seller RECORD;
BEGIN
    SELECT * INTO v_escrow FROM "escrow_transactions" WHERE "id" = p_escrow_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Escrow not found: %', p_escrow_id;
    END IF;
    IF v_escrow."status" <> 'HELD' THEN
        RAISE EXCEPTION 'Escrow is not HELD (current: %)', v_escrow."status";
    END IF;

    SELECT * INTO v_seller FROM "sellers" WHERE "id" = v_escrow."sellerId" FOR UPDATE;

    UPDATE "escrow_transactions"
        SET "status" = 'RELEASED',
            "releasedAt" = CURRENT_TIMESTAMP,
            "releaseReason" = p_reason,
            "updatedAt" = CURRENT_TIMESTAMP
        WHERE "id" = p_escrow_id;

    UPDATE "sellers"
        SET "balance" = "balance" + v_escrow."sellerAmount",
            "pendingBalance" = "pendingBalance" - v_escrow."sellerAmount",
            "totalSales" = "totalSales" + v_escrow."amount",
            "totalOrders" = "totalOrders" + 1,
            "updatedAt" = CURRENT_TIMESTAMP
        WHERE "id" = v_escrow."sellerId";

    INSERT INTO "commissions"("escrowId","sellerId","grossAmount","commissionRate","commissionAmount","netAmount")
    VALUES (p_escrow_id, v_escrow."sellerId", v_escrow."amount", v_seller."commissionRate",
            v_escrow."commissionAmount", v_escrow."sellerAmount");

    INSERT INTO "audit_logs"("actorId","action","targetType","targetId","payload","createdAt")
    VALUES (p_actor_id, 'STATUS_CHANGE', 'escrow', p_escrow_id,
        jsonb_build_object('event','RELEASE','reason',p_reason,'amount',v_escrow."amount"),
        CURRENT_TIMESTAMP);

    RETURN jsonb_build_object('success', true, 'escrowId', p_escrow_id, 'status','RELEASED');
END;
$function$;

-- resolve_dispute
CREATE OR REPLACE FUNCTION public.resolve_dispute(
    p_dispute_id uuid,
    p_resolution text,
    p_actor_id uuid,
    p_notes text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
    v_dispute RECORD;
BEGIN
    IF NOT is_admin(p_actor_id) THEN RAISE EXCEPTION 'Only admin can resolve disputes'; END IF;
    IF p_resolution NOT IN ('REFUND','RELEASE','SPLIT') THEN
        RAISE EXCEPTION 'Invalid resolution: %', p_resolution;
    END IF;

    SELECT * INTO v_dispute FROM "disputes" WHERE "id" = p_dispute_id FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'Dispute not found'; END IF;
    IF v_dispute."status" IN ('RESOLVED','CLOSED') THEN
        RAISE EXCEPTION 'Dispute already resolved';
    END IF;

    IF p_resolution = 'REFUND' THEN
        PERFORM refund_escrow(v_dispute."escrowId", 'Dispute resolved: ' || COALESCE(p_notes,'refund'), p_actor_id);
    ELSIF p_resolution = 'RELEASE' THEN
        PERFORM release_escrow(v_dispute."escrowId", 'Dispute resolved: ' || COALESCE(p_notes,'release'), p_actor_id);
    END IF;

    UPDATE "disputes"
        SET "status" = 'RESOLVED',
            "resolution" = p_resolution,
            "resolvedById" = p_actor_id,
            "resolvedAt" = CURRENT_TIMESTAMP,
            "updatedAt" = CURRENT_TIMESTAMP
        WHERE "id" = p_dispute_id;

    INSERT INTO "audit_logs"("actorId","action","targetType","targetId","payload","createdAt")
    VALUES (p_actor_id, 'STATUS_CHANGE', 'dispute', p_dispute_id,
        jsonb_build_object('event','DISPUTE_RESOLVED','resolution',p_resolution,'notes',p_notes),
        CURRENT_TIMESTAMP);

    RETURN jsonb_build_object('success', true, 'resolution', p_resolution);
END;
$function$;

-- request_payout
CREATE OR REPLACE FUNCTION public.request_payout(
    p_seller_id uuid,
    p_amount numeric,
    p_method text,
    p_destination text,
    p_currency "Currency"
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
    v_seller RECORD;
    v_payout_id UUID;
BEGIN
    SELECT * INTO v_seller FROM "sellers" WHERE "id" = p_seller_id FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'Seller not found'; END IF;
    IF v_seller."status" <> 'APPROVED' THEN
        RAISE EXCEPTION 'Seller not approved for payout';
    END IF;
    IF v_seller."balance" < p_amount THEN
        RAISE EXCEPTION 'Insufficient balance (available: %, requested: %)', v_seller."balance", p_amount;
    END IF;
    IF p_amount <= 0 THEN RAISE EXCEPTION 'Invalid amount'; END IF;

    INSERT INTO "payouts"("sellerId","userId","amount","currency","method","destination","status")
    VALUES (p_seller_id, v_seller."userId", p_amount, p_currency, p_method, p_destination, 'PENDING')
    RETURNING "id" INTO v_payout_id;

    INSERT INTO "seller_payouts"("sellerId","userId","amount","currency","method","destination","status")
    VALUES (p_seller_id, v_seller."userId", p_amount, p_currency, p_method, p_destination, 'PENDING');

    UPDATE "sellers" SET "balance" = "balance" - p_amount, "updatedAt" = CURRENT_TIMESTAMP
        WHERE "id" = p_seller_id;

    INSERT INTO "audit_logs"("actorId","action","targetType","targetId","payload","createdAt")
    VALUES (v_seller."userId", 'BALANCE_CHANGE', 'payout', v_payout_id,
        jsonb_build_object('event','PAYOUT_REQUEST','amount',p_amount,'method',p_method),
        CURRENT_TIMESTAMP);

    RETURN jsonb_build_object('success', true, 'payoutId', v_payout_id);
END;
$function$;

-- process_payout
CREATE OR REPLACE FUNCTION public.process_payout(
    p_payout_id uuid,
    p_action text,
    p_actor_id uuid,
    p_notes text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
    v_payout RECORD;
BEGIN
    IF NOT is_admin(p_actor_id) THEN RAISE EXCEPTION 'Only admin can process payouts'; END IF;

    SELECT * INTO v_payout FROM "payouts" WHERE "id" = p_payout_id FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'Payout not found'; END IF;
    IF v_payout."status" <> 'PENDING' THEN
        RAISE EXCEPTION 'Payout already processed (current: %)', v_payout."status";
    END IF;

    IF p_action = 'APPROVE' THEN
        UPDATE "payouts"
            SET "status" = 'COMPLETED',
                "processedById" = p_actor_id,
                "processedAt" = CURRENT_TIMESTAMP,
                "notes" = p_notes,
                "updatedAt" = CURRENT_TIMESTAMP
            WHERE "id" = p_payout_id;
        UPDATE "seller_payouts"
            SET "status" = 'COMPLETED',
                "processedById" = p_actor_id,
                "processedAt" = CURRENT_TIMESTAMP,
                "notes" = p_notes,
                "updatedAt" = CURRENT_TIMESTAMP
            WHERE "sellerId" = v_payout."sellerId" AND "status" = 'PENDING';

        INSERT INTO "audit_logs"("actorId","action","targetType","targetId","payload","createdAt")
        VALUES (p_actor_id, 'BALANCE_CHANGE', 'payout', p_payout_id,
            jsonb_build_object('event','PAYOUT_COMPLETED','amount',v_payout."amount"),
            CURRENT_TIMESTAMP);
        RETURN jsonb_build_object('success', true, 'status','COMPLETED');

    ELSIF p_action = 'REJECT' THEN
        UPDATE "payouts"
            SET "status" = 'REJECTED',
                "processedById" = p_actor_id,
                "processedAt" = CURRENT_TIMESTAMP,
                "rejectionReason" = p_notes,
                "updatedAt" = CURRENT_TIMESTAMP
            WHERE "id" = p_payout_id;
        UPDATE "seller_payouts"
            SET "status" = 'REJECTED',
                "processedById" = p_actor_id,
                "processedAt" = CURRENT_TIMESTAMP,
                "rejectionReason" = p_notes,
                "updatedAt" = CURRENT_TIMESTAMP
            WHERE "sellerId" = v_payout."sellerId" AND "status" = 'PENDING';

        UPDATE "sellers" SET "balance" = "balance" + v_payout."amount", "updatedAt" = CURRENT_TIMESTAMP
            WHERE "id" = v_payout."sellerId";

        INSERT INTO "audit_logs"("actorId","action","targetType","targetId","payload","createdAt")
        VALUES (p_actor_id, 'BALANCE_CHANGE', 'payout', p_payout_id,
            jsonb_build_object('event','PAYOUT_REJECTED','amount',v_payout."amount","reason",p_notes),
            CURRENT_TIMESTAMP);
        RETURN jsonb_build_object('success', true, 'status','REJECTED');
    ELSE
        RAISE EXCEPTION 'Invalid action: % (use APPROVE or REJECT)', p_action;
    END IF;
END;
$function$;

-- commission_calculate (immutable sql helper)
CREATE OR REPLACE FUNCTION public.commission_calculate(p_gross numeric, p_rate numeric)
RETURNS jsonb
LANGUAGE sql
IMMUTABLE
SET search_path TO 'public', 'pg_temp'
AS $function$
  SELECT jsonb_build_object(
    'gross', p_gross,
    'rate', p_rate,
    'commission', ROUND(p_gross * p_rate / 100, 2),
    'net', ROUND(p_gross - (p_gross * p_rate / 100), 2)
  );
$function$;

-- generate_order_number
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS text
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
    v_date TEXT := to_char(now() AT TIME ZONE 'UTC', 'YYYYMMDD');
    v_seq INT;
BEGIN
    SELECT COALESCE(MAX(CAST(substring("orderNumber" from 9) AS INT)), 0) + 1
        INTO v_seq FROM "orders"
        WHERE "orderNumber" LIKE v_date || '-%';
    RETURN v_date || '-' || lpad(v_seq::text, 4, '0');
END;
$function$;

-- ============================================================
-- SELLER RATING AGGREGATE (used by reviews trigger)
-- ============================================================

CREATE OR REPLACE FUNCTION public.update_seller_rating(p_seller_id uuid)
RETURNS void
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
    UPDATE "sellers" s
        SET "rating" = COALESCE((SELECT AVG(r."rating")::NUMERIC(3,2) FROM "reviews" r
                                  WHERE r."sellerId" = p_seller_id AND r."isPublic" = true), 0),
            "ratingCount" = COALESCE((SELECT COUNT(*) FROM "reviews" r
                                      WHERE r."sellerId" = p_seller_id AND r."isPublic" = true), 0),
            "updatedAt" = CURRENT_TIMESTAMP
        WHERE s."id" = p_seller_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.trg_reviews_rating()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
    IF TG_OP = 'DELETE' THEN
        PERFORM update_seller_rating(OLD."sellerId");
        RETURN OLD;
    END IF;
    PERFORM update_seller_rating(NEW."sellerId");
    RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS reviews_rating_trg ON "reviews";
CREATE TRIGGER reviews_rating_trg
    AFTER INSERT OR UPDATE OR DELETE ON "reviews"
    FOR EACH ROW
    EXECUTE FUNCTION trg_reviews_rating();

-- ============================================================
-- TOUCH_UPDATED_AT TRIGGERS (escrow, disputes, payouts)
-- ============================================================

DROP TRIGGER IF EXISTS set_updated_at ON "escrow_transactions";
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON "escrow_transactions"
    FOR EACH ROW
    EXECUTE FUNCTION trg_set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON "disputes";
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON "disputes"
    FOR EACH ROW
    EXECUTE FUNCTION trg_set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON "payouts";
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON "payouts"
    FOR EACH ROW
    EXECUTE FUNCTION trg_set_updated_at();

-- ============================================================
-- RLS
-- ============================================================

ALTER TABLE "escrow_transactions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "disputes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "dispute_messages" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "commissions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "payouts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "reviews" ENABLE ROW LEVEL SECURITY;

-- escrow_transactions
DROP POLICY IF EXISTS escrow_party_read ON "escrow_transactions";
CREATE POLICY escrow_party_read ON "escrow_transactions"
    FOR SELECT
    USING (auth.uid() = "customerId" OR EXISTS (
        SELECT 1 FROM sellers s
        WHERE s.id = escrow_transactions."sellerId"
          AND s."userId" = auth.uid()
    ) OR is_admin(auth.uid()));

DROP POLICY IF EXISTS escrow_admin_write ON "escrow_transactions";
CREATE POLICY escrow_admin_write ON "escrow_transactions"
    FOR ALL
    USING (is_admin(auth.uid()))
    WITH CHECK (is_admin(auth.uid()));

-- disputes
DROP POLICY IF EXISTS disputes_party_read ON "disputes";
CREATE POLICY disputes_party_read ON "disputes"
    FOR SELECT
    USING (auth.uid() = "openedById" OR EXISTS (
        SELECT 1 FROM (escrow_transactions e JOIN sellers s ON s.id = e."sellerId")
        WHERE e.id = disputes."escrowId"
          AND s."userId" = auth.uid()
    ) OR is_admin(auth.uid()));

DROP POLICY IF EXISTS disputes_party_insert ON "disputes";
CREATE POLICY disputes_party_insert ON "disputes"
    FOR INSERT
    WITH CHECK (auth.uid() = "openedById" AND EXISTS (
        SELECT 1 FROM escrow_transactions e
        WHERE e.id = disputes."escrowId"
          AND (e."customerId" = auth.uid() OR EXISTS (
              SELECT 1 FROM sellers s
              WHERE s.id = e."sellerId" AND s."userId" = auth.uid()
          ))
    ));

DROP POLICY IF EXISTS disputes_admin_update ON "disputes";
CREATE POLICY disputes_admin_update ON "disputes"
    FOR UPDATE
    USING (is_admin(auth.uid()))
    WITH CHECK (is_admin(auth.uid()));

-- dispute_messages
DROP POLICY IF EXISTS dm_party_read ON "dispute_messages";
CREATE POLICY dm_party_read ON "dispute_messages"
    FOR SELECT
    USING ((auth.uid() = "senderId") OR EXISTS (
        SELECT 1 FROM ((disputes d
            LEFT JOIN escrow_transactions e ON e.id = d."escrowId")
            LEFT JOIN sellers s ON s.id = e."sellerId")
        WHERE d.id = dispute_messages."disputeId"
          AND (d."openedById" = auth.uid()
               OR s."userId" = auth.uid()
               OR e."customerId" = auth.uid())
    ) OR is_admin(auth.uid()));

DROP POLICY IF EXISTS dm_party_insert ON "dispute_messages";
CREATE POLICY dm_party_insert ON "dispute_messages"
    FOR INSERT
    WITH CHECK ((auth.uid() = "senderId") AND EXISTS (
        SELECT 1 FROM ((disputes d
            LEFT JOIN escrow_transactions e ON e.id = d."escrowId")
            LEFT JOIN sellers s ON s.id = e."sellerId")
        WHERE d.id = dispute_messages."disputeId"
          AND (d."openedById" = auth.uid()
               OR s."userId" = auth.uid()
               OR e."customerId" = auth.uid()
               OR is_admin(auth.uid()))
    ));

DROP POLICY IF EXISTS dm_admin_delete ON "dispute_messages";
CREATE POLICY dm_admin_delete ON "dispute_messages"
    FOR DELETE
    USING (is_admin(auth.uid()));

-- commissions
DROP POLICY IF EXISTS commissions_read ON "commissions";
CREATE POLICY commissions_read ON "commissions"
    FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM sellers s
        WHERE s.id = commissions."sellerId"
          AND s."userId" = auth.uid()
    ) OR is_admin(auth.uid()));

DROP POLICY IF EXISTS commissions_admin_write ON "commissions";
CREATE POLICY commissions_admin_write ON "commissions"
    FOR ALL
    USING (is_admin(auth.uid()))
    WITH CHECK (is_admin(auth.uid()));

-- payouts
DROP POLICY IF EXISTS payouts_owner_read ON "payouts";
CREATE POLICY payouts_owner_read ON "payouts"
    FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM sellers s
        WHERE s.id = payouts."sellerId"
          AND s."userId" = auth.uid()
    ) OR is_admin(auth.uid()));

DROP POLICY IF EXISTS payouts_owner_insert ON "payouts";
CREATE POLICY payouts_owner_insert ON "payouts"
    FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM sellers s
        WHERE s.id = payouts."sellerId"
          AND s."userId" = auth.uid()
    ));

DROP POLICY IF EXISTS payouts_admin_update ON "payouts";
CREATE POLICY payouts_admin_update ON "payouts"
    FOR UPDATE
    USING (is_admin(auth.uid()))
    WITH CHECK (is_admin(auth.uid()));

-- reviews
DROP POLICY IF EXISTS reviews_public_read ON "reviews";
CREATE POLICY reviews_public_read ON "reviews"
    FOR SELECT
    USING ("isPublic" = true
           OR auth.uid() = "customerId"
           OR EXISTS (SELECT 1 FROM sellers s
                       WHERE s.id = reviews."sellerId"
                         AND s."userId" = auth.uid())
           OR is_admin(auth.uid()));

DROP POLICY IF EXISTS reviews_customer_insert ON "reviews";
CREATE POLICY reviews_customer_insert ON "reviews"
    FOR INSERT
    WITH CHECK ((auth.uid() = "customerId") AND EXISTS (
        SELECT 1 FROM orders o
        WHERE o.id = reviews."orderId"
          AND o."userId" = auth.uid()
          AND o.status = 'FULFILLED'::"OrderStatus"
    ));

DROP POLICY IF EXISTS reviews_seller_reply ON "reviews";
CREATE POLICY reviews_seller_reply ON "reviews"
    FOR UPDATE
    USING (EXISTS (SELECT 1 FROM sellers s
                   WHERE s.id = reviews."sellerId"
                     AND s."userId" = auth.uid())
           OR is_admin(auth.uid()))
    WITH CHECK (EXISTS (SELECT 1 FROM sellers s
                   WHERE s.id = reviews."sellerId"
                     AND s."userId" = auth.uid())
           OR is_admin(auth.uid()));

DROP POLICY IF EXISTS reviews_admin_delete ON "reviews";
CREATE POLICY reviews_admin_delete ON "reviews"
    FOR DELETE
    USING (is_admin(auth.uid()));
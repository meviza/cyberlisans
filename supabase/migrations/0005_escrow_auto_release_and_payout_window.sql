-- ============================================
-- 0005_escrow_auto_release_and_payout_window — reverse-engineered snapshot
-- ============================================================
-- DO NOT edit directly — this file was generated from the live DB
-- after Supabase SQL Editor bypass. If you need schema changes,
-- create a new migration instead.

-- ============================================================
-- 0005 adds:
--   1. escrow_transactions.payoutEligibleAt (NOT NULL, no default)
--   2. auto_release_escrow() — 7-day cron function
--   3. legacy release_escrow / refund_escrow overloads
--      (kept for back-compat with older callers)
-- ============================================================

-- ============================================================
-- 1. payoutEligibleAt column (NOT NULL — backfill-safe because new column)
-- ============================================================

ALTER TABLE "escrow_transactions"
    ADD COLUMN IF NOT EXISTS "payoutEligibleAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Backfill any NULL rows defensively (should not exist after DEFAULT clause)
UPDATE "escrow_transactions"
   SET "payoutEligibleAt" = COALESCE("releaseAt", CURRENT_TIMESTAMP) + INTERVAL '7 days'
 WHERE "payoutEligibleAt" IS NULL;

-- Tighten: NOT NULL is already in place via DEFAULT-CURRENT_TIMESTAMP.
-- (If you ever drop the DEFAULT, ensure backfill above runs first.)

CREATE INDEX IF NOT EXISTS "escrow_transactions_payoutEligibleAt_idx"
    ON "escrow_transactions"("payoutEligibleAt");

-- ============================================================
-- 2. auto_release_escrow (called by cron — SECURITY DEFINER)
--    Releases HELD escrows whose payoutEligibleAt / releaseAt <= now
-- ============================================================

CREATE OR REPLACE FUNCTION public.auto_release_escrow()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
    released_count integer := 0;
    r record;
BEGIN
    FOR r IN
        SELECT et.id, et."orderId", et."sellerId", et."customerId",
               et."sellerAmount", et."commissionAmount", et."currency"
        FROM escrow_transactions et
        WHERE et.status = 'HELD'
          AND COALESCE(et."releaseAt", et."payoutEligibleAt") IS NOT NULL
          AND COALESCE(et."releaseAt", et."payoutEligibleAt") <= now()
    LOOP
        -- Status transition
        UPDATE escrow_transactions
           SET status = 'RELEASED',
               "releasedAt" = now(),
               "releaseReason" = 'AUTO_RELEASE_7D',
               "updatedAt" = now()
         WHERE id = r.id;

        -- Credit seller balance (move pending -> available)
        UPDATE sellers
           SET balance = balance + r."sellerAmount",
               "totalSales" = "totalSales" + r."sellerAmount",
               "pendingBalance" = GREATEST(0, "pendingBalance" - r."sellerAmount"),
               "updatedAt" = now()
         WHERE id = r."sellerId";

        -- Record commission
        INSERT INTO commissions ("sellerId", "orderId", "escrowId", amount, rate, "currency", "createdAt")
        SELECT r."sellerId", r."orderId", r.id, r."commissionAmount",
               (r."commissionAmount" / NULLIF(r."sellerAmount" + r."commissionAmount", 0)) * 100,
               r."currency", now()
        WHERE r."commissionAmount" > 0
        ON CONFLICT DO NOTHING;

        -- Mark order completed
        UPDATE orders
           SET status = 'COMPLETED',
               "completedAt" = now(),
               "updatedAt" = now()
         WHERE id = r."orderId";

        -- Audit trail
        INSERT INTO audit_logs (id, "userId", action, "entityType", "entityId", metadata, "createdAt")
        VALUES (
            gen_random_uuid(),
            r."customerId",
            'ESCROW_AUTO_RELEASED',
            'escrow_transaction',
            r.id,
            jsonb_build_object(
                'reason','AUTO_RELEASE_7D',
                'sellerAmount', r."sellerAmount",
                'commissionAmount', r."commissionAmount"
            ),
            now()
        );

        released_count := released_count + 1;
    END LOOP;

    RETURN released_count;
END;
$function$;

-- ============================================================
-- 3. Legacy release_escrow / refund_escrow overloads
--    (older callers pass uid-first signature)
-- ============================================================

-- release_escrow(p_escrow_id, p_released_by uuid, p_reason text)
CREATE OR REPLACE FUNCTION public.release_escrow(
    p_escrow_id uuid,
    p_released_by uuid,
    p_reason text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
    r record;
BEGIN
    SELECT et.id, et."orderId", et."sellerId", et."customerId",
           et."sellerAmount", et."commissionAmount", et."currency", et.status
      INTO r
      FROM escrow_transactions et
     WHERE et.id = p_escrow_id
     FOR UPDATE;

    IF r.id IS NULL THEN
        RETURN jsonb_build_object('ok', false, 'error', 'ESCROW_NOT_FOUND');
    END IF;

    IF r.status <> 'HELD' THEN
        RETURN jsonb_build_object('ok', false, 'error', 'ESCROW_NOT_HELD', 'status', r.status);
    END IF;

    UPDATE escrow_transactions
       SET status = 'RELEASED',
           "releasedAt" = now(),
           "releaseReason" = p_reason,
           "updatedAt" = now()
     WHERE id = p_escrow_id;

    UPDATE sellers
       SET balance = balance + r."sellerAmount",
           "totalSales" = "totalSales" + r."sellerAmount",
           "pendingBalance" = GREATEST(0, "pendingBalance" - r."sellerAmount"),
           "updatedAt" = now()
     WHERE id = r."sellerId";

    INSERT INTO commissions ("sellerId", "orderId", "escrowId", amount, rate, "currency", "createdAt")
    VALUES (r."sellerId", r."orderId", r.id, r."commissionAmount",
            (r."commissionAmount" / NULLIF(r."sellerAmount" + r."commissionAmount", 0)) * 100,
            r."currency", now())
    ON CONFLICT DO NOTHING;

    UPDATE orders
       SET status = 'COMPLETED',
           "completedAt" = now(),
           "updatedAt" = now()
     WHERE id = r."orderId";

    INSERT INTO audit_logs (id, "userId", action, "entityType", "entityId", metadata, "createdAt")
    VALUES (
        gen_random_uuid(), p_released_by, 'ESCROW_RELEASED', 'escrow_transaction', p_escrow_id,
        jsonb_build_object('reason', p_reason, 'sellerAmount', r."sellerAmount"),
        now()
    );

    RETURN jsonb_build_object('ok', true, 'escrowId', p_escrow_id);
END;
$function$;

-- refund_escrow(p_escrow_id, p_refunded_by uuid, p_reason text)
CREATE OR REPLACE FUNCTION public.refund_escrow(
    p_escrow_id uuid,
    p_refunded_by uuid,
    p_reason text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
    r record;
BEGIN
    SELECT id, "orderId", "customerId", status
      INTO r
      FROM escrow_transactions
     WHERE id = p_escrow_id
     FOR UPDATE;

    IF r.id IS NULL THEN
        RETURN jsonb_build_object('ok', false, 'error', 'ESCROW_NOT_FOUND');
    END IF;

    IF r.status NOT IN ('HELD','DISPUTED') THEN
        RETURN jsonb_build_object('ok', false, 'error', 'ESCROW_NOT_REFUNDABLE', 'status', r.status);
    END IF;

    UPDATE escrow_transactions
       SET status = 'REFUNDED',
           "refundedAt" = now(),
           "releaseReason" = p_reason,
           "updatedAt" = now()
     WHERE id = p_escrow_id;

    UPDATE orders
       SET status = 'REFUNDED',
           "updatedAt" = now()
     WHERE id = r."orderId";

    INSERT INTO audit_logs (id, "userId", action, "entityType", "entityId", metadata, "createdAt")
    VALUES (
        gen_random_uuid(), p_refunded_by, 'ESCROW_REFUNDED', 'escrow_transaction', p_escrow_id,
        jsonb_build_object('reason', p_reason),
        now()
    );

    RETURN jsonb_build_object('ok', true, 'escrowId', p_escrow_id);
END;
$function$;
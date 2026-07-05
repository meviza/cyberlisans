-- ============================================
-- 0002_security_dashboard — reverse-engineered snapshot
-- ============================================
-- DO NOT edit directly — this file was generated from the live DB
-- after Supabase SQL Editor bypass. If you need schema changes,
-- create a new migration instead.

-- ============================================================
-- TABLES (notifications, support_tickets, support_messages)
-- ============================================================

CREATE TABLE IF NOT EXISTS "notifications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID,
    "channel" TEXT NOT NULL DEFAULT 'inapp',
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "data" JSONB,
    "readAt" TIMESTAMP,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "support_tickets" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "subject" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "priority" TEXT NOT NULL DEFAULT 'NORMAL',
    "assignedToId" UUID,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "support_tickets_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "support_messages" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "ticketId" UUID NOT NULL,
    "senderId" UUID,
    "senderRole" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "support_messages_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "auth_audit" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "op" TEXT NOT NULL,
    "authId" UUID,
    "payload" JSONB,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auth_audit_pkey" PRIMARY KEY ("id")
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS "notifications_userId_createdAt_idx"
    ON "notifications"("userId", "createdAt");

CREATE INDEX IF NOT EXISTS "support_tickets_userId_idx"
    ON "support_tickets"("userId");

CREATE INDEX IF NOT EXISTS "support_messages_ticketId_idx"
    ON "support_messages"("ticketId");

-- ============================================================
-- FOREIGN KEYS
-- ============================================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'support_messages_ticketId_fkey'
    ) THEN
        ALTER TABLE "support_messages"
            ADD CONSTRAINT "support_messages_ticketId_fkey"
            FOREIGN KEY ("ticketId") REFERENCES "support_tickets"("id") ON DELETE CASCADE;
    END IF;
END $$;

-- ============================================================
-- HELPER FUNCTION: touch_updated_at
-- ============================================================

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$function$;

-- ============================================================
-- TRIGGERS (updated_at maintenance)
-- ============================================================

DROP TRIGGER IF EXISTS trg_touch_notifications ON "notifications";
CREATE TRIGGER trg_touch_notifications
    BEFORE UPDATE ON "notifications"
    FOR EACH ROW
    EXECUTE FUNCTION touch_updated_at();

DROP TRIGGER IF EXISTS trg_touch_support_tickets ON "support_tickets";
CREATE TRIGGER trg_touch_support_tickets
    BEFORE UPDATE ON "support_tickets"
    FOR EACH ROW
    EXECUTE FUNCTION touch_updated_at();

DROP TRIGGER IF EXISTS trg_touch_wallets ON "wallets";
CREATE TRIGGER trg_touch_wallets
    BEFORE UPDATE ON "wallets"
    FOR EACH ROW
    EXECUTE FUNCTION touch_updated_at();

DROP TRIGGER IF EXISTS trg_touch_user_credentials ON "user_credentials";
CREATE TRIGGER trg_touch_user_credentials
    BEFORE UPDATE ON "user_credentials"
    FOR EACH ROW
    EXECUTE FUNCTION touch_updated_at();

DROP TRIGGER IF EXISTS trg_touch_user_two_factors ON "user_two_factors";
CREATE TRIGGER trg_touch_user_two_factors
    BEFORE UPDATE ON "user_two_factors"
    FOR EACH ROW
    EXECUTE FUNCTION touch_updated_at();

-- ============================================================
-- HELPER: current_app_user_id (auth.uid -> public.users.id bridge)
-- ============================================================

CREATE OR REPLACE FUNCTION public.current_app_user_id()
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT id FROM public.users WHERE "supabaseAuthId" = auth.uid() LIMIT 1;
$function$;

-- ============================================================
-- VIEW: admin_kpis (security_invoker)
-- ============================================================

CREATE OR REPLACE VIEW public.admin_kpis
WITH (security_invoker = true) AS
SELECT
    (SELECT count(*)::integer FROM users
        WHERE users."createdAt" >= (now() - '7 days'::interval)) AS "newUsers7d",
    (SELECT count(*)::integer FROM users
        WHERE users."createdAt" >= (now() - '30 days'::interval)) AS "newUsers30d",
    (SELECT count(*)::integer FROM orders
        WHERE orders.status = 'PAID'::"OrderStatus"
          AND orders."paidAt" >= (now() - '30 days'::interval)) AS "paidOrders30d",
    (SELECT COALESCE(sum(orders."totalAmount"), 0::numeric) FROM orders
        WHERE orders.status = 'PAID'::"OrderStatus"
          AND orders."paidAt" >= (now() - '30 days'::interval)) AS revenue30d,
    (SELECT count(*)::integer FROM products WHERE products."isActive" = true) AS "activeProducts",
    (SELECT count(*)::integer FROM product_keys WHERE product_keys."isUsed" = false) AS "availableKeys",
    (SELECT count(*)::integer FROM orders WHERE orders.status = 'PENDING'::"OrderStatus") AS "pendingOrders",
    (SELECT count(*)::integer FROM orders
        WHERE orders.status = 'PAID'::"OrderStatus" AND orders."fulfilledAt" IS NULL) AS "paidUnfulfilled",
    (SELECT count(*)::integer FROM dealer_profiles
        WHERE dealer_profiles.status = 'PENDING'::"DealerStatus") AS "pendingDealers",
    (SELECT count(*)::integer FROM payments
        WHERE payments.status = 'PENDING'::"PaymentStatus") AS "pendingPayments";

-- ============================================================
-- VIEW: customer_dashboard_orders (security_invoker)
-- ============================================================

CREATE OR REPLACE VIEW public.customer_dashboard_orders
WITH (security_invoker = true) AS
SELECT
    o.id,
    o."orderNumber",
    o."userId",
    o."totalAmount",
    o.currency,
    o.status,
    o."paymentMethod",
    o."createdAt",
    o."paidAt",
    o."fulfilledAt",
    (SELECT json_agg(json_build_object(
                'productId', oi."productId",
                'productTitle', p.title,
                'productSlug', p.slug,
                'productImage', p."imageUrl",
                'quantity', oi.quantity,
                'unitPrice', oi."unitPrice",
                'totalPrice', oi."totalPrice"
             ) ORDER BY oi.id)
       FROM (order_items oi JOIN products p ON p.id = oi."productId")
       WHERE oi."orderId" = o.id) AS items
FROM orders o;

-- ============================================================
-- VIEW: customer_dashboard_wallet (security_invoker)
-- ============================================================

CREATE OR REPLACE VIEW public.customer_dashboard_wallet
WITH (security_invoker = true) AS
SELECT
    w.id,
    w."userId",
    w."balanceTry",
    w."balanceUsd",
    w."balanceEur",
    w."balanceUsdt",
    w."loyaltyCoins",
    w."updatedAt",
    (SELECT json_agg(row_to_json(t.*) ORDER BY t."createdAt" DESC)
       FROM (
           SELECT wt.id, wt."userId", wt.type, wt.currency, wt.amount,
                  wt."balanceAfter", wt."referenceType", wt."referenceId",
                  wt.description, wt.metadata, wt."createdAt"
             FROM wallet_transactions wt
            WHERE wt."userId" = w."userId"
            ORDER BY wt."createdAt" DESC
            LIMIT 50
       ) t) AS "recentTransactions"
FROM wallets w;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE "notifications" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "support_tickets" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "support_messages" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "auth_audit" ENABLE ROW LEVEL SECURITY;

-- Helper: is_admin (auth-aware)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE "supabaseAuthId" = auth.uid()
      AND role IN ('ADMIN','SUPER_ADMIN')
      AND status = 'ACTIVE'
  );
$function$;

-- notifications: self or admin
DROP POLICY IF EXISTS notifications_self ON "notifications";
CREATE POLICY notifications_self ON "notifications"
    FOR ALL
    USING ("userId" = current_app_user_id() OR is_admin())
    WITH CHECK ("userId" = current_app_user_id() OR is_admin());

-- support_tickets: self or admin
DROP POLICY IF EXISTS tickets_self ON "support_tickets";
CREATE POLICY tickets_self ON "support_tickets"
    FOR ALL
    USING ("userId" = current_app_user_id() OR is_admin())
    WITH CHECK ("userId" = current_app_user_id() OR is_admin());

-- support_messages: party of parent ticket or admin
DROP POLICY IF EXISTS tickets_msg_self ON "support_messages";
CREATE POLICY tickets_msg_self ON "support_messages"
    FOR ALL
    USING (EXISTS (
        SELECT 1 FROM support_tickets t
        WHERE t.id = support_messages."ticketId"
          AND (t."userId" = current_app_user_id() OR is_admin())
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM support_tickets t
        WHERE t.id = support_messages."ticketId"
          AND (t."userId" = current_app_user_id() OR is_admin())
    ));

-- auth_audit: admin only
DROP POLICY IF EXISTS auth_audit_admin_only ON "auth_audit";
CREATE POLICY auth_audit_admin_only ON "auth_audit"
    FOR ALL
    USING (is_admin())
    WITH CHECK (is_admin());
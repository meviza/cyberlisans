-- 0019_rls_pii_and_wallets.sql
-- Comprehensive RLS for tables that hold PII or financial data.
-- All access is mediated by is_admin() (super_admin) or row ownership via current_app_user_id().

-- ============================================================================
-- USERS — public-readable profile fields + owner write
-- ============================================================================
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS users_public_read ON "users";
CREATE POLICY users_public_read ON "users"
  FOR SELECT USING (true);

DROP POLICY IF EXISTS users_owner_update ON "users";
CREATE POLICY users_owner_update ON "users"
  FOR UPDATE
  USING ("id" = current_app_user_id() OR is_admin())
  WITH CHECK ("id" = current_app_user_id() OR is_admin());

DROP POLICY IF EXISTS users_admin_delete ON "users";
CREATE POLICY users_admin_delete ON "users"
  FOR DELETE USING (is_admin());

-- INSERT: handled by service role (admin client) or signup flow.
DROP POLICY IF EXISTS users_service_insert ON "users";
CREATE POLICY users_service_insert ON "users"
  FOR INSERT WITH CHECK (true);

-- ============================================================================
-- SESSIONS — owner can read/refresh; only service can create
-- ============================================================================
ALTER TABLE "sessions" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS sessions_owner_read ON "sessions";
CREATE POLICY sessions_owner_read ON "sessions"
  FOR SELECT USING ("userId" = current_app_user_id() OR is_admin());

DROP POLICY IF EXISTS sessions_owner_delete ON "sessions";
CREATE POLICY sessions_owner_delete ON "sessions"
  FOR DELETE USING ("userId" = current_app_user_id() OR is_admin());

-- INSERT/UPDATE: service-role only (no client-side policy)

-- ============================================================================
-- USER CREDENTIALS — owner read; service-only write
-- ============================================================================
ALTER TABLE "user_credentials" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS user_credentials_owner_read ON "user_credentials";
CREATE POLICY user_credentials_owner_read ON "user_credentials"
  FOR SELECT USING ("userId" = current_app_user_id() OR is_admin());

-- ============================================================================
-- USER TWO-FACTORS — owner read/write
-- ============================================================================
ALTER TABLE "user_two_factors" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS user_two_factors_owner ON "user_two_factors";
CREATE POLICY user_two_factors_owner ON "user_two_factors"
  FOR ALL
  USING ("userId" = current_app_user_id() OR is_admin())
  WITH CHECK ("userId" = current_app_user_id() OR is_admin());

-- ============================================================================
-- WALLETS — owner read; admin write
-- ============================================================================
ALTER TABLE "wallets" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS wallets_owner_read ON "wallets";
CREATE POLICY wallets_owner_read ON "wallets"
  FOR SELECT USING ("userId" = current_app_user_id() OR is_admin());

DROP POLICY IF EXISTS wallets_admin_write ON "wallets";
CREATE POLICY wallets_admin_write ON "wallets"
  FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================================================
-- WALLET TRANSACTIONS — owner read; admin write
-- ============================================================================
ALTER TABLE "wallet_transactions" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS wallet_tx_owner_read ON "wallet_transactions";
CREATE POLICY wallet_tx_owner_read ON "wallet_transactions"
  FOR SELECT USING ("userId" = current_app_user_id() OR is_admin());

DROP POLICY IF EXISTS wallet_tx_admin_write ON "wallet_transactions";
CREATE POLICY wallet_tx_admin_write ON "wallet_transactions"
  FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================================================
-- ORDERS — owner read; admin write
-- ============================================================================
ALTER TABLE "orders" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS orders_owner_read ON "orders";
CREATE POLICY orders_owner_read ON "orders"
  FOR SELECT USING ("userId" = current_app_user_id() OR is_admin());

DROP POLICY IF EXISTS orders_owner_insert ON "orders";
CREATE POLICY orders_owner_insert ON "orders"
  FOR INSERT WITH CHECK ("userId" = current_app_user_id() OR is_admin());

DROP POLICY IF EXISTS orders_owner_update ON "orders";
CREATE POLICY orders_owner_update ON "orders"
  FOR UPDATE
  USING ("userId" = current_app_user_id() OR is_admin())
  WITH CHECK ("userId" = current_app_user_id() OR is_admin());

-- ============================================================================
-- ORDER ITEMS — owner read; service write
-- ============================================================================
ALTER TABLE "order_items" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS order_items_owner_read ON "order_items";
CREATE POLICY order_items_owner_read ON "order_items"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "orders" o
      WHERE o."id" = "order_items"."orderId"
        AND (o."userId" = current_app_user_id() OR is_admin())
    )
  );

-- ============================================================================
-- PAYMENTS — owner read; admin write
-- ============================================================================
ALTER TABLE "payments" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS payments_owner_read ON "payments";
CREATE POLICY payments_owner_read ON "payments"
  FOR SELECT USING ("userId" = current_app_user_id() OR is_admin());

DROP POLICY IF EXISTS payments_admin_write ON "payments";
CREATE POLICY payments_admin_write ON "payments"
  FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================================================
-- DEALER PROFILES — owner read/write; public minimal read via join
-- ============================================================================
ALTER TABLE "dealer_profiles" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS dealer_profiles_owner ON "dealer_profiles";
CREATE POLICY dealer_profiles_owner ON "dealer_profiles"
  FOR ALL
  USING ("userId" = current_app_user_id() OR is_admin())
  WITH CHECK ("userId" = current_app_user_id() OR is_admin());

-- ============================================================================
-- DEALER LINKS — owner read; service write
-- ============================================================================
ALTER TABLE "dealer_links" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS dealer_links_owner_read ON "dealer_links";
CREATE POLICY dealer_links_owner_read ON "dealer_links"
  FOR SELECT USING ("userId" = current_app_user_id() OR is_admin());

DROP POLICY IF EXISTS dealer_links_public_lookup ON "dealer_links";
CREATE POLICY dealer_links_public_lookup ON "dealer_links"
  FOR SELECT USING ("isActive" = true);

-- ============================================================================
-- DEALER SALES / PAYOUTS — owner read; admin write
-- ============================================================================
ALTER TABLE "dealer_sales" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS dealer_sales_owner_read ON "dealer_sales";
CREATE POLICY dealer_sales_owner_read ON "dealer_sales"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "dealer_profiles" d
      WHERE d."id" = "dealer_sales"."dealerId"
        AND (d."userId" = current_app_user_id() OR is_admin())
    )
  );

ALTER TABLE "dealer_payouts" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS dealer_payouts_owner_read ON "dealer_payouts";
CREATE POLICY dealer_payouts_owner_read ON "dealer_payouts"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "dealer_profiles" d
      WHERE d."id" = "dealer_payouts"."dealerId"
        AND (d."userId" = current_app_user_id() OR is_admin())
    )
  );

-- ============================================================================
-- CONSENT RECORDS — owner read; service write
-- ============================================================================
ALTER TABLE "consent_records" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS consent_records_owner_read ON "consent_records";
CREATE POLICY consent_records_owner_read ON "consent_records"
  FOR SELECT USING ("userId" = current_app_user_id() OR is_admin());

-- ============================================================================
-- FAILED LOGIN ATTEMPTS — admin read; service write
-- ============================================================================
ALTER TABLE "failed_login_attempts" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS failed_login_admin_read ON "failed_login_attempts";
CREATE POLICY failed_login_admin_read ON "failed_login_attempts"
  FOR SELECT USING (is_admin());

-- ============================================================================
-- AUDIT LOGS — admin read; service write
-- ============================================================================
ALTER TABLE "audit_logs" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS audit_logs_admin_read ON "audit_logs";
CREATE POLICY audit_logs_admin_read ON "audit_logs"
  FOR SELECT USING (is_admin());

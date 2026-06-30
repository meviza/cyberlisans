-- ENUMS
CREATE TYPE user_role AS ENUM ('CUSTOMER', 'ADMIN', 'SUPER_ADMIN');
CREATE TYPE user_status AS ENUM ('ACTIVE', 'SUSPENDED', 'BANNED', 'PENDING_VERIFICATION');
CREATE TYPE locale_type AS ENUM ('TR', 'EN', 'DE', 'AR', 'RU');
CREATE TYPE currency_type AS ENUM ('TRY', 'USD', 'EUR', 'USDT');
CREATE TYPE wallet_tx_type AS ENUM ('DEPOSIT', 'WITHDRAWAL', 'PURCHASE', 'REFUND', 'ADMIN_CREDIT', 'ADMIN_DEBIT', 'REFERRAL_REWARD', 'LOYALTY_REWARD', 'GIFT_RECEIVED', 'GIFT_SENT');
CREATE TYPE delivery_type AS ENUM ('KEY', 'DOWNLOAD', 'API_CREDITS', 'MANUAL');
CREATE TYPE order_status AS ENUM ('PENDING', 'PAID', 'FULFILLED', 'CANCELLED', 'REFUNDED', 'FAILED');
CREATE TYPE payment_provider AS ENUM ('PAYTR', 'PAPARA', 'NOWPAYMENTS', 'STRIPE', 'BANK_TRANSFER', 'WALLET');
CREATE TYPE payment_status AS ENUM ('PENDING', 'PROCESSING', 'SUCCEEDED', 'FAILED', 'REFUNDED', 'EXPIRED');

-- FUNCTIONS
CREATE OR REPLACE FUNCTION public.is_admin() RETURNS boolean AS $$
  SELECT EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN'));
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.prevent_wallet_tx_update() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'wallet_transactions are immutable';
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.prevent_wallet_tx_delete() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'wallet_transactions are immutable';
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.prevent_audit_update() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'audit_logs are immutable';
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.prevent_audit_delete() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'audit_logs are immutable';
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.prevent_consent_update() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'consent_records are immutable';
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.prevent_consent_delete() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'consent_records are immutable';
END;
$$ LANGUAGE plpgsql;

-- RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY users_self_select ON users FOR SELECT USING (auth.uid() = id OR is_admin());
CREATE POLICY users_self_update ON users FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id AND role = (SELECT role FROM users WHERE id = auth.uid()));
CREATE POLICY users_admin_all ON users FOR ALL USING (is_admin()) WITH CHECK (is_admin());

ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
CREATE POLICY wallets_self_select ON wallets FOR SELECT USING (user_id = auth.uid() OR is_admin());
CREATE POLICY wallets_no_direct_write ON wallets FOR ALL USING (false) WITH CHECK (false);

ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY wallet_tx_select ON wallet_transactions FOR SELECT USING (user_id = auth.uid() OR is_admin());
CREATE POLICY wallet_tx_no_write ON wallet_transactions FOR ALL USING (false) WITH CHECK (false);
CREATE TRIGGER wallet_tx_no_update BEFORE UPDATE ON wallet_transactions FOR EACH ROW EXECUTE FUNCTION prevent_wallet_tx_update();
CREATE TRIGGER wallet_tx_no_delete BEFORE DELETE ON wallet_transactions FOR EACH ROW EXECUTE FUNCTION prevent_wallet_tx_delete();

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY products_public_select ON products FOR SELECT USING (is_active = true);
CREATE POLICY products_admin_all ON products FOR ALL USING (is_admin()) WITH CHECK (is_admin());

ALTER TABLE product_keys ENABLE ROW LEVEL SECURITY;
CREATE POLICY product_keys_self_select ON product_keys FOR SELECT USING (used_by_id = auth.uid() OR is_admin());
CREATE POLICY product_keys_no_write ON product_keys FOR ALL USING (false) WITH CHECK (false);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY orders_self_select ON orders FOR SELECT USING (user_id = auth.uid() OR is_admin());
CREATE POLICY orders_self_insert ON orders FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY orders_admin_update ON orders FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY order_items_select ON order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND (orders.user_id = auth.uid() OR is_admin()))
);
CREATE POLICY order_items_no_write ON order_items FOR ALL USING (false) WITH CHECK (false);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY payments_self_select ON payments FOR SELECT USING (user_id = auth.uid() OR is_admin());
CREATE POLICY payments_self_insert ON payments FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY payments_admin_update ON payments FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY categories_public_select ON categories FOR SELECT USING (is_active = true);
CREATE POLICY categories_admin_all ON categories FOR ALL USING (is_admin()) WITH CHECK (is_admin());

ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
CREATE POLICY brands_public_select ON brands FOR SELECT USING (is_active = true);
CREATE POLICY brands_admin_all ON brands FOR ALL USING (is_admin()) WITH CHECK (is_admin());

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY audit_logs_admin_select ON audit_logs FOR SELECT USING (is_admin());
CREATE POLICY audit_logs_no_write ON audit_logs FOR ALL USING (false) WITH CHECK (false);
CREATE TRIGGER audit_logs_no_update BEFORE UPDATE ON audit_logs FOR EACH ROW EXECUTE FUNCTION prevent_audit_update();
CREATE TRIGGER audit_logs_no_delete BEFORE DELETE ON audit_logs FOR EACH ROW EXECUTE FUNCTION prevent_audit_delete();

ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY sessions_self ON sessions FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY sessions_admin ON sessions FOR ALL USING (is_admin()) WITH CHECK (is_admin());

ALTER TABLE consent_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY consent_self_select ON consent_records FOR SELECT USING (user_id = auth.uid() OR is_admin());
CREATE POLICY consent_insert ON consent_records FOR INSERT WITH CHECK (true);
CREATE TRIGGER consent_no_update BEFORE UPDATE ON consent_records FOR EACH ROW EXECUTE FUNCTION prevent_consent_update();
CREATE TRIGGER consent_no_delete BEFORE DELETE ON consent_records FOR EACH ROW EXECUTE FUNCTION prevent_consent_delete();

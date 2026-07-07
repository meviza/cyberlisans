-- 0020_composite_indexes.sql
-- Composite indexes for common admin/dashboard query patterns.

-- Admin dashboard: orders filtered by status, ordered by createdAt.
CREATE INDEX IF NOT EXISTS "orders_status_createdAt_idx"
  ON "orders"("status", "createdAt" DESC);

-- Admin payout: payments filtered by status & date range.
CREATE INDEX IF NOT EXISTS "payments_status_createdAt_idx"
  ON "payments"("status", "createdAt" DESC);

-- Admin dashboard: orders by user AND status (account detail page).
CREATE INDEX IF NOT EXISTS "orders_userId_status_createdAt_idx"
  ON "orders"("userId", "status", "createdAt" DESC);

-- Product availability lookup: keys belonging to a product, unreserved/available.
CREATE INDEX IF NOT EXISTS "product_keys_productId_isUsed_reservedFor_idx"
  ON "product_keys"("productId", "isUsed", "reservedFor");

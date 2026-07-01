-- FAZ 7A: Audit log immutability trigger
CREATE OR REPLACE FUNCTION prevent_audit_log_modification()
RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'AuditLog is immutable: % operations are not permitted', TG_OP
    USING ERRCODE = 'insufficient_privilege';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS audit_logs_no_update ON "audit_logs";
CREATE TRIGGER audit_logs_no_update
  BEFORE UPDATE ON "audit_logs"
  FOR EACH ROW
  EXECUTE FUNCTION prevent_audit_log_modification();

DROP TRIGGER IF EXISTS audit_logs_no_delete ON "audit_logs";
CREATE TRIGGER audit_logs_no_delete
  BEFORE DELETE ON "audit_logs"
  FOR EACH ROW
  EXECUTE FUNCTION prevent_audit_log_modification();

DROP TRIGGER IF EXISTS audit_logs_no_truncate ON "audit_logs";
CREATE TRIGGER audit_logs_no_truncate
  BEFORE TRUNCATE ON "audit_logs"
  FOR EACH STATEMENT
  EXECUTE FUNCTION prevent_audit_log_modification();

CREATE TABLE IF NOT EXISTS "failed_login_attempts" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "email" TEXT NOT NULL,
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "attemptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lockedUntil" TIMESTAMP(3)
);

CREATE INDEX IF NOT EXISTS "failed_login_attempts_email_attemptedAt_idx"
  ON "failed_login_attempts"("email", "attemptedAt");
CREATE INDEX IF NOT EXISTS "failed_login_attempts_ipAddress_attemptedAt_idx"
  ON "failed_login_attempts"("ipAddress", "attemptedAt");

CREATE TABLE IF NOT EXISTS "user_two_factors" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL UNIQUE,
  "secretCipher" TEXT NOT NULL,
  "backupCodesHash" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "enabled" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_two_factors_userId_fkey'
  ) THEN
    ALTER TABLE "user_two_factors"
      ADD CONSTRAINT "user_two_factors_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE;
  END IF;
END $$;
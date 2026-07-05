-- ============================================
-- 0016_secret_log_immutable.sql
-- M5.1 fix: append-only audit log trigger
-- ============================================

DROP TRIGGER IF EXISTS secret_rotation_log_no_update ON public.secret_rotation_log;
CREATE TRIGGER secret_rotation_log_no_update
  BEFORE UPDATE OR DELETE ON public.secret_rotation_log
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_audit_log_modification();
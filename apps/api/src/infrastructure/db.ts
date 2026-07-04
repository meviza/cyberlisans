export { supabase, supabaseAdmin, dbError } from './supabase-db';
import { supabase as _supabase } from './supabase-db';
export const prisma: any = _supabase;
export type { SupabaseClient } from '@supabase/supabase-js';

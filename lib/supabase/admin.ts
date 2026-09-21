import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/database.types';

export type TypedAdminClient = ReturnType<typeof createSupabaseClient<Database>>;

/**
 * Creates an administrative Supabase client using SUPABASE_SERVICE_ROLE_KEY.
 * STRICTLY SERVER-ONLY per ADR-011 and AGENTS.md Hard Constraints.
 * Never import into files reachable by client components.
 */
export function createAdminClient(): TypedAdminClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment');
  }

  return createSupabaseClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

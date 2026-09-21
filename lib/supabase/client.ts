import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/database.types';

export type TypedSupabaseClient = SupabaseClient<Database, 'public', 'public', Database['public']>;

/**
 * Creates a Supabase client for client components.
 * Scoped to the anon key and user JWT; respects RLS.
 */
export function createClient(): TypedSupabaseClient {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  ) as unknown as TypedSupabaseClient;
}

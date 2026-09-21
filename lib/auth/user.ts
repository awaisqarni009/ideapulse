import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/database.types';
import type { User } from '@supabase/supabase-js';

export type ProfileRow = Database['public']['Tables']['profiles']['Row'];

export interface CurrentUserResult {
  user: User | null;
  profile: ProfileRow | null;
  isWritable: boolean;
  isAdmin: boolean;
  isConfirmed: boolean;
}

/**
 * Server-side helper to retrieve the authenticated user along with their full profile.
 * Carries the user's session cookies and respects RLS (ADR-011).
 */
export async function getCurrentUser(): Promise<CurrentUserResult> {
  const supabase = await createClient();

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        user: null,
        profile: null,
        isWritable: false,
        isAdmin: false,
        isConfirmed: false,
      };
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    const isConfirmed = !!user.email_confirmed_at;
    const isSuspended =
      profile?.status === 'suspended' ||
      (profile?.suspended_until && new Date(profile.suspended_until) > new Date());

    const isWritable = isConfirmed && profile?.status === 'active' && !isSuspended;

    const isAdmin = profile?.role === 'admin' || profile?.role === 'moderator';

    return {
      user,
      profile: profile || null,
      isWritable,
      isAdmin,
      isConfirmed,
    };
  } catch (err) {
    console.error('[getCurrentUser] Error retrieving user profile:', err);
    return {
      user: null,
      profile: null,
      isWritable: false,
      isAdmin: false,
      isConfirmed: false,
    };
  }
}

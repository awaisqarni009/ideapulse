'use client';

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/lib/database.types';
import type { User } from '@supabase/supabase-js';

export type ProfileRow = Database['public']['Tables']['profiles']['Row'];

export interface UserContextValue {
  user: User | null;
  profile: ProfileRow | null;
  isLoading: boolean;
  isConfirmed: boolean;
  isWritable: boolean;
  isAdmin: boolean;
  refresh: () => Promise<void>;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

export function UserProvider({
  children,
  initialUser = null,
  initialProfile = null,
}: {
  children: React.ReactNode;
  initialUser?: User | null;
  initialProfile?: ProfileRow | null;
}) {
  const [user, setUser] = useState<User | null>(initialUser);
  const [profile, setProfile] = useState<ProfileRow | null>(initialProfile);
  const [isLoading, setIsLoading] = useState(!initialUser);

  const supabase = useMemo(() => createClient(), []);

  const fetchProfile = useCallback(
    async (userId: string) => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (!error && data) {
          setProfile(data);
        } else {
          setProfile(null);
        }
      } catch {
        setProfile(null);
      }
    },
    [supabase],
  );

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      setUser(currentUser);
      if (currentUser) {
        await fetchProfile(currentUser.id);
      } else {
        setProfile(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, [supabase, fetchProfile]);

  useEffect(() => {
    // Initial fetch if not provided from server component
    if (!initialUser) {
      refresh();
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      const authUser = session?.user ?? null;
      setUser(authUser);

      if (authUser) {
        await fetchProfile(authUser.id);
      } else {
        setProfile(null);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, fetchProfile, initialUser, refresh]);

  const isConfirmed = !!user?.email_confirmed_at;
  const isSuspended =
    profile?.status === 'suspended' ||
    (profile?.suspended_until ? new Date(profile.suspended_until) > new Date() : false);

  const isWritable = isConfirmed && profile?.status === 'active' && !isSuspended;

  const isAdmin = profile?.role === 'admin' || profile?.role === 'moderator';

  return (
    <UserContext.Provider
      value={{
        user,
        profile,
        isLoading,
        isConfirmed,
        isWritable,
        isAdmin,
        refresh,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

/**
 * Client hook returning the authenticated user session plus their complete profile row [T-2.14].
 */
export function useUser(): UserContextValue {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

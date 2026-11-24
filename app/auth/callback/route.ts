import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Route Handler: /auth/callback (T-2.7)
 * Exchanges auth codes from email confirmations, magic links, and OAuth flows
 * for an active user session using @supabase/ssr.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabase = await createClient();
    const { data: sessionData, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Sync Google / Facebook metadata (name and avatar) into public.profiles
      if (sessionData?.user) {
        const meta = sessionData.user.user_metadata || {};
        const fullName = meta.full_name || meta.name || '';
        const avatarUrl = meta.avatar_url || meta.picture || '';

        if (fullName || avatarUrl) {
          try {
            await supabase
              .from('profiles')
              .update({
                ...(fullName ? { display_name: fullName } : {}),
                ...(avatarUrl ? { avatar_url: avatarUrl } : {}),
              })
              .eq('id', sessionData.user.id);
          } catch (syncErr) {
            console.warn('[auth/callback] Profile sync error:', syncErr);
          }
        }
      }

      // Prevent open redirect vulnerabilities
      const safeDestination = next.startsWith('/') && !next.startsWith('//') ? next : '/';
      return NextResponse.redirect(`${origin}${safeDestination}`);
    }
    console.error('[auth/callback] Code exchange error:', error.message);
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}

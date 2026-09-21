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
  const next = searchParams.get('next') ?? '/auth/confirm';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Prevent open redirect vulnerabilities
      const safeDestination =
        next.startsWith('/') && !next.startsWith('//') ? next : '/auth/confirm';
      return NextResponse.redirect(`${origin}${safeDestination}`);
    }
    console.error('[auth/callback] Code exchange error:', error.message);
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}

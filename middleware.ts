import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

/**
 * Root Next.js middleware (T-2.2).
 * - Refreshes Supabase session on every request.
 * - Enforces route guards for /submit and /settings.
 * - Rewrites unauthorized /admin/* requests to 404 to prevent endpoint enumeration.
 */
export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const { supabaseResponse, user, supabase } = await updateSession(request);

  // 1. Protected routes requiring authentication (/submit, /settings)
  const isProtectedRoute = pathname.startsWith('/submit') || pathname.startsWith('/settings');

  if (isProtectedRoute && !user) {
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('next', `${pathname}${search}`);
    return NextResponse.redirect(redirectUrl);
  }

  // 2. Admin routes (/admin/*) — rewrite to 404 for non-admins to prevent route discovery
  if (pathname.startsWith('/admin')) {
    if (!user) {
      return NextResponse.rewrite(new URL('/404', request.url));
    }

    const { data: profile } = (await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()) as { data: { role: string } | null };

    if (!profile || (profile.role !== 'admin' && profile.role !== 'moderator')) {
      return NextResponse.rewrite(new URL('/404', request.url));
    }
  }

  // 3. Auth pages (/login, /register) — redirect logged-in users to feed
  const isAuthPage = pathname === '/login' || pathname === '/register';
  if (isAuthPage && user) {
    const nextParam = request.nextUrl.searchParams.get('next');
    const destination = nextParam && nextParam.startsWith('/') ? nextParam : '/feed';
    return NextResponse.redirect(new URL(destination, request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, dev/tokens, robots.txt, sitemap.xml
     * - static image formats (svg, png, jpg, jpeg, gif, webp)
     */
    '/((?!_next/static|_next/image|favicon.ico|dev/tokens|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

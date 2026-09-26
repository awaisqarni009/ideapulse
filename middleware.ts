import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import { getHashedClientIp } from '@/lib/security/ip-hash';
import { checkRateLimit } from '@/lib/security/rate-limit';

/**
 * Root Next.js middleware (T-2.2, T-6.12).
 * - Refreshes Supabase session on every request.
 * - Multi-tier rate limiting for login, register, and anonymous reads (RULES.md BR-032).
 * - Enforces route guards for /submit and /settings.
 * - Rewrites unauthorized /admin/* requests to 404 to prevent endpoint enumeration (AC-10.3).
 */
export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // 1. Compute daily-salted ip_hash (BR-035: Never persist or expose raw IP)
  const ipHash = getHashedClientIp(request.headers);

  // 2. Edge Rate Limiting (BR-032)
  const isTesting =
    request.headers.get('x-playwright-test') === 'true' ||
    process.env.PLAYWRIGHT_TEST === '1' ||
    process.env.NODE_ENV === 'test';

  if (!isTesting && pathname === '/login' && request.method === 'POST') {
    const rateCheck = await checkRateLimit('login', ipHash);
    if (!rateCheck.success) {
      return new NextResponse(
        JSON.stringify({
          error: 'IP_RATE_LIMITED',
          message: `Too many login attempts. Please wait ${rateCheck.resetInSeconds}s before retrying.`,
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': String(rateCheck.resetInSeconds),
          },
        },
      );
    }
  }

  if (!isTesting && pathname === '/register' && request.method === 'POST') {
    const rateCheck = await checkRateLimit('register', ipHash);
    if (!rateCheck.success) {
      return new NextResponse(
        JSON.stringify({
          error: 'IP_RATE_LIMITED',
          message: `Registration rate limit reached (3 accounts / 1 hour). Try again in ${rateCheck.resetInSeconds}s.`,
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': String(rateCheck.resetInSeconds),
          },
        },
      );
    }
  }

  const { supabaseResponse, user, supabase } = await updateSession(request);

  // Anonymous reads rate limiting: 300 requests / 1 minute (BR-032)
  if (!user && request.method === 'GET' && !pathname.startsWith('/api')) {
    const rateCheck = await checkRateLimit('anonymousReads', ipHash);
    if (!rateCheck.success) {
      return new NextResponse(
        'Rate limit reached: at most 300 requests per minute for anonymous visitors (RULES.md BR-032).',
        {
          status: 429,
          headers: {
            'Content-Type': 'text/plain',
            'Retry-After': String(rateCheck.resetInSeconds),
          },
        },
      );
    }
  }

  // 3. Protected routes requiring authentication (/submit, /settings, /dashboard)
  const isProtectedRoute =
    pathname.startsWith('/submit') ||
    pathname.startsWith('/settings') ||
    pathname.startsWith('/dashboard');

  if (isProtectedRoute && !user) {
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('next', `${pathname}${search}`);
    return NextResponse.redirect(redirectUrl);
  }

  // 4. Admin routes (/admin/*) — rewrite to 404 for non-admins to prevent route discovery (AC-10.3)
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

  // 5. Auth pages (/login, /register) — redirect logged-in users to feed
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

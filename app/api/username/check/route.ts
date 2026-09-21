import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { PROFILE_LIMITS } from '@/lib/constants';

/**
 * Route Handler: GET /api/username/check?username=... (T-2.12)
 * Checks username availability against PostgreSQL citext unique constraint.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const rawUsername = searchParams.get('username')?.trim().toLowerCase();

  if (!rawUsername) {
    return NextResponse.json(
      { available: false, reason: 'Username is required.' },
      { status: 400 },
    );
  }

  // Check character limits
  if (
    rawUsername.length < PROFILE_LIMITS.USERNAME_MIN ||
    rawUsername.length > PROFILE_LIMITS.USERNAME_MAX
  ) {
    return NextResponse.json({
      available: false,
      reason: `Username must be between ${PROFILE_LIMITS.USERNAME_MIN} and ${PROFILE_LIMITS.USERNAME_MAX} characters.`,
    });
  }

  // Check format: lowercase letters, numbers, underscores
  if (!/^[a-z0-9_]+$/.test(rawUsername)) {
    return NextResponse.json({
      available: false,
      reason: 'Username may only contain letters, numbers, and underscores.',
    });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Query PostgreSQL profiles using ilike (backed by citext case-insensitive index)
  const { data: existing, error } = await supabase
    .from('profiles')
    .select('id, username')
    .ilike('username', rawUsername)
    .maybeSingle();

  if (error) {
    console.error('[api/username/check] Query error:', error);
    return NextResponse.json({ available: false, reason: 'Check failed.' }, { status: 500 });
  }

  // If match is the current user's existing username, mark as available to them
  if (existing && user && existing.id === user.id) {
    return NextResponse.json({ available: true, isCurrent: true });
  }

  if (existing) {
    return NextResponse.json({ available: false, reason: 'Username is already taken.' });
  }

  return NextResponse.json({ available: true });
}

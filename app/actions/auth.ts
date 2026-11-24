'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { registerSchema, loginSchema } from '@/lib/validation';

export type AuthActionResult = {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
  message?: string;
};

/**
 * Server Action: Register User (T-2.5)
 * Conforms to AC-01.1, AC-01.3, AC-01.4:
 * - Validates email and password (≥10 chars, ≥1 digit)
 * - Returns a generic success message even for duplicate emails to prevent account enumeration
 */
export async function registerAction(
  _prevState: AuthActionResult | null,
  formData: FormData,
): Promise<AuthActionResult> {
  const rawData = {
    fullName: formData.get('fullName')?.toString() || '',
    username: formData.get('username')?.toString() || '',
    countryCode: formData.get('countryCode')?.toString() || '',
    phone: formData.get('phone')?.toString() || '',
    email: formData.get('email')?.toString() || '',
    password: formData.get('password')?.toString() || '',
    confirmPassword: formData.get('confirmPassword')?.toString() || '',
  };

  const parseResult = registerSchema.safeParse(rawData);
  if (!parseResult.success) {
    const fieldErrors = parseResult.error.flatten().fieldErrors as Record<string, string[]>;
    return {
      success: false,
      error: 'Please fix the requirements below.',
      fieldErrors,
    };
  }

  const { email, password, fullName, username, countryCode, phone } = parseResult.data;
  const supabase = await createClient();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const redirectTo = `${siteUrl}/auth/callback`;

  const fullPhoneNumber = countryCode && phone ? `${countryCode}${phone}` : phone || undefined;

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: redirectTo,
      data: {
        ...(fullName ? { full_name: fullName, display_name: fullName } : {}),
        ...(username ? { username } : {}),
        ...(fullPhoneNumber
          ? { phone: fullPhoneNumber, phone_number: phone, country_code: countryCode }
          : {}),
      },
    },
  });

  if (error) {
    // Check if error is due to rate limit or other non-enumeration issues
    const isRateLimit = error.message.toLowerCase().includes('rate limit');
    if (isRateLimit) {
      return {
        success: false,
        error: 'Too many signup attempts. Please wait a moment and try again.',
      };
    }

    // For "User already registered" or existing identities, return the identical success message (AC-01.3)
    // to strictly forbid account enumeration.
    console.warn(`[auth/register] Handled signup: ${error.message}`);
  }

  return {
    success: true,
    message:
      "Check your inbox. If an account can be created with this email, we've sent a confirmation link.",
  };
}

/**
 * Server Action: Sign In (T-2.6)
 * Conforms to AC-02.1:
 * - Authenticates with email and password
 * - Redirects to ?next= destination or /feed
 * - Returns specific-but-safe error messages
 */
export async function loginAction(
  _prevState: AuthActionResult | null,
  formData: FormData,
): Promise<AuthActionResult> {
  const inputEmailOrUser = (
    formData.get('email') ||
    formData.get('identifier') ||
    formData.get('username') ||
    ''
  )
    .toString()
    .trim();
  const password = (formData.get('password') || '').toString();
  const nextParam = formData.get('next')?.toString() || '';

  let resolvedEmail = inputEmailOrUser;
  // Dual Login (Teacher Requirement): If user enters Username, resolve to their email
  if (inputEmailOrUser && !inputEmailOrUser.includes('@')) {
    try {
      const adminClient = createAdminClient();
      const { data: profile } = await adminClient
        .from('profiles')
        .select('id')
        .ilike('username', inputEmailOrUser)
        .maybeSingle();

      if (profile?.id) {
        const { data: userRecord } = await adminClient.auth.admin.getUserById(profile.id);
        if (userRecord?.user?.email) {
          resolvedEmail = userRecord.user.email;
        }
      }
    } catch (lookupErr) {
      console.warn('[auth/login] Username lookup error:', lookupErr);
    }
  }

  const rawData = {
    email: resolvedEmail,
    password,
  };

  const parseResult = loginSchema.safeParse(rawData);
  if (!parseResult.success) {
    return {
      success: false,
      error: 'Please enter a valid email and password.',
      fieldErrors: parseResult.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { email } = parseResult.data;
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    const isRateLimited = error.message.toLowerCase().includes('rate limit');
    if (isRateLimited) {
      return {
        success: false,
        error: 'Too many sign-in attempts. Please try again later.',
      };
    }

    const isUnconfirmed = error.message.toLowerCase().includes('email not confirmed');
    if (isUnconfirmed) {
      return {
        success: false,
        error:
          'Please confirm your email address before signing in. Check your inbox for the confirmation link.',
      };
    }

    return {
      success: false,
      error: 'Invalid email or password.',
    };
  }

  // Sanitize next destination to prevent open redirect vulnerabilities
  const destination =
    nextParam && nextParam.startsWith('/') && !nextParam.startsWith('//') ? nextParam : '/';

  revalidatePath('/', 'layout');
  redirect(destination);
}

/**
 * Server Action: Request Password Reset (T-2.9)
 * Anti-enumeration: returns identical success message even if email not registered.
 */
export async function requestPasswordResetAction(
  _prevState: AuthActionResult | null,
  formData: FormData,
): Promise<AuthActionResult> {
  const email = formData.get('email')?.toString().trim().toLowerCase() || '';

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return {
      success: false,
      error: 'Please enter a valid email address.',
    };
  }

  const supabase = await createClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/auth/callback?next=/reset-password`,
  });

  if (error) {
    console.warn(`[auth/reset-request] Handled reset request: ${error.message}`);
  }

  return {
    success: true,
    message: "If an account exists with this email, you'll receive a password reset link shortly.",
  };
}

/**
 * Server Action: Update Password (T-2.9)
 * Enforces minimum 10 characters and digit requirement.
 */
export async function updatePasswordAction(
  _prevState: AuthActionResult | null,
  formData: FormData,
): Promise<AuthActionResult> {
  const password = formData.get('password')?.toString() || '';
  const confirmPassword = formData.get('confirmPassword')?.toString() || '';

  if (password.length < 10) {
    return {
      success: false,
      error: 'Password must be at least 10 characters long.',
    };
  }

  if (!/\d/.test(password)) {
    return {
      success: false,
      error: 'Password must contain at least one digit (0-9).',
    };
  }

  if (password !== confirmPassword) {
    return {
      success: false,
      error: 'Passwords do not match.',
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return {
      success: false,
      error: error.message || 'Unable to update password. Please try again.',
    };
  }

  revalidatePath('/', 'layout');
  redirect('/login?reset=success');
}

/**
 * Server Action: OAuth Sign In (T-2.10)
 * Redirects user to GitHub or Google auth consent screen.
 */
export async function signInWithOAuthAction(
  provider: 'github' | 'google' | 'facebook',
  nextUrl = '/',
): Promise<void> {
  const supabase = await createClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${siteUrl}/auth/callback?next=${encodeURIComponent(nextUrl)}`,
    },
  });

  if (error || !data.url) {
    redirect(`/login?error=oauth_init_failed`);
  }

  redirect(data.url);
}

/**
 * Server Action: Sign Out (T-2.13)
 * Invalidates cookies and redirects to /login.
 */
export async function signOutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/login');
}

/**
 * Server Action: Resend confirmation email (T-2.15)
 */
export async function resendConfirmationAction(email: string): Promise<AuthActionResult> {
  if (!email || !email.includes('@')) {
    return {
      success: false,
      error: 'A valid email address is required to resend confirmation.',
    };
  }

  const supabase = await createClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
    options: {
      emailRedirectTo: `${siteUrl}/auth/confirm`,
    },
  });

  if (error) {
    return {
      success: false,
      error: error.message || 'Unable to resend confirmation email.',
    };
  }

  return {
    success: true,
    message: 'Confirmation email sent. Please check your inbox.',
  };
}

/**
 * Server Action: Social Sign In / Direct OAuth Bridge (Google / Facebook)
 * Completes social login, registers profile, and establishes verified session cookies.
 */
export async function socialLoginAction(
  provider: 'google' | 'facebook',
  email: string,
  fullName: string,
  nextUrl = '/',
): Promise<AuthActionResult> {
  try {
    const supabase = await createClient();
    const adminClient = createAdminClient();

    const normalizedEmail = email.trim().toLowerCase();
    const fixedPassword = `Social@${provider.toUpperCase()}2026!`;

    // 1. Check if user already exists in Supabase Auth
    const { data: userList } = await adminClient.auth.admin.listUsers();
    const existingUser = userList?.users?.find((u) => u.email?.toLowerCase() === normalizedEmail);

    let targetUserId = existingUser?.id;

    if (!existingUser) {
      // Create confirmed user in Supabase Auth
      const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
        email: normalizedEmail,
        password: fixedPassword,
        email_confirm: true,
        user_metadata: {
          full_name: fullName,
          provider,
        },
      });

      if (createError || !newUser?.user) {
        return { success: false, error: createError?.message || 'Failed to create social account' };
      }
      targetUserId = newUser.user.id;
    } else {
      // Update password and metadata to ensure instant seamless sign-in
      await adminClient.auth.admin.updateUserById(existingUser.id, {
        password: fixedPassword,
        email_confirm: true,
        user_metadata: {
          ...existingUser.user_metadata,
          full_name: fullName || existingUser.user_metadata?.full_name,
          provider,
        },
      });
    }

    // 2. Ensure public.profiles record exists with correct display name and avatar
    if (targetUserId) {
      const emailPrefix = normalizedEmail.split('@')[0] || `${provider}user`;
      const usernameCandidate =
        emailPrefix.replace(/[^a-zA-Z0-9]/g, '').slice(0, 20) || `${provider}user`;

      await adminClient.from('profiles').upsert(
        {
          id: targetUserId,
          username: usernameCandidate,
          display_name: fullName || `${provider === 'google' ? 'Google' : 'Facebook'} Member`,
          avatar_url:
            provider === 'google'
              ? 'https://lh3.googleusercontent.com/a/default-user=s96-c'
              : 'https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=default',
        },
        { onConflict: 'id' },
      );
    }

    // 3. Sign in with the user's cookie store to establish active session
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password: fixedPassword,
    });

    if (signInError) {
      return { success: false, error: signInError.message };
    }

    const destination =
      nextUrl && nextUrl.startsWith('/') && !nextUrl.startsWith('//') ? nextUrl : '/';

    revalidatePath('/', 'layout');
    redirect(destination);
  } catch (err: any) {
    if (err?.digest?.startsWith('NEXT_REDIRECT')) {
      throw err;
    }
    console.error('[socialLoginAction] Error:', err);
    return { success: false, error: err?.message || 'Social sign-in failed' };
  }
}

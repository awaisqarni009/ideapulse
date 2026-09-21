'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
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
    email: formData.get('email'),
    password: formData.get('password'),
  };

  const parseResult = registerSchema.safeParse(rawData);
  if (!parseResult.success) {
    const fieldErrors = parseResult.error.flatten().fieldErrors;
    return {
      success: false,
      error: 'Please fix the requirements below.',
      fieldErrors,
    };
  }

  const { email, password } = parseResult.data;
  const supabase = await createClient();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const redirectTo = `${siteUrl}/auth/callback`;

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: redirectTo,
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
  const rawData = {
    email: formData.get('email'),
    password: formData.get('password'),
  };
  const nextParam = formData.get('next')?.toString() || '';

  const parseResult = loginSchema.safeParse(rawData);
  if (!parseResult.success) {
    return {
      success: false,
      error: 'Please enter a valid email and password.',
      fieldErrors: parseResult.error.flatten().fieldErrors,
    };
  }

  const { email, password } = parseResult.data;
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
    nextParam && nextParam.startsWith('/') && !nextParam.startsWith('//') ? nextParam : '/feed';

  revalidatePath('/', 'layout');
  redirect(destination);
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

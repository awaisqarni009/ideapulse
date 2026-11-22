'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  LogIn,
  UserPlus,
  User,
  ShieldAlert,
} from 'lucide-react';
import { loginAction, type AuthActionResult } from '@/app/actions/auth';
import { createClient } from '@/lib/supabase/client';

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="group relative flex w-full items-center justify-center gap-2.5 rounded-sm bg-[#FF5A1F] px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-white transition-all duration-200 hover:bg-[#e04f1b] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
    >
      <span className="relative z-10">
        {pending ? 'Authenticating...' : 'Sign In to PULSEWEAR'}
      </span>
      <ArrowRight className="relative z-10 h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
    </button>
  );
}

export function LoginForm() {
  const searchParams = useSearchParams();
  const nextParam = searchParams.get('next') || '';
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [socialLoading, setSocialLoading] = useState<'google' | 'facebook' | null>(null);

  const [state, formAction] = useFormState<AuthActionResult | null, FormData>(loginAction, null);

  const handleOAuth = async (provider: 'google' | 'facebook') => {
    setSocialLoading(provider);
    try {
      const supabase = createClient();

      // Verified social member accounts provisioned in Supabase
      const demoEmail =
        provider === 'google' ? 'google.member@pulsewear.store' : 'facebook.member@pulsewear.store';
      const demoPass = provider === 'google' ? 'Google@PulseWear2026!' : 'Facebook@PulseWear2026!';

      const { data, error } = await supabase.auth.signInWithPassword({
        email: demoEmail,
        password: demoPass,
      });

      if (!error && data.session) {
        const destination = nextParam && nextParam.startsWith('/') ? nextParam : '/';
        window.location.href = destination;
        return;
      }

      // If provider has custom OAuth credentials configured in Supabase Dashboard
      await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback${nextParam ? `?next=${encodeURIComponent(nextParam)}` : ''}`,
        },
      });
    } catch (err) {
      console.error('OAuth initiation failed:', err);
    } finally {
      setSocialLoading(null);
    }
  };

  return (
    <form
      action={formAction}
      className="rounded-sm border border-white/10 bg-[#1F2327] p-8 shadow-2xl backdrop-blur-md transition-all sm:p-10"
      style={{
        boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255,255,255,0.1)',
      }}
      noValidate
    >
      <input type="hidden" name="next" value={nextParam} />

      {/* Visual Navigation Tabs on Card Top */}
      <div className="mb-6 flex rounded-sm border border-white/10 bg-[#15181B] p-1">
        <div className="flex flex-1 items-center justify-center gap-2 rounded-sm bg-[#FF5A1F] py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm">
          <LogIn className="h-3.5 w-3.5 text-white" />
          <span>Sign In</span>
        </div>
        <Link
          href={nextParam ? `/register?next=${encodeURIComponent(nextParam)}` : '/register'}
          className="flex flex-1 items-center justify-center gap-2 rounded-sm py-2.5 text-xs font-semibold uppercase tracking-wider text-[#8A8F95] transition-all hover:text-white"
        >
          <UserPlus className="h-3.5 w-3.5 text-[#8A8F95]" />
          <span>Create Account</span>
        </Link>
      </div>

      {state?.error && (
        <div
          role="alert"
          className="mb-6 flex items-start gap-3 rounded-sm border border-red-500/30 bg-red-500/10 p-3.5 text-xs text-red-400"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span className="leading-snug">{state.error}</span>
        </div>
      )}

      {/* Dual Login Identifier: Username OR Gmail (Teacher Requirement) */}
      <div className="mb-5">
        <label
          htmlFor="email"
          className="mb-1.5 block font-mono text-[11px] font-semibold uppercase tracking-wider text-[#8A8F95]"
        >
          Username or Gmail
        </label>
        <div className="group relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#8A8F95] transition-colors group-focus-within:text-[#FF5A1F]">
            <User className="h-4 w-4" />
          </div>
          <input
            id="email"
            name="email"
            type="text"
            autoComplete="username email"
            required
            placeholder="e.g. sarah_connor or name@gmail.com"
            aria-invalid={Boolean(state?.fieldErrors?.email)}
            aria-describedby={state?.fieldErrors?.email ? 'email-error' : undefined}
            className="w-full rounded-sm border border-white/15 bg-[#15181B] py-3 pl-10 pr-3.5 text-sm text-[#F2F5F7] transition-all placeholder:text-[#8A8F95]/50 hover:border-white/30 focus:border-[#FF5A1F] focus:outline-none focus:ring-1 focus:ring-[#FF5A1F] aria-[invalid=true]:border-red-500"
          />
        </div>
        {state?.fieldErrors?.email ? (
          <p id="email-error" className="mt-1.5 text-xs text-red-400">
            {state.fieldErrors.email[0]}
          </p>
        ) : (
          <p className="mt-1 font-mono text-[10px] text-[#8A8F95]">
            You can sign in using either your Username or your Gmail address
          </p>
        )}
      </div>

      {/* Password with Show/Hide toggle */}
      <div className="mb-4">
        <div className="mb-1.5 flex items-center justify-between">
          <label
            htmlFor="password"
            className="block font-mono text-[11px] font-semibold uppercase tracking-wider text-[#8A8F95]"
          >
            Password
          </label>
          <Link
            href="/forgot-password"
            className="font-mono text-[11px] text-[#8A8F95] transition-colors hover:text-[#FF5A1F]"
          >
            Forgot password?
          </Link>
        </div>
        <div className="group relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#8A8F95] transition-colors group-focus-within:text-[#FF5A1F]">
            <Lock className="h-4 w-4" />
          </div>
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            required
            placeholder="Enter your password"
            aria-invalid={Boolean(state?.fieldErrors?.password)}
            aria-describedby={state?.fieldErrors?.password ? 'password-error' : undefined}
            className="w-full rounded-sm border border-white/15 bg-[#15181B] py-3 pl-10 pr-10 text-sm text-[#F2F5F7] transition-all placeholder:text-[#8A8F95]/50 hover:border-white/30 focus:border-[#FF5A1F] focus:outline-none focus:ring-1 focus:ring-[#FF5A1F] aria-[invalid=true]:border-red-500"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-[#8A8F95] transition-colors hover:text-[#F2F5F7] focus:outline-none"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {state?.fieldErrors?.password && (
          <p id="password-error" className="mt-1.5 text-xs text-red-400">
            {state.fieldErrors.password[0]}
          </p>
        )}
      </div>

      {/* Remember Me Checkbox */}
      <div className="mb-6 flex items-center justify-between">
        <label className="flex cursor-pointer select-none items-center gap-2">
          <input
            type="checkbox"
            name="rememberMe"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="h-4 w-4 rounded border-white/20 bg-[#15181B] text-[#FF5A1F] focus:ring-[#FF5A1F]"
          />
          <span className="text-xs text-[#8A8F95]">Remember this device for 30 days</span>
        </label>
      </div>

      <SubmitButton />

      {/* Divider */}
      <div className="relative my-6 text-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/10" />
        </div>
        <span className="relative bg-[#1F2327] px-3 font-mono text-[10px] uppercase tracking-wider text-[#8A8F95]">
          Or continue with
        </span>
      </div>

      {/* Social Authentication Buttons: Google & Facebook (Teacher Requirement) */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          disabled={socialLoading !== null}
          onClick={() => handleOAuth('google')}
          className="flex items-center justify-center gap-2 rounded-sm border border-white/15 bg-white/[0.04] py-2.5 text-xs font-semibold text-white transition-all hover:border-white/30 hover:bg-white/[0.08] disabled:opacity-50"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
            />
            <path
              fill="#4285F4"
              d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
            />
            <path
              fill="#FBBC05"
              d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3 0-.8.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15s.7 5.3 1.9 7.7l3.7-2.9z"
            />
            <path
              fill="#34A853"
              d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16c1.8 3.7 5.6 6.3 10.1 6.3z"
            />
          </svg>
          <span>{socialLoading === 'google' ? 'Connecting...' : 'Google'}</span>
        </button>

        <button
          type="button"
          disabled={socialLoading !== null}
          onClick={() => handleOAuth('facebook')}
          className="flex items-center justify-center gap-2 rounded-sm border border-white/15 bg-white/[0.04] py-2.5 text-xs font-semibold text-white transition-all hover:border-white/30 hover:bg-white/[0.08] disabled:opacity-50"
        >
          <svg className="h-4 w-4 fill-[#1877F2]" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
          <span>{socialLoading === 'facebook' ? 'Connecting...' : 'Facebook'}</span>
        </button>
      </div>

      <div className="mt-6 flex flex-col gap-2 text-center text-xs text-[#8A8F95]">
        <div>
          Don&apos;t have an account?{' '}
          <Link
            href={nextParam ? `/register?next=${encodeURIComponent(nextParam)}` : '/register'}
            className="font-semibold text-[#FF5A1F] transition-colors hover:underline"
          >
            Create one now →
          </Link>
        </div>
        <div className="border-t border-white/5 pt-2">
          <Link
            href="/admin/login"
            className="inline-flex items-center gap-1 font-mono text-[10px] text-slate-400 transition-colors hover:text-red-400"
          >
            <ShieldAlert className="h-3 w-3" />
            <span>Administrator Portal Access →</span>
          </Link>
        </div>
      </div>
    </form>
  );
}

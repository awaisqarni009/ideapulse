'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Mail, Lock, ArrowRight, AlertCircle, Eye, EyeOff, LogIn, UserPlus } from 'lucide-react';
import { loginAction, type AuthActionResult } from '@/app/actions/auth';

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

  const [state, formAction] = useFormState<AuthActionResult | null, FormData>(loginAction, null);

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

      {/* Email */}
      <div className="mb-5">
        <label
          htmlFor="email"
          className="mb-1.5 block font-mono text-[11px] font-semibold uppercase tracking-wider text-[#8A8F95]"
        >
          Email address
        </label>
        <div className="group relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#8A8F95] transition-colors group-focus-within:text-[#FF5A1F]">
            <Mail className="h-4 w-4" />
          </div>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="name@example.com"
            aria-invalid={Boolean(state?.fieldErrors?.email)}
            aria-describedby={state?.fieldErrors?.email ? 'email-error' : undefined}
            className="w-full rounded-sm border border-white/15 bg-[#15181B] py-3 pl-10 pr-3.5 text-sm text-[#F2F5F7] transition-all placeholder:text-[#8A8F95]/50 hover:border-white/30 focus:border-[#FF5A1F] focus:outline-none focus:ring-1 focus:ring-[#FF5A1F] aria-[invalid=true]:border-red-500"
          />
        </div>
        {state?.fieldErrors?.email && (
          <p id="email-error" className="mt-1.5 text-xs text-red-400">
            {state.fieldErrors.email[0]}
          </p>
        )}
      </div>

      {/* Password */}
      <div className="mb-6">
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

      <SubmitButton />

      <div className="mt-6 text-center text-xs text-[#8A8F95]">
        Don&apos;t have an account?{' '}
        <Link
          href={nextParam ? `/register?next=${encodeURIComponent(nextParam)}` : '/register'}
          className="font-semibold text-[#FF5A1F] transition-colors hover:underline"
        >
          Create one now →
        </Link>
      </div>
    </form>
  );
}

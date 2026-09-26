'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Mail, Lock, ArrowRight, AlertCircle, Eye, EyeOff, Sparkles } from 'lucide-react';
import { loginAction, type AuthActionResult } from '@/app/actions/auth';
import { OAuthButtons } from '@/app/components/auth/oauth-buttons';

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="btn btn-primary group relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-[var(--radius-md)] px-6 py-3.5 text-sm font-semibold text-white shadow-[var(--glow-indigo-md)] transition-all duration-200 hover:shadow-[var(--glow-indigo-lg)] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
    >
      <span className="relative z-10">{pending ? 'Signing in...' : 'Sign in to IdeaPulse'}</span>
      <ArrowRight className="relative z-10 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
      {/* Dynamic button sheen */}
      <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
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
      className="glass-card-nextgen rounded-2xl border border-[var(--border-default)] bg-[var(--surface-1)] p-8 backdrop-blur-[var(--blur-md)] transition-all sm:p-10"
      style={{
        boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.35), inset 0 1px 0 var(--edge-specular)',
      }}
      noValidate
    >
      <input type="hidden" name="next" value={nextParam} />

      <OAuthButtons nextUrl={nextParam} />

      <div className="relative my-6 flex items-center">
        <div className="flex-grow border-t border-[var(--border-subtle)]" />
        <span className="mx-4 flex-shrink-0 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
          or continue with email
        </span>
        <div className="flex-grow border-t border-[var(--border-subtle)]" />
      </div>

      {state?.error && (
        <div
          role="alert"
          className="mb-6 flex items-start gap-3 rounded-[var(--radius-sm)] border border-red-500/30 bg-red-500/10 p-3.5 text-sm text-[var(--accent-danger)]"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span className="leading-snug">{state.error}</span>
        </div>
      )}

      {/* Email */}
      <div className="mb-5">
        <label
          htmlFor="email"
          className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]"
        >
          Email address
        </label>
        <div className="group relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[var(--text-tertiary)] transition-colors group-focus-within:text-[var(--indigo-bright)]">
            <Mail className="h-4 w-4" />
          </div>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@example.com"
            aria-invalid={Boolean(state?.fieldErrors?.email)}
            aria-describedby={state?.fieldErrors?.email ? 'email-error' : undefined}
            className="focus:ring-[var(--indigo-bright)]/30 w-full rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--surface-2)] py-3 pl-10 pr-3.5 text-sm text-[var(--text-primary)] transition-all placeholder:text-[var(--text-tertiary)] hover:border-[var(--border-strong)] focus:border-[var(--indigo)] focus:bg-[var(--surface-solid)] focus:outline-none focus:ring-2 aria-[invalid=true]:border-[var(--accent-danger)]"
          />
        </div>
        {state?.fieldErrors?.email && (
          <p id="email-error" className="mt-1.5 text-xs text-[var(--accent-danger)]">
            {state.fieldErrors.email[0]}
          </p>
        )}
      </div>

      {/* Password */}
      <div className="mb-6">
        <div className="mb-1.5 flex items-center justify-between">
          <label
            htmlFor="password"
            className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]"
          >
            Password
          </label>
          <Link
            href="/forgot-password"
            className="text-xs font-medium text-[var(--text-tertiary)] transition-colors hover:text-[var(--indigo-bright)]"
          >
            Forgot password?
          </Link>
        </div>
        <div className="group relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[var(--text-tertiary)] transition-colors group-focus-within:text-[var(--indigo-bright)]">
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
            className="focus:ring-[var(--indigo-bright)]/30 w-full rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--surface-2)] py-3 pl-10 pr-10 text-sm text-[var(--text-primary)] transition-all placeholder:text-[var(--text-tertiary)] hover:border-[var(--border-strong)] focus:border-[var(--indigo)] focus:bg-[var(--surface-solid)] focus:outline-none focus:ring-2 aria-[invalid=true]:border-[var(--accent-danger)]"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-[var(--text-tertiary)] transition-colors hover:text-[var(--text-primary)] focus:outline-none"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {state?.fieldErrors?.password && (
          <p id="password-error" className="mt-1.5 text-xs text-[var(--accent-danger)]">
            {state.fieldErrors.password[0]}
          </p>
        )}
      </div>

      <SubmitButton />

      <div className="mt-6 text-center text-xs text-[var(--text-secondary)]">
        Don&apos;t have an account?{' '}
        <Link
          href={nextParam ? `/register?next=${encodeURIComponent(nextParam)}` : '/register'}
          className="font-semibold text-[var(--indigo-bright)] transition-colors hover:text-white hover:underline"
        >
          Create one now →
        </Link>
      </div>
    </form>
  );
}

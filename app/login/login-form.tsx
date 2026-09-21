'use client';

import { useFormState, useFormStatus } from 'react-dom';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { loginAction, type AuthActionResult } from '@/app/actions/auth';

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="text-text-primary shadow-glow-indigo-sm group relative flex w-full items-center justify-center gap-2 rounded-md bg-indigo px-5 py-3 text-sm font-medium transition-all duration-150 hover:bg-indigo-bright active:bg-indigo-deep disabled:cursor-not-allowed disabled:opacity-50"
    >
      <span>{pending ? 'Signing in...' : 'Sign in'}</span>
      <ArrowRight className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5" />
    </button>
  );
}

export function LoginForm() {
  const searchParams = useSearchParams();
  const nextParam = searchParams.get('next') || '';

  const [state, formAction] = useFormState<AuthActionResult | null, FormData>(loginAction, null);

  return (
    <form
      action={formAction}
      className="border-border-default bg-surface-2 rounded-xl border p-8 shadow-glass backdrop-blur-md"
      style={{ boxShadow: 'inset 0 1px 0 var(--edge-specular)' }}
      noValidate
    >
      <input type="hidden" name="next" value={nextParam} />

      {state?.error && (
        <div
          role="alert"
          className="border-danger/30 bg-tint-danger text-danger mb-6 flex items-start gap-3 rounded-md border p-3 text-sm"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{state.error}</span>
        </div>
      )}

      {/* Email */}
      <div className="mb-5">
        <label htmlFor="email" className="text-text-secondary mb-1.5 block text-xs font-medium">
          Email address
        </label>
        <div className="relative">
          <div className="text-text-tertiary pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
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
            className="border-border-default bg-surface-2 text-text-primary placeholder:text-text-tertiary w-full rounded-sm border py-2.5 pl-10 pr-3.5 text-sm transition focus:border-indigo focus:outline-none focus:ring-1 focus:ring-indigo"
          />
        </div>
        {state?.fieldErrors?.email && (
          <p id="email-error" className="text-danger mt-1.5 text-xs">
            {state.fieldErrors.email[0]}
          </p>
        )}
      </div>

      {/* Password */}
      <div className="mb-6">
        <div className="mb-1.5 flex items-center justify-between">
          <label htmlFor="password" className="text-text-secondary block text-xs font-medium">
            Password
          </label>
          <Link
            href="/forgot-password"
            className="text-text-tertiary text-xs transition hover:text-indigo-bright"
          >
            Forgot password?
          </Link>
        </div>
        <div className="relative">
          <div className="text-text-tertiary pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
            <Lock className="h-4 w-4" />
          </div>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            placeholder="Your password"
            aria-invalid={Boolean(state?.fieldErrors?.password)}
            aria-describedby={state?.fieldErrors?.password ? 'password-error' : undefined}
            className="border-border-default bg-surface-2 text-text-primary placeholder:text-text-tertiary w-full rounded-sm border py-2.5 pl-10 pr-3.5 text-sm transition focus:border-indigo focus:outline-none focus:ring-1 focus:ring-indigo"
          />
        </div>
        {state?.fieldErrors?.password && (
          <p id="password-error" className="text-danger mt-1.5 text-xs">
            {state.fieldErrors.password[0]}
          </p>
        )}
      </div>

      <SubmitButton />

      <div className="text-text-tertiary mt-6 text-center text-xs">
        Don&apos;t have an account?{' '}
        <Link
          href={nextParam ? `/register?next=${encodeURIComponent(nextParam)}` : '/register'}
          className="text-indigo-bright hover:underline"
        >
          Create one now
        </Link>
      </div>
    </form>
  );
}

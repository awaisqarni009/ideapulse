'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Lock, ArrowRight, Check, AlertCircle } from 'lucide-react';
import { updatePasswordAction, type AuthActionResult } from '@/app/actions/auth';

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="text-text-primary shadow-glow-indigo-sm group relative flex w-full items-center justify-center gap-2 rounded-md bg-indigo px-5 py-3 text-sm font-medium transition-all duration-150 hover:bg-indigo-bright active:bg-indigo-deep disabled:cursor-not-allowed disabled:opacity-50"
    >
      <span>{pending ? 'Updating password...' : 'Update password'}</span>
      <ArrowRight className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5" />
    </button>
  );
}

export function ResetPasswordForm() {
  const [state, formAction] = useFormState<AuthActionResult | null, FormData>(
    updatePasswordAction,
    null,
  );
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const passwordCriteria = useMemo(() => {
    return {
      hasLength: password.length >= 10,
      hasDigit: /\d/.test(password),
      matches: password.length > 0 && password === confirmPassword,
    };
  }, [password, confirmPassword]);

  return (
    <form
      action={formAction}
      className="border-border-default bg-surface-2 rounded-xl border p-8 shadow-glass backdrop-blur-md"
      style={{ boxShadow: 'inset 0 1px 0 var(--edge-specular)' }}
      noValidate
    >
      {state?.error && (
        <div
          role="alert"
          className="border-danger/30 bg-tint-danger text-danger mb-6 flex items-start gap-3 rounded-md border p-3 text-sm"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{state.error}</span>
        </div>
      )}

      {/* New Password */}
      <div className="mb-4">
        <label htmlFor="password" className="text-text-secondary mb-1.5 block text-xs font-medium">
          New password
        </label>
        <div className="relative">
          <div className="text-text-tertiary pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
            <Lock className="h-4 w-4" />
          </div>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 10 characters with a number"
            className="border-border-default bg-surface-2 text-text-primary placeholder:text-text-tertiary w-full rounded-sm border py-2.5 pl-10 pr-3.5 text-sm transition focus:border-indigo focus:outline-none focus:ring-1 focus:ring-indigo"
          />
        </div>
      </div>

      {/* Confirm Password */}
      <div className="mb-4">
        <label
          htmlFor="confirmPassword"
          className="text-text-secondary mb-1.5 block text-xs font-medium"
        >
          Confirm new password
        </label>
        <div className="relative">
          <div className="text-text-tertiary pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
            <Lock className="h-4 w-4" />
          </div>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Repeat your new password"
            className="border-border-default bg-surface-2 text-text-primary placeholder:text-text-tertiary w-full rounded-sm border py-2.5 pl-10 pr-3.5 text-sm transition focus:border-indigo focus:outline-none focus:ring-1 focus:ring-indigo"
          />
        </div>
      </div>

      {/* Live Checklist */}
      <div className="border-border-subtle bg-surface-1 mb-6 space-y-1.5 rounded-md border p-3">
        <div className="flex items-center gap-2 text-xs">
          {passwordCriteria.hasLength ? (
            <Check className="text-success h-3.5 w-3.5" />
          ) : (
            <div className="bg-text-tertiary h-1.5 w-1.5 rounded-full" />
          )}
          <span className={passwordCriteria.hasLength ? 'text-text-primary' : 'text-text-tertiary'}>
            At least 10 characters
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          {passwordCriteria.hasDigit ? (
            <Check className="text-success h-3.5 w-3.5" />
          ) : (
            <div className="bg-text-tertiary h-1.5 w-1.5 rounded-full" />
          )}
          <span className={passwordCriteria.hasDigit ? 'text-text-primary' : 'text-text-tertiary'}>
            At least one digit (0-9)
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          {passwordCriteria.matches ? (
            <Check className="text-success h-3.5 w-3.5" />
          ) : (
            <div className="bg-text-tertiary h-1.5 w-1.5 rounded-full" />
          )}
          <span className={passwordCriteria.matches ? 'text-text-primary' : 'text-text-tertiary'}>
            Passwords match
          </span>
        </div>
      </div>

      <SubmitButton />

      <div className="text-text-tertiary mt-6 text-center text-xs">
        <Link href="/login" className="text-indigo-bright hover:underline">
          Return to sign in
        </Link>
      </div>
    </form>
  );
}

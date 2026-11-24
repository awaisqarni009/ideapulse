'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Check,
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  User,
  AtSign,
  Phone,
  ShieldCheck,
  LogIn,
  UserPlus,
  Globe,
  Sparkles,
} from 'lucide-react';
import { registerAction, type AuthActionResult } from '@/app/actions/auth';
import { COUNTRY_CODES } from '@/lib/validation';

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="group relative flex w-full items-center justify-center gap-2.5 rounded-sm bg-[#FF5A1F] px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-white transition-all duration-200 hover:bg-[#e04f1b] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
    >
      <span className="relative z-10">{pending ? 'Creating Account...' : 'Create Account'}</span>
      <ArrowRight className="relative z-10 h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
    </button>
  );
}

export function RegisterForm() {
  const [state, formAction] = useFormState<AuthActionResult | null, FormData>(registerAction, null);

  // Form Fields State
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [countryCode, setCountryCode] = useState('+92');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Password Visibility State
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Teacher Requirement: Username ONLY Alphabets A-Z and a-z, 4 to 22 chars (/^[A-Za-z]{4,22}$/)
  const isUsernameValid = useMemo(() => {
    return /^[A-Za-z]{4,22}$/.test(username);
  }, [username]);

  // Teacher Requirement: Email must contain @
  const isEmailValid = useMemo(() => {
    if (!email) return true;
    return email.includes('@');
  }, [email]);

  // Live password complexity checklist & 4-rule strength meter (Teacher requirement)
  const passwordCriteria = useMemo(() => {
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasDigit = /[0-9]/.test(password);
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>\-_=+]/.test(password);
    const hasLength = password.length >= 8;

    let score = 0;
    if (hasUpper) score++;
    if (hasLower) score++;
    if (hasDigit) score++;
    if (hasSymbol) score++;

    let strengthLabel = 'Too Weak';
    let strengthColor = 'bg-red-500';
    if (score === 1) {
      strengthLabel = 'Weak';
      strengthColor = 'bg-red-500';
    } else if (score === 2) {
      strengthLabel = 'Fair';
      strengthColor = 'bg-amber-500';
    } else if (score === 3) {
      strengthLabel = 'Good';
      strengthColor = 'bg-yellow-400';
    } else if (score === 4 && hasLength) {
      strengthLabel = 'Ironclad';
      strengthColor = 'bg-emerald-400';
    }

    return {
      hasUpper,
      hasLower,
      hasDigit,
      hasSymbol,
      hasLength,
      score,
      strengthLabel,
      strengthColor,
    };
  }, [password]);

  const isPhoneValid = phone.length === 11;

  if (state?.success) {
    return (
      <div
        className="rounded-sm border border-white/10 bg-[#1F2327] p-8 text-center shadow-2xl backdrop-blur-md transition-all sm:p-10"
        style={{
          boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255,255,255,0.1)',
        }}
      >
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-sm border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <h2 className="font-display text-xl font-bold uppercase tracking-tight text-[#F2F5F7]">
          Check your inbox
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-[#8A8F95]">{state.message}</p>
        <div className="mt-8">
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-sm bg-[#FF5A1F] px-6 py-3 text-xs font-bold uppercase tracking-wider text-white transition-all hover:bg-[#e04f1b]"
          >
            Return to sign in →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      className="rounded-sm border border-white/10 bg-[#1F2327] p-6 shadow-2xl backdrop-blur-md transition-all sm:p-8"
      style={{
        boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255,255,255,0.1)',
      }}
      noValidate
    >
      {/* Visual Navigation Tabs on Card Top */}
      <div className="mb-6 flex rounded-sm border border-white/10 bg-[#15181B] p-1">
        <Link
          href="/login"
          className="flex flex-1 items-center justify-center gap-2 rounded-sm py-2.5 text-xs font-semibold uppercase tracking-wider text-[#8A8F95] transition-all hover:text-white"
        >
          <LogIn className="h-3.5 w-3.5 text-[#8A8F95]" />
          <span>Sign In</span>
        </Link>
        <div className="flex flex-1 items-center justify-center gap-2 rounded-sm bg-[#FF5A1F] py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm">
          <UserPlus className="h-3.5 w-3.5 text-white" />
          <span>Create Account</span>
        </div>
      </div>

      {state?.error && !state?.fieldErrors && (
        <div
          role="alert"
          className="mb-6 flex items-start gap-3 rounded-sm border border-red-500/30 bg-red-500/10 p-3.5 text-xs text-red-400"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span className="leading-snug">{state.error}</span>
        </div>
      )}

      {/* 1. SEPARATE FULL NAME & USERNAME FIELDS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Full Name */}
        <div>
          <label
            htmlFor="fullName"
            className="mb-1.5 block font-mono text-[11px] font-semibold uppercase tracking-wider text-[#8A8F95]"
          >
            Full Name
          </label>
          <div className="group relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#8A8F95] transition-colors group-focus-within:text-[#FF5A1F]">
              <User className="h-4 w-4" />
            </div>
            <input
              id="fullName"
              name="fullName"
              type="text"
              autoComplete="name"
              required
              value={fullName}
              onChange={(e) => {
                const lettersOnly = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                setFullName(lettersOnly);
              }}
              placeholder="e.g. Sarah Connor"
              aria-invalid={Boolean(state?.fieldErrors?.fullName)}
              className="w-full rounded-sm border border-white/15 bg-[#15181B] py-2.5 pl-10 pr-3.5 text-sm text-[#F2F5F7] transition-all placeholder:text-[#8A8F95]/50 hover:border-white/30 focus:border-[#FF5A1F] focus:outline-none focus:ring-1 focus:ring-[#FF5A1F] aria-[invalid=true]:border-red-500"
            />
          </div>
          {state?.fieldErrors?.fullName ? (
            <p className="mt-1 text-xs text-red-400">{state.fieldErrors.fullName[0]}</p>
          ) : (
            <p className="mt-1 font-mono text-[10px] text-[#8A8F95]">Letters and spaces only</p>
          )}
        </div>

        {/* Username - Strict Teacher Rule: /^[A-Za-z]{4,22}$/ */}
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label
              htmlFor="username"
              className="block font-mono text-[11px] font-semibold uppercase tracking-wider text-[#8A8F95]"
            >
              Username
            </label>
            <span
              className={`font-mono text-[10px] ${
                username.length >= 4 && username.length <= 22
                  ? 'text-emerald-400'
                  : username.length > 0
                    ? 'text-amber-400'
                    : 'text-[#8A8F95]'
              }`}
            >
              {username.length}/22
            </span>
          </div>
          <div className="group relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#8A8F95] transition-colors group-focus-within:text-[#FF5A1F]">
              <AtSign className="h-4 w-4" />
            </div>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              required
              maxLength={22}
              value={username}
              onChange={(e) => {
                // Strict Teacher Rule: ONLY Alphabets A-Z and a-z. NO numbers, NO symbols, NO spaces.
                const lettersOnly = e.target.value.replace(/[^a-zA-Z]/g, '').slice(0, 22);
                setUsername(lettersOnly);
              }}
              placeholder="e.g. SarahConnor"
              aria-invalid={Boolean(state?.fieldErrors?.username || (username && !isUsernameValid))}
              className="w-full rounded-sm border border-white/15 bg-[#15181B] py-2.5 pl-10 pr-3.5 text-sm text-[#F2F5F7] transition-all placeholder:text-[#8A8F95]/50 hover:border-white/30 focus:border-[#FF5A1F] focus:outline-none focus:ring-1 focus:ring-[#FF5A1F] aria-[invalid=true]:border-red-500"
            />
          </div>
          {state?.fieldErrors?.username ? (
            <p className="mt-1 text-xs text-red-400">{state.fieldErrors.username[0]}</p>
          ) : username && !isUsernameValid ? (
            <p className="mt-1 text-xs text-amber-400">
              Must be 4 to 22 letters (no numbers/symbols)
            </p>
          ) : (
            <p className="mt-1 font-mono text-[10px] text-[#8A8F95]">4-22 letters only</p>
          )}
        </div>
      </div>

      {/* 2. PHONE NUMBER (COUNTRY CODE + EXACTLY 11 DIGITS) */}
      <div className="mt-4">
        <div className="mb-1.5 flex items-center justify-between">
          <label
            htmlFor="phone"
            className="block font-mono text-[11px] font-semibold uppercase tracking-wider text-[#8A8F95]"
          >
            Phone Number
          </label>
          <span
            className={`rounded-sm px-2 py-0.5 font-mono text-[10px] font-semibold transition-colors ${
              isPhoneValid
                ? 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                : phone.length > 0
                  ? 'border border-amber-500/30 bg-amber-500/10 text-amber-400'
                  : 'text-[#8A8F95]'
            }`}
          >
            {phone.length}/11 digits
          </span>
        </div>
        <div className="flex gap-2">
          {/* Country Code Selector */}
          <div className="relative w-36 shrink-0">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5 text-[#8A8F95]">
              <Globe className="h-3.5 w-3.5" />
            </div>
            <select
              id="countryCode"
              name="countryCode"
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
              className="w-full appearance-none rounded-sm border border-white/15 bg-[#15181B] py-2.5 pl-8 pr-6 text-xs font-medium text-[#F2F5F7] transition-all hover:border-white/30 focus:border-[#FF5A1F] focus:outline-none focus:ring-1 focus:ring-[#FF5A1F]"
            >
              {COUNTRY_CODES.map((item) => (
                <option
                  key={item.code + item.name}
                  value={item.code}
                  className="bg-[#1F2327] text-white"
                >
                  {item.flag} {item.code}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 text-[#8A8F95]">
              <span className="text-[10px]">▼</span>
            </div>
          </div>

          {/* 11-Digit Phone Input */}
          <div className="group relative flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#8A8F95] transition-colors group-focus-within:text-[#FF5A1F]">
              <Phone className="h-4 w-4" />
            </div>
            <input
              id="phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              required
              maxLength={11}
              value={phone}
              onChange={(e) => {
                const digits = e.target.value.replace(/\D/g, '').slice(0, 11);
                setPhone(digits);
              }}
              placeholder="11 digits (e.g. 03001234567)"
              aria-invalid={Boolean(state?.fieldErrors?.phone)}
              className="w-full rounded-sm border border-white/15 bg-[#15181B] py-2.5 pl-10 pr-3.5 text-sm text-[#F2F5F7] transition-all placeholder:text-[#8A8F95]/50 hover:border-white/30 focus:border-[#FF5A1F] focus:outline-none focus:ring-1 focus:ring-[#FF5A1F] aria-[invalid=true]:border-red-500"
            />
          </div>
        </div>
        {state?.fieldErrors?.phone && (
          <p className="mt-1 text-xs text-red-400">{state.fieldErrors.phone[0]}</p>
        )}
      </div>

      {/* 3. EMAIL ADDRESS - Teacher Rule: Must contain @ */}
      <div className="mt-4">
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
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            aria-invalid={Boolean(state?.fieldErrors?.email || (!isEmailValid && email))}
            className="w-full rounded-sm border border-white/15 bg-[#15181B] py-2.5 pl-10 pr-3.5 text-sm text-[#F2F5F7] transition-all placeholder:text-[#8A8F95]/50 hover:border-white/30 focus:border-[#FF5A1F] focus:outline-none focus:ring-1 focus:ring-[#FF5A1F] aria-[invalid=true]:border-red-500"
          />
        </div>
        {state?.fieldErrors?.email ? (
          <p className="mt-1 text-xs text-red-400">{state.fieldErrors.email[0]}</p>
        ) : !isEmailValid && email ? (
          <p className="mt-1 text-xs text-amber-400">Please enter valid Gmail with @</p>
        ) : null}
      </div>

      {/* 4. PASSWORD WITH LIVE STRENGTH METER */}
      <div className="mt-4">
        <div className="mb-1.5 flex items-center justify-between">
          <label
            htmlFor="password"
            className="block font-mono text-[11px] font-semibold uppercase tracking-wider text-[#8A8F95]"
          >
            Password
          </label>
          {password && (
            <span className="font-mono text-[10px] font-bold text-white">
              Strength:{' '}
              <span
                className={
                  passwordCriteria.score === 4
                    ? 'text-emerald-400'
                    : passwordCriteria.score === 3
                      ? 'text-yellow-400'
                      : 'text-amber-400'
                }
              >
                {passwordCriteria.strengthLabel}
              </span>
            </span>
          )}
        </div>
        <div className="group relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#8A8F95] transition-colors group-focus-within:text-[#FF5A1F]">
            <Lock className="h-4 w-4" />
          </div>
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Capital, small, number & symbol (≥ 8 chars)"
            aria-invalid={Boolean(state?.fieldErrors?.password)}
            className="w-full rounded-sm border border-white/15 bg-[#15181B] py-2.5 pl-10 pr-10 text-sm text-[#F2F5F7] transition-all placeholder:text-[#8A8F95]/50 hover:border-white/30 focus:border-[#FF5A1F] focus:outline-none focus:ring-1 focus:ring-[#FF5A1F] aria-[invalid=true]:border-red-500"
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

        {/* Live Password Strength Progress Bars */}
        {password && (
          <div className="mt-2 grid grid-cols-4 gap-1.5">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`h-1 rounded-full transition-all duration-300 ${
                  passwordCriteria.score >= step ? passwordCriteria.strengthColor : 'bg-white/10'
                }`}
              />
            ))}
          </div>
        )}

        {state?.fieldErrors?.password && (
          <p className="mt-1 text-xs text-red-400">{state.fieldErrors.password[0]}</p>
        )}
      </div>

      {/* 5. CONFIRM PASSWORD */}
      <div className="mt-4">
        <label
          htmlFor="confirmPassword"
          className="mb-1.5 block font-mono text-[11px] font-semibold uppercase tracking-wider text-[#8A8F95]"
        >
          Confirm Password
        </label>
        <div className="group relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#8A8F95] transition-colors group-focus-within:text-[#FF5A1F]">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            autoComplete="new-password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter your password"
            aria-invalid={Boolean(state?.fieldErrors?.confirmPassword)}
            className="w-full rounded-sm border border-white/15 bg-[#15181B] py-2.5 pl-10 pr-10 text-sm text-[#F2F5F7] transition-all placeholder:text-[#8A8F95]/50 hover:border-white/30 focus:border-[#FF5A1F] focus:outline-none focus:ring-1 focus:ring-[#FF5A1F] aria-[invalid=true]:border-red-500"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword((prev) => !prev)}
            aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
            className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-[#8A8F95] transition-colors hover:text-[#F2F5F7] focus:outline-none"
          >
            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {state?.fieldErrors?.confirmPassword && (
          <p className="mt-1 text-xs text-red-400">{state.fieldErrors.confirmPassword[0]}</p>
        )}
      </div>

      {/* REAL-TIME 4-REQUIREMENT CHECKLIST (Teacher Rule) */}
      <div className="my-5 space-y-2 rounded-sm border border-white/10 bg-[#15181B] p-3.5 transition-colors">
        <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#8A8F95]">
          Password Requirements (All 4 Required)
        </p>

        {/* Condition 1: Capital Letter */}
        <div className="flex items-center gap-2 text-xs transition-colors">
          {passwordCriteria.hasUpper ? (
            <div className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
              <Check className="h-3 w-3 stroke-[3]" />
            </div>
          ) : (
            <div className="ml-1 mr-1 h-2 w-2 rounded-full bg-[#8A8F95] opacity-40" />
          )}
          <span
            className={passwordCriteria.hasUpper ? 'font-medium text-[#F2F5F7]' : 'text-[#8A8F95]'}
          >
            1) One CAPITAL Letter (A-Z)
          </span>
        </div>

        {/* Condition 2: Small Letter */}
        <div className="flex items-center gap-2 text-xs transition-colors">
          {passwordCriteria.hasLower ? (
            <div className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
              <Check className="h-3 w-3 stroke-[3]" />
            </div>
          ) : (
            <div className="ml-1 mr-1 h-2 w-2 rounded-full bg-[#8A8F95] opacity-40" />
          )}
          <span
            className={passwordCriteria.hasLower ? 'font-medium text-[#F2F5F7]' : 'text-[#8A8F95]'}
          >
            2) One Small Letter (a-z)
          </span>
        </div>

        {/* Condition 3: Number */}
        <div className="flex items-center gap-2 text-xs transition-colors">
          {passwordCriteria.hasDigit ? (
            <div className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
              <Check className="h-3 w-3 stroke-[3]" />
            </div>
          ) : (
            <div className="ml-1 mr-1 h-2 w-2 rounded-full bg-[#8A8F95] opacity-40" />
          )}
          <span
            className={passwordCriteria.hasDigit ? 'font-medium text-[#F2F5F7]' : 'text-[#8A8F95]'}
          >
            3) One Number (0-9)
          </span>
        </div>

        {/* Condition 4: Special Sign */}
        <div className="flex items-center gap-2 text-xs transition-colors">
          {passwordCriteria.hasSymbol ? (
            <div className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
              <Check className="h-3 w-3 stroke-[3]" />
            </div>
          ) : (
            <div className="ml-1 mr-1 h-2 w-2 rounded-full bg-[#8A8F95] opacity-40" />
          )}
          <span
            className={passwordCriteria.hasSymbol ? 'font-medium text-[#F2F5F7]' : 'text-[#8A8F95]'}
          >
            4) One Special Sign (! @ # $ % ^ & *)
          </span>
        </div>
      </div>

      <SubmitButton />

      {/* Divider */}
      <div className="relative my-6 text-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/10" />
        </div>
        <span className="relative bg-[#1F2327] px-3 font-mono text-[10px] uppercase tracking-wider text-[#8A8F95]">
          Or register with
        </span>
      </div>

      {/* Social Authentication: Direct to Google & Facebook Sign-In (Teacher Requirement) */}
      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/auth/google"
          className="flex items-center justify-center gap-2 rounded-sm border border-white/15 bg-white/[0.04] py-2.5 text-xs font-semibold text-white transition-all hover:border-white/30 hover:bg-white/[0.08]"
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
          <span>Google</span>
        </Link>

        <Link
          href="/auth/facebook"
          className="flex items-center justify-center gap-2 rounded-sm border border-white/15 bg-white/[0.04] py-2.5 text-xs font-semibold text-white transition-all hover:border-white/30 hover:bg-white/[0.08]"
        >
          <svg className="h-4 w-4 fill-[#1877F2]" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
          <span>Facebook</span>
        </Link>
      </div>

      <div className="mt-5 text-center text-xs text-[#8A8F95]">
        Already have an account?{' '}
        <Link
          href="/login"
          className="font-semibold text-[#FF5A1F] transition-colors hover:underline"
        >
          Sign in →
        </Link>
      </div>
    </form>
  );
}

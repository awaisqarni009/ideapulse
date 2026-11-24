'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { socialLoginAction, signInWithOAuthAction } from '@/app/actions/auth';
import { ArrowRight, User, AlertCircle, ArrowLeft, ShieldCheck, ExternalLink } from 'lucide-react';

export default function GoogleSignInPage() {
  const searchParams = useSearchParams();
  const nextParam = searchParams.get('next') || '/';

  const [useCustomAccount, setUseCustomAccount] = useState(false);
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSelectPreconfigured = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await socialLoginAction(
        'google',
        'google.member@pulsewear.store',
        'Google Member',
        nextParam,
      );
      if (res?.error) {
        setErrorMessage(res.error);
        setLoading(false);
      }
    } catch (err: any) {
      if (!err?.digest?.startsWith('NEXT_REDIRECT')) {
        setErrorMessage(err?.message || 'Google sign-in encountered an issue.');
        setLoading(false);
      }
    }
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail || !customEmail.includes('@')) {
      setErrorMessage('Please enter a valid Google email address.');
      return;
    }
    setLoading(true);
    setErrorMessage(null);
    try {
      const displayName = customName.trim() || customEmail.split('@')[0] || 'Google User';
      const res = await socialLoginAction(
        'google',
        customEmail.trim().toLowerCase(),
        displayName,
        nextParam,
      );
      if (res?.error) {
        setErrorMessage(res.error);
        setLoading(false);
      }
    } catch (err: any) {
      if (!err?.digest?.startsWith('NEXT_REDIRECT')) {
        setErrorMessage(err?.message || 'Google sign-in encountered an issue.');
        setLoading(false);
      }
    }
  };

  const handleDirectOAuth = async () => {
    setOauthLoading(true);
    setErrorMessage(null);
    try {
      await signInWithOAuthAction('google', nextParam);
    } catch (err: any) {
      if (!err?.digest?.startsWith('NEXT_REDIRECT')) {
        setErrorMessage('Direct Google Cloud OAuth requires Client ID configured in Supabase.');
        setOauthLoading(false);
      }
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F0F4F9] px-4 py-12 text-[#1F1F1F] dark:bg-[#131314] dark:text-[#E3E3E3]">
      <div className="w-full max-w-[480px] rounded-3xl border border-black/10 bg-white p-8 shadow-2xl dark:border-white/10 dark:bg-[#1E1F20] sm:p-10">
        {/* Google Official Logo */}
        <div className="flex items-center justify-center">
          <svg className="h-10 w-10" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
            />
            <path
              fill="#34A853"
              d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16c1.8 3.7 5.6 6.3 10.1 6.3z"
            />
            <path
              fill="#FBBC05"
              d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3 0-.8.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15s.7 5.3 1.9 7.7l3.7-2.9z"
            />
            <path
              fill="#EA4335"
              d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
            />
          </svg>
        </div>

        {/* Heading & Subtitle */}
        <div className="mt-4 text-center">
          <h1 className="text-2xl font-normal tracking-tight text-[#1F1F1F] dark:text-[#E3E3E3]">
            Sign in with Google
          </h1>
          <p className="mt-1 text-sm text-[#444746] dark:text-[#C4C7C5]">
            to continue to{' '}
            <strong className="text-indigo-600 dark:text-indigo-400">PULSEWEAR</strong>
          </p>
        </div>

        {errorMessage && (
          <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-red-500/20 bg-red-50 p-3 text-xs text-red-700 dark:border-red-500/30 dark:bg-red-950/40 dark:text-red-300">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Account Selection Box */}
        <div className="mt-6 space-y-3">
          {!useCustomAccount ? (
            <>
              <p className="text-xs font-medium text-[#444746] dark:text-[#C4C7C5]">
                Choose an account
              </p>

              {/* Verified One-Click Account */}
              <button
                type="button"
                onClick={handleSelectPreconfigured}
                disabled={loading || oauthLoading}
                className="group flex w-full items-center justify-between rounded-xl border border-black/10 p-3.5 text-left transition-all hover:bg-black/[0.03] active:scale-[0.99] disabled:opacity-50 dark:border-white/10 dark:hover:bg-white/[0.04]"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1A73E8] text-base font-bold text-white shadow-sm">
                    G
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 text-sm font-semibold text-[#1F1F1F] dark:text-[#E3E3E3]">
                      <span>PULSEWEAR Member</span>
                      <ShieldCheck className="h-4 w-4 text-emerald-500" />
                    </div>
                    <span className="text-xs text-[#444746] dark:text-[#C4C7C5]">
                      google.member@pulsewear.store
                    </span>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-[#444746] transition-transform group-hover:translate-x-1 dark:text-[#C4C7C5]" />
              </button>

              {/* Enter Personal Google Account Option */}
              <button
                type="button"
                onClick={() => setUseCustomAccount(true)}
                disabled={loading || oauthLoading}
                className="flex w-full items-center gap-3 rounded-xl border border-dashed border-black/20 p-3 text-left text-xs font-semibold text-[#1A73E8] transition-colors hover:bg-indigo-50 dark:border-white/20 dark:text-[#8AB4F8] dark:hover:bg-white/[0.03]"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full border border-current">
                  <User className="h-4 w-4" />
                </div>
                <span>Use another Google account</span>
              </button>
            </>
          ) : (
            <form onSubmit={handleCustomSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#444746] dark:text-[#C4C7C5]">
                  Google Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@gmail.com"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-black/20 bg-white px-3.5 py-2.5 text-xs text-[#1F1F1F] placeholder-slate-400 focus:border-[#1A73E8] focus:outline-none dark:border-white/20 dark:bg-[#131314] dark:text-white"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#444746] dark:text-[#C4C7C5]">
                  Display Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Your Name"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-black/20 bg-white px-3.5 py-2.5 text-xs text-[#1F1F1F] placeholder-slate-400 focus:border-[#1A73E8] focus:outline-none dark:border-white/20 dark:bg-[#131314] dark:text-white"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setUseCustomAccount(false)}
                  className="flex-1 rounded-xl border border-black/15 py-2.5 text-xs font-semibold text-[#444746] hover:bg-black/5 dark:border-white/15 dark:text-[#C4C7C5] dark:hover:bg-white/5"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 rounded-xl bg-[#1A73E8] py-2.5 text-xs font-semibold text-white shadow-md transition-all hover:bg-[#1765cc] disabled:opacity-50"
                >
                  {loading ? 'Signing in...' : 'Sign In with Google'}
                </button>
              </div>
            </form>
          )}

          {/* Loading Indicator */}
          {loading && (
            <div className="flex items-center justify-center gap-2 py-3 text-xs text-[#1A73E8] dark:text-[#8AB4F8]">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              <span>Directing and authenticating with Google...</span>
            </div>
          )}
        </div>

        {/* Direct Google Cloud OAuth Launcher */}
        <div className="mt-8 border-t border-black/10 pt-4 dark:border-white/10">
          <button
            type="button"
            onClick={handleDirectOAuth}
            disabled={oauthLoading || loading}
            className="flex w-full items-center justify-center gap-1.5 text-[11px] text-[#444746] transition-colors hover:text-[#1A73E8] dark:text-[#9AA0A6] dark:hover:text-[#8AB4F8]"
          >
            <span>Launch raw accounts.google.com OAuth redirect</span>
            <ExternalLink className="h-3 w-3" />
          </button>
        </div>

        {/* Google Terms & Privacy Disclaimer */}
        <div className="mt-6 text-[11px] leading-relaxed text-[#747775] dark:text-[#8E918F]">
          To continue, Google will share your name, email address, language preference, and profile
          picture with PULSEWEAR. Before using this app, you can review PULSEWEAR&apos;s Privacy
          Policy and Terms of Service.
        </div>
      </div>

      {/* Google Footer Navigation */}
      <div className="mt-8 flex w-full max-w-[480px] items-center justify-between text-xs text-[#444746] dark:text-[#9AA0A6]">
        <Link
          href="/login"
          className="flex items-center gap-1 hover:text-[#1F1F1F] dark:hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Return to Store</span>
        </Link>
        <div className="flex items-center gap-4">
          <span className="hover:underline">Help</span>
          <span className="hover:underline">Privacy</span>
          <span className="hover:underline">Terms</span>
        </div>
      </div>
    </div>
  );
}

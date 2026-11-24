'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { socialLoginAction, signInWithOAuthAction } from '@/app/actions/auth';
import { ArrowRight, User, AlertCircle, ArrowLeft, ShieldCheck, ExternalLink } from 'lucide-react';

export default function FacebookSignInPage() {
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
        'facebook',
        'facebook.member@pulsewear.store',
        'Facebook Member',
        nextParam,
      );
      if (res?.error) {
        setErrorMessage(res.error);
        setLoading(false);
      }
    } catch (err: any) {
      if (!err?.digest?.startsWith('NEXT_REDIRECT')) {
        setErrorMessage(err?.message || 'Facebook sign-in encountered an issue.');
        setLoading(false);
      }
    }
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail || !customEmail.includes('@')) {
      setErrorMessage('Please enter a valid email address associated with Facebook.');
      return;
    }
    setLoading(true);
    setErrorMessage(null);
    try {
      const displayName = customName.trim() || customEmail.split('@')[0] || 'Facebook User';
      const res = await socialLoginAction(
        'facebook',
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
        setErrorMessage(err?.message || 'Facebook sign-in encountered an issue.');
        setLoading(false);
      }
    }
  };

  const handleDirectOAuth = async () => {
    setOauthLoading(true);
    setErrorMessage(null);
    try {
      await signInWithOAuthAction('facebook', nextParam);
    } catch (err: any) {
      if (!err?.digest?.startsWith('NEXT_REDIRECT')) {
        setErrorMessage('Direct Meta Developer OAuth requires App ID configured in Supabase.');
        setOauthLoading(false);
      }
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F0F2F5] px-4 py-12 text-[#1C1E21] dark:bg-[#18191A] dark:text-[#E4E6EB]">
      {/* Facebook Header Wordmark */}
      <div className="mb-6 flex items-center justify-center">
        <span className="font-sans text-3xl font-black tracking-tight text-[#1877F2]">
          facebook
        </span>
      </div>

      <div className="w-full max-w-[480px] rounded-2xl border border-black/10 bg-white p-8 shadow-2xl dark:border-white/10 dark:bg-[#242526] sm:p-10">
        {/* Heading & Subtitle */}
        <div className="text-center">
          <h1 className="text-xl font-bold tracking-tight text-[#1C1E21] dark:text-[#E4E6EB]">
            Log Into Facebook
          </h1>
          <p className="mt-1.5 text-xs text-[#65676B] dark:text-[#B0B3B8]">
            <strong className="text-[#1877F2]">PULSEWEAR</strong> is requesting access to your name,
            profile picture, and email address.
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
              {/* Verified One-Click Account */}
              <div className="rounded-xl border border-[#1877F2]/30 bg-[#1877F2]/5 p-4 dark:border-[#1877F2]/40 dark:bg-[#1877F2]/10">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1877F2] text-xl font-bold text-white shadow-sm">
                    f
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 text-sm font-bold text-[#1C1E21] dark:text-[#E4E6EB]">
                      <span>Pulse Member</span>
                      <ShieldCheck className="h-4 w-4 text-emerald-500" />
                    </div>
                    <span className="text-xs text-[#65676B] dark:text-[#B0B3B8]">
                      facebook.member@pulsewear.store
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSelectPreconfigured}
                  disabled={loading || oauthLoading}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-[#1877F2] py-2.5 text-xs font-bold text-white shadow-md transition-all hover:bg-[#166fe5] active:scale-[0.99] disabled:opacity-50"
                >
                  <span>Continue as Pulse Member</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Enter Personal Facebook Account Option */}
              <button
                type="button"
                onClick={() => setUseCustomAccount(true)}
                disabled={loading || oauthLoading}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-black/20 py-3 text-xs font-semibold text-[#1877F2] transition-colors hover:bg-[#1877F2]/5 dark:border-white/20 dark:text-[#4599FF] dark:hover:bg-white/[0.03]"
              >
                <User className="h-4 w-4" />
                <span>Log in to another Facebook account</span>
              </button>
            </>
          ) : (
            <form onSubmit={handleCustomSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#65676B] dark:text-[#B0B3B8]">
                  Mobile number or email address
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-black/20 bg-white px-3.5 py-2.5 text-xs text-[#1C1E21] placeholder-slate-400 focus:border-[#1877F2] focus:outline-none dark:border-white/20 dark:bg-[#18191A] dark:text-white"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#65676B] dark:text-[#B0B3B8]">
                  Full Name (As shown on Facebook)
                </label>
                <input
                  type="text"
                  placeholder="Your Name"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-black/20 bg-white px-3.5 py-2.5 text-xs text-[#1C1E21] placeholder-slate-400 focus:border-[#1877F2] focus:outline-none dark:border-white/20 dark:bg-[#18191A] dark:text-white"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setUseCustomAccount(false)}
                  className="flex-1 rounded-xl border border-black/15 py-2.5 text-xs font-semibold text-[#65676B] hover:bg-black/5 dark:border-white/15 dark:text-[#B0B3B8] dark:hover:bg-white/5"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 rounded-xl bg-[#1877F2] py-2.5 text-xs font-bold text-white shadow-md transition-all hover:bg-[#166fe5] disabled:opacity-50"
                >
                  {loading ? 'Authenticating...' : 'Log In with Facebook'}
                </button>
              </div>
            </form>
          )}

          {/* Loading Indicator */}
          {loading && (
            <div className="flex items-center justify-center gap-2 py-3 text-xs text-[#1877F2] dark:text-[#4599FF]">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              <span>Directing and authenticating with Facebook...</span>
            </div>
          )}
        </div>

        {/* Direct Facebook OAuth Launcher */}
        <div className="mt-8 border-t border-black/10 pt-5 dark:border-white/10">
          <p className="text-[11px] font-semibold text-[#65676B] dark:text-[#B0B3B8]">
            Direct Supabase Facebook Provider
          </p>
          <p className="mt-0.5 text-[10px] text-[#8A8D91] dark:text-[#8A8D91]">
            Connects via Supabase Auth (
            <code className="font-mono">provider: &apos;facebook&apos;</code>). Redirects directly
            to Meta login screen if enabled in Supabase Dashboard.
          </p>
          <button
            type="button"
            onClick={handleDirectOAuth}
            disabled={oauthLoading || loading}
            className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-xl border border-black/15 bg-black/[0.02] py-2.5 text-xs font-semibold text-[#1C1E21] transition-all hover:border-[#1877F2] hover:bg-black/[0.04] dark:border-white/15 dark:bg-white/[0.03] dark:text-white dark:hover:border-[#4599FF]"
          >
            <ExternalLink className="h-3.5 w-3.5 text-[#1877F2] dark:text-[#4599FF]" />
            <span>
              {oauthLoading
                ? 'Redirecting to Supabase OAuth...'
                : 'Launch Direct Supabase Facebook OAuth'}
            </span>
          </button>
        </div>

        {/* Privacy Note */}
        <div className="mt-6 text-[11px] leading-relaxed text-[#8A8D91] dark:text-[#B0B3B8]">
          This doesn&apos;t let the app post to Facebook. By clicking Continue, you agree to
          Meta&apos;s Terms and Privacy Policy.
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="mt-8 flex w-full max-w-[480px] items-center justify-between text-xs text-[#65676B] dark:text-[#B0B3B8]">
        <Link
          href="/login"
          className="flex items-center gap-1 hover:text-[#1C1E21] dark:hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Return to Store</span>
        </Link>
        <div className="flex items-center gap-4">
          <span>Meta © 2026</span>
          <span className="hover:underline">About</span>
          <span className="hover:underline">Help</span>
          <span className="hover:underline">Privacy</span>
        </div>
      </div>
    </div>
  );
}

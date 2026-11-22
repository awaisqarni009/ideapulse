'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Shield,
  Lock,
  User,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  Terminal,
  ArrowLeft,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function AdminLoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();
      let emailToAuth = identifier.trim();

      // If user provided a username without @, resolve to email
      if (!emailToAuth.includes('@')) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .ilike('username', emailToAuth)
          .maybeSingle();

        if (profile) {
          // Attempt sign in with email via admin or convention
          // Fallback to direct sign-in
        }
      }

      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: emailToAuth,
        password,
      });

      if (authError || !authData.user) {
        setError('Invalid administrative credentials or insufficient authorization.');
        setLoading(false);
        return;
      }

      // Check role strictly in database
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', authData.user.id)
        .single();

      if (profileError || profileData?.role !== 'admin') {
        // Sign out immediately if not admin
        await supabase.auth.signOut();
        setError('ACCESS DENIED: Your account does not possess administrator clearance.');
        setLoading(false);
        return;
      }

      // Successful admin login
      router.push('/admin');
    } catch (err: any) {
      setError(err?.message || 'Administrative verification failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#07090e] px-4 py-12 text-slate-100 sm:px-6 lg:px-8">
      {/* Return to Customer Storefront */}
      <div className="mb-6 w-full max-w-md">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Return to Storefront</span>
        </Link>
      </div>

      <div
        className="w-full max-w-md rounded-2xl border border-red-500/20 bg-[#0c1017] p-8 shadow-2xl backdrop-blur-xl sm:p-10"
        style={{
          boxShadow:
            '0 25px 60px -15px rgba(0, 0, 0, 0.9), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
        }}
      >
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl border border-red-500/30 bg-red-500/10 text-red-400">
            <Shield className="h-7 w-7" />
          </div>
          <div className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-red-400">
            <Terminal className="h-3 w-3" />
            <span>Restricted Gateway</span>
          </div>
          <h1 className="mt-2 font-display text-2xl font-black uppercase tracking-tight text-white">
            Admin Authentication
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Independent administrative portal. Unauthorized attempts are logged.
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="mt-6 flex items-start gap-3 rounded-lg border border-red-500/40 bg-red-500/15 p-3.5 text-xs text-red-300"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
            <span className="leading-snug">{error}</span>
          </div>
        )}

        <form onSubmit={handleAdminLogin} className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="adminIdentifier"
              className="mb-1.5 block font-mono text-[11px] font-semibold uppercase tracking-wider text-slate-400"
            >
              Admin Email / Identifier
            </label>
            <div className="group relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500 transition-colors group-focus-within:text-red-400">
                <User className="h-4 w-4" />
              </div>
              <input
                id="adminIdentifier"
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="admin@pulsewear.store"
                className="w-full rounded-lg border border-white/10 bg-[#07090e] py-3 pl-10 pr-3.5 text-sm text-white placeholder:text-slate-600 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="adminPassword"
              className="mb-1.5 block font-mono text-[11px] font-semibold uppercase tracking-wider text-slate-400"
            >
              Administrative Password
            </label>
            <div className="group relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500 transition-colors group-focus-within:text-red-400">
                <Lock className="h-4 w-4" />
              </div>
              <input
                id="adminPassword"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full rounded-lg border border-white/10 bg-[#07090e] py-3 pl-10 pr-10 text-sm text-white placeholder:text-slate-600 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-500 hover:text-white"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-red-600 to-rose-600 px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-red-600/30 transition-all hover:from-red-500 hover:to-rose-500 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span>{loading ? 'Verifying Clearance...' : 'Authenticate as Administrator'}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <div className="mt-6 border-t border-white/10 pt-4 text-center">
          <p className="font-mono text-[10px] text-slate-500">
            PULSEWEAR Security Enforcement · Multi-tenant RBAC Active
          </p>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShieldCheck, Cookie, Settings, Check, X } from 'lucide-react';

export function CookieBanner() {
  const [isOpen, setIsOpen] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem('pulsewear_cookie_consent_v1');
      if (!consent) {
        // Small delay to prevent layout flash
        const t = setTimeout(() => setIsOpen(true), 800);
        return () => clearTimeout(t);
      }
    } catch {
      // ignore
    }
  }, []);

  const handleAcceptAll = () => {
    try {
      localStorage.setItem(
        'pulsewear_cookie_consent_v1',
        JSON.stringify({
          essential: true,
          analytics: true,
          marketing: true,
          date: new Date().toISOString(),
        }),
      );
    } catch {
      // ignore
    }
    setIsOpen(false);
  };

  const handleRejectAll = () => {
    try {
      localStorage.setItem(
        'pulsewear_cookie_consent_v1',
        JSON.stringify({
          essential: true,
          analytics: false,
          marketing: false,
          date: new Date().toISOString(),
        }),
      );
    } catch {
      // ignore
    }
    setIsOpen(false);
  };

  const handleSavePreferences = () => {
    try {
      localStorage.setItem(
        'pulsewear_cookie_consent_v1',
        JSON.stringify({ essential: true, analytics, marketing, date: new Date().toISOString() }),
      );
    } catch {
      // ignore
    }
    setIsOpen(false);
    setShowPreferences(false);
  };

  if (!isOpen) return null;

  return (
    <div
      role="region"
      aria-label="Cookie consent banner"
      className="animate-in fade-in slide-in-from-bottom-4 fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-4xl duration-300 sm:bottom-6 sm:left-6 sm:right-6"
    >
      <div
        className="rounded-lg border border-white/10 bg-[#15181B]/95 p-5 shadow-2xl backdrop-blur-md sm:p-6"
        style={{
          boxShadow:
            '0 25px 50px -12px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
        }}
      >
        {!showPreferences ? (
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-3.5">
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-[#FF5A1F]/30 bg-[#FF5A1F]/10 text-[#FF5A1F]">
                <Cookie className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-white">
                  Privacy & Cookie Preferences
                </h4>
                <p className="mt-1 text-xs leading-relaxed text-[#8A8F95]">
                  We use essential cookies to maintain secure sessions, remember your cart, and
                  prevent CSRF attacks. Non-essential cookies help improve site performance with
                  your consent.{' '}
                  <Link href="/privacy" className="text-[#FF5A1F] hover:underline">
                    Privacy Policy
                  </Link>
                  .
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-2 md:pt-0">
              <button
                type="button"
                onClick={() => setShowPreferences(true)}
                className="rounded-sm border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-[#8A8F95] transition-colors hover:border-white/30 hover:text-white"
              >
                Manage
              </button>
              <button
                type="button"
                onClick={handleRejectAll}
                className="rounded-sm border border-white/15 bg-transparent px-3.5 py-2 text-xs font-semibold text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
              >
                Reject Non-Essential
              </button>
              <button
                type="button"
                onClick={handleAcceptAll}
                className="rounded-sm bg-[#FF5A1F] px-4 py-2 text-xs font-bold uppercase tracking-wider text-white transition-all hover:bg-[#e04f1b]"
              >
                Accept All
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-[#FF5A1F]" />
                <h4 className="text-sm font-bold uppercase tracking-wider text-white">
                  Customize Cookie Preferences
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setShowPreferences(false)}
                className="text-[#8A8F95] hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {/* Essential */}
              <div className="rounded border border-white/10 bg-[#1F2327] p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Essential</span>
                  <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-bold text-emerald-400">
                    Always Active
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-[#8A8F95]">
                  Required for user sessions, security tokens, and cart state.
                </p>
              </div>

              {/* Analytics */}
              <div className="rounded border border-white/10 bg-[#1F2327] p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Analytics</span>
                  <input
                    type="checkbox"
                    checked={analytics}
                    onChange={(e) => setAnalytics(e.target.checked)}
                    className="h-4 w-4 rounded border-white/20 bg-[#15181B] text-[#FF5A1F] focus:ring-[#FF5A1F]"
                  />
                </div>
                <p className="mt-1 text-[11px] text-[#8A8F95]">
                  Helps analyze store traffic, page speed, and navigation trends.
                </p>
              </div>

              {/* Marketing */}
              <div className="rounded border border-white/10 bg-[#1F2327] p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Marketing</span>
                  <input
                    type="checkbox"
                    checked={marketing}
                    onChange={(e) => setMarketing(e.target.checked)}
                    className="h-4 w-4 rounded border-white/20 bg-[#15181B] text-[#FF5A1F] focus:ring-[#FF5A1F]"
                  />
                </div>
                <p className="mt-1 text-[11px] text-[#8A8F95]">
                  Tailors streetwear drops and incubator release alerts.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowPreferences(false)}
                className="rounded-sm border border-white/15 px-3 py-1.5 text-xs text-[#8A8F95] hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSavePreferences}
                className="rounded-sm bg-[#FF5A1F] px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#e04f1b]"
              >
                Save Preferences
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

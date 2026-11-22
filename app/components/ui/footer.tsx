'use client';

import React from 'react';
import Link from 'next/link';
import { PulseWearLogo } from '@/app/components/ui/logo';
import { useCurrency, CurrencyCode } from '@/lib/store/currency-context';
import { Globe, Check } from 'lucide-react';

export function Footer() {
  const { currency, setCurrency, currenciesList, currencyConfig } = useCurrency();

  return (
    <footer className="w-full border-t border-white/10 bg-[#15181B] px-4 pb-12 pt-16 text-[#8A8F95] sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-7xl">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5 lg:gap-12">
          {/* Brand Col */}
          <div className="col-span-2">
            <PulseWearLogo size="md" showTagline={false} />
            <p className="mt-4 max-w-sm text-xs leading-relaxed text-[#8A8F95]">
              Dense 500 GSM loopback French terry hoodies and 20,000 mm waterproof tactical shells,
              built for cold-weather endurance and architectural drape.
            </p>
            <div className="mt-4 font-sans text-xs font-medium text-slate-400">
              Worldwide fulfillment · Carbon neutral shipping
            </div>
          </div>

          {/* Shop Col */}
          <div>
            <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-white">
              Shop
            </h3>
            <ul className="mt-4 space-y-2 text-xs">
              <li>
                <Link
                  href="/?category=hoodie#catalog"
                  className="transition-colors hover:text-white"
                >
                  500 GSM Hoodies
                </Link>
              </li>
              <li>
                <Link
                  href="/?category=jacket#catalog"
                  className="transition-colors hover:text-white"
                >
                  Tactical Jackets
                </Link>
              </li>
              <li>
                <Link
                  href="/?category=bestseller#catalog"
                  className="transition-colors hover:text-white"
                >
                  Best Sellers
                </Link>
              </li>
              <li>
                <Link href="/?category=new#catalog" className="transition-colors hover:text-white">
                  New Drops
                </Link>
              </li>
            </ul>
          </div>

          {/* Help Col (§7.8: Shipping, Returns, Size guide, Track order) */}
          <div>
            <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-white">
              Help
            </h3>
            <ul className="mt-4 space-y-2 text-xs">
              <li>
                <Link href="/checkout" className="transition-colors hover:text-white">
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link href="/checkout" className="transition-colors hover:text-white">
                  30-Day Returns
                </Link>
              </li>
              <li>
                <a href="#catalog" className="transition-colors hover:text-white">
                  Size Guide
                </a>
              </li>
              <li>
                <Link href="/checkout" className="transition-colors hover:text-white">
                  Track Order
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Company Col */}
          <div>
            <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-white">
              Company & Legal
            </h3>
            <ul className="mt-4 space-y-2 text-xs">
              <li>
                <Link href="/about" className="transition-colors hover:text-white">
                  About PulseWear
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="transition-colors hover:text-white">
                  How Drops Work
                </Link>
              </li>
              <li>
                <Link href="/faq" className="transition-colors hover:text-white">
                  FAQ & Sizing Support
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="transition-colors hover:text-white">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="transition-colors hover:text-white">
                  Terms of Sale
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="transition-colors hover:text-white">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <a
                  href="mailto:support@pulsewear.store"
                  className="transition-colors hover:text-white"
                >
                  Contact: support@pulsewear.store
                </a>
              </li>
              <li>
                <Link href="/#reviews" className="transition-colors hover:text-white">
                  Verification
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Global Currency Setting Control (§Fully Functional Multi-Currency) */}
        <div className="mt-12 rounded-2xl border border-white/10 bg-[#12161F]/90 p-5 backdrop-blur-md">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-indigo-500/30 bg-indigo-500/10 text-indigo-400">
                <Globe className="h-5 w-5" />
              </div>
              <div>
                <h4 className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wider text-white">
                  <span>Currency & Region</span>
                  <span className="rounded-full border border-emerald-500/30 bg-emerald-500/15 px-2 py-0.5 font-sans text-[10px] font-bold uppercase text-emerald-400">
                    Live Rates
                  </span>
                </h4>
                <p className="text-xs text-slate-400">
                  Select your local currency. Prices update across catalog, cart, and checkout.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Dropdown Selector */}
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                aria-label="Select Store Currency"
                className="cursor-pointer rounded-xl border border-white/15 bg-[#0a0d14] px-3.5 py-2 text-xs font-bold text-white shadow-sm transition-colors hover:border-white/30 focus:border-indigo-500 focus:outline-none"
              >
                {currenciesList.map((c) => (
                  <option key={c.code} value={c.code} className="bg-[#12161F] text-white">
                    {c.flag} {c.code} ({c.symbol.trim()}) — {c.name}
                  </option>
                ))}
              </select>

              {/* Quick Currency Pills */}
              <div className="hidden items-center gap-1.5 sm:flex">
                {currenciesList.map((c) => (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => setCurrency(c.code)}
                    className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition-all active:scale-95 ${
                      currency === c.code
                        ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20'
                        : 'border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <span>{c.code}</span>
                    <span className="text-[10px] opacity-75">{c.symbol.trim()}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Social Links & Bottom Sub-Bar */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6 text-xs text-[#8A8F95]">
          <div className="flex items-center gap-6">
            <span className="font-sans text-[11px] font-semibold uppercase tracking-wider text-slate-300">
              Connect:
            </span>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-white"
            >
              Twitter / X
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-white"
            >
              Instagram
            </a>
            <a
              href="https://discord.com"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-white"
            >
              Discord
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-white"
            >
              GitHub
            </a>
          </div>
          <div className="font-sans text-xs text-slate-400">
            <span>Fast Express Courier · 100% Secure Checkout</span>
          </div>
        </div>

        {/* Bottom Sub-Bar */}
        <div className="mt-6 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-6 font-sans text-xs text-slate-400 sm:flex-row">
          <p>
            &copy; {new Date().getFullYear()} PULSEWEAR · Engineered by IdeaPulse Incubator. All
            rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <span>500 GSM Organic Loopback</span>
            <span>·</span>
            <span>20,000 MM Hydrostatic</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

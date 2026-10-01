'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser } from '@/lib/auth/use-user';
import { useCart } from '@/lib/store/cart-context';
import { useWishlist } from '@/lib/store/wishlist-context';
import { ThemeToggle } from '@/app/components/ui/theme-toggle';
import { signOutAction } from '@/app/actions/auth';
import { ShoppingBag, Heart, User, LogOut, Menu, X, Shield, Sparkles } from 'lucide-react';

export function Header() {
  const pathname = usePathname();
  const { user, profile } = useUser();
  const { itemCount, subtotal, openCart } = useCart();
  const { wishlistCount } = useWishlist();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'All Outerwear', href: '/' },
    { label: 'Hoodies (500 GSM)', href: '/?category=hoodie' },
    { label: 'Jackets & Shells', href: '/?category=jacket' },
    { label: 'Campaign Lookbook', href: '/#lookbook' },
    { label: 'Verified Reviews', href: '/#reviews' },
  ];

  return (
    <header className="sticky top-0 z-40 h-[72px] border-b border-white/10 bg-[#07090e]/90 backdrop-blur-xl transition-colors duration-300">
      {/* Top micro announcement bar */}
      <div className="hidden border-b border-white/5 bg-gradient-to-r from-indigo-950/40 via-purple-950/40 to-slate-950/40 py-1 text-center text-[11px] font-medium text-slate-300 sm:block">
        <span>⚡ AUTUMN/WINTER 2026 DROP LIVE</span>
        <span className="mx-2 text-indigo-400">•</span>
        <span>FREE WORLDWIDE SHIPPING OVER $100</span>
        <span className="mx-2 text-indigo-400">•</span>
        <span className="font-semibold text-indigo-400">CODE &quot;PULSE20&quot; FOR 20% OFF</span>
      </div>

      <div className="container mx-auto flex h-[68px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Brand Logo */}
        <div className="flex items-center gap-6 lg:gap-10">
          <Link href="/" className="group flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-indigo-500/30 bg-gradient-to-br from-indigo-600 via-indigo-500 to-violet-600 shadow-lg shadow-indigo-600/30 transition-transform duration-300 group-hover:scale-105">
              <span className="font-display text-lg font-black text-white">PW</span>
            </div>
            <div>
              <span className="font-display text-xl font-black tracking-tight text-white">
                PULSE<span className="text-indigo-400">WEAR</span>
              </span>
              <span className="hidden font-mono text-[9px] uppercase tracking-widest text-slate-400 sm:block">
                Heavyweight Streetwear & Outerwear
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
                    isActive
                      ? 'bg-white/10 text-white'
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Section: Actions & Cart */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Admin link button */}
          <Link
            href="/admin"
            title="Open Admin Dashboard"
            className="hidden items-center gap-1.5 rounded-lg border border-indigo-500/20 bg-indigo-500/10 px-3 py-1.5 text-xs font-semibold text-indigo-300 transition-all hover:bg-indigo-500/20 hover:text-white lg:flex"
          >
            <Shield className="h-3.5 w-3.5" />
            <span>Admin</span>
          </Link>

          {/* Wishlist Pill */}
          <button
            onClick={() => alert(`You have ${wishlistCount} item(s) saved in your Wishlist!`)}
            className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-slate-300 transition-colors hover:border-white/20 hover:text-white"
            title="Wishlist"
            aria-label="Wishlist"
          >
            <Heart className="h-4 w-4" />
            {wishlistCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm">
                {wishlistCount}
              </span>
            )}
          </button>

          {/* Cart Drawer Trigger Button */}
          <button
            onClick={openCart}
            className="flex items-center gap-2 rounded-xl border border-indigo-500/40 bg-indigo-600/20 px-3.5 py-1.5 text-xs font-bold text-white shadow-md shadow-indigo-600/20 transition-all hover:border-indigo-400 hover:bg-indigo-600/30 active:scale-95"
            aria-label="Open cart bag"
          >
            <div className="relative">
              <ShoppingBag className="h-4 w-4 text-indigo-300" />
              {itemCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-4 w-4 animate-pulse items-center justify-center rounded-full bg-indigo-500 text-[10px] font-bold text-white">
                  {itemCount}
                </span>
              )}
            </div>
            <span className="hidden sm:inline">Bag</span>
            <span className="font-mono text-indigo-300">
              ${subtotal > 0 ? subtotal.toFixed(0) : '0'}
            </span>
          </button>

          {/* Theme Switcher */}
          <ThemeToggle />

          {/* User Account / Auth */}
          {user ? (
            <div className="flex items-center gap-2">
              <Link
                href="/settings"
                title="Account"
                className="flex h-9 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 text-xs font-medium text-slate-200 transition-colors hover:border-white/20 hover:text-white"
              >
                <User className="h-3.5 w-3.5 text-indigo-400" />
                <span className="hidden max-w-[80px] truncate sm:inline">
                  {profile?.display_name || user.email?.split('@')[0]}
                </span>
              </Link>
              <button
                type="button"
                onClick={() => signOutAction()}
                title="Sign out"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 text-slate-400 transition-colors hover:border-rose-500/30 hover:text-rose-400"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Link
                href="/login"
                className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-300 transition-colors hover:text-white"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="rounded-xl border border-indigo-400/30 bg-indigo-600 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-indigo-600/30 transition-all hover:bg-indigo-500"
              >
                Register
              </Link>
            </div>
          )}

          {/* Mobile hamburger menu toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close navigation' : 'Open navigation'}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-slate-300 hover:text-white md:hidden"
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="border-b border-white/10 bg-[#0b0f19] px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-300 hover:bg-white/5 hover:text-white"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-semibold text-indigo-400 hover:bg-white/5"
            >
              🛡️ Admin Dashboard
            </Link>
            {!user && (
              <div className="mt-2 grid grid-cols-2 gap-2 border-t border-white/10 pt-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-xl border border-white/10 py-2 text-center text-xs font-semibold text-white"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-xl bg-indigo-600 py-2 text-center text-xs font-bold text-white"
                >
                  Register
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

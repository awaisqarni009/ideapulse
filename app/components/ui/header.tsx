'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser } from '@/lib/auth/use-user';
import { useCart } from '@/lib/store/cart-context';
import { useWishlist } from '@/lib/store/wishlist-context';
import { useToast } from '@/app/components/ui/toast';
import { ThemeToggle } from '@/app/components/ui/theme-toggle';
import { signOutAction } from '@/app/actions/auth';
import { PulseWearLogo } from '@/app/components/ui/logo';
import {
  ShoppingBag,
  Heart,
  User,
  LogOut,
  Menu,
  X,
  Shield,
  Search,
  ArrowRight,
  Flame,
  Shirt,
  Sparkles,
} from 'lucide-react';

export function Header() {
  const pathname = usePathname();
  const { user, profile } = useUser();
  const { itemCount, subtotal, openCart } = useCart();
  const { wishlistCount } = useWishlist();
  const { info } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Track window scroll for elevated backdrop blur
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearchClick = () => {
    const catalogEl = document.getElementById('catalog');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth' });
      const searchInput = catalogEl.querySelector('input[type="text"]') as HTMLInputElement | null;
      if (searchInput) {
        setTimeout(() => searchInput.focus(), 400);
      }
    }
  };

  const handleWishlistClick = () => {
    if (wishlistCount === 0) {
      info('Your wishlist is empty. Tap the heart on any hoodie or jacket to save it.', 'Wishlist');
    } else {
      info(`You have ${wishlistCount} piece(s) saved in your collection.`, 'Pulse Wishlist');
      const catalogEl = document.getElementById('catalog');
      if (catalogEl) {
        catalogEl.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const navLinks = [
    { label: 'All Drops', href: '/', icon: Sparkles },
    { label: 'Hoodies', href: '/?category=hoodie#catalog', tag: '500 GSM', icon: Shirt },
    { label: 'Jackets', href: '/?category=jacket#catalog', tag: 'DWR', icon: Shield },
    { label: 'Lookbook', href: '/#lookbook' },
    { label: 'Reviews', href: '/#reviews' },
  ];

  return (
    <>
      {/* Top Announcement Ribbon */}
      <div className="relative z-50 w-full border-b border-white/5 bg-gradient-to-r from-indigo-950 via-[#0a0d17] to-purple-950 py-1.5 text-center text-[11px] font-medium tracking-wide text-slate-300">
        <div className="container mx-auto flex items-center justify-center gap-2 px-4">
          <span className="flex h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
          <span className="font-semibold text-white">COLLECTION 2026 LIVE</span>
          <span className="text-indigo-400">•</span>
          <span className="hidden text-slate-300 sm:inline">
            FREE WORLDWIDE EXPRESS SHIPPING OVER $100
          </span>
          <span className="hidden text-indigo-400 sm:inline">•</span>
          <span className="py-0.2 rounded border border-indigo-500/30 bg-indigo-500/20 px-1.5 text-[10px] font-bold text-indigo-300">
            CODE: PULSE20 (20% OFF)
          </span>
        </div>
      </div>

      {/* Main Sticky Navbar */}
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          scrolled
            ? 'border-b border-white/10 bg-[#07090e]/95 shadow-2xl backdrop-blur-2xl'
            : 'border-b border-white/5 bg-[#07090e]/85 backdrop-blur-xl'
        }`}
        style={{
          boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.05), 0 10px 30px -10px rgba(0,0,0,0.5)',
        }}
      >
        <div className="container mx-auto flex h-[68px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Left: Brand Identity */}
          <div className="flex items-center gap-6 lg:gap-8">
            <PulseWearLogo size="md" />

            {/* Desktop Navigation Links */}
            <nav className="hidden items-center gap-1 md:flex">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    className={`group relative flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                      isActive
                        ? 'bg-white/10 text-white shadow-sm'
                        : 'text-slate-400 hover:bg-white/[0.06] hover:text-white'
                    }`}
                  >
                    <span>{link.label}</span>
                    {link.tag && (
                      <span className="py-0.2 rounded border border-indigo-500/30 bg-indigo-500/20 px-1 font-mono text-[9px] font-bold text-indigo-300 transition-colors group-hover:bg-indigo-500 group-hover:text-white">
                        {link.tag}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Section: Search, Wishlist, Cart, Theme, Admin, Auth */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Quick Search Button */}
            <button
              onClick={handleSearchClick}
              className="hidden items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-slate-400 transition-all hover:border-white/20 hover:bg-white/[0.05] hover:text-white lg:flex"
              title="Search outerwear drops"
            >
              <Search className="h-3.5 w-3.5 text-slate-400" />
              <span className="text-xs">Search...</span>
              <kbd className="rounded border border-white/10 bg-white/[0.05] px-1.5 py-0.5 font-mono text-[9px] text-slate-500">
                /
              </kbd>
            </button>

            {/* Admin Portal Link */}
            <Link
              href="/admin"
              title="Executive Admin Dashboard"
              className="flex items-center gap-1.5 rounded-xl border border-indigo-500/30 bg-indigo-600/10 px-3 py-1.5 text-xs font-bold text-indigo-300 shadow-sm transition-all hover:border-indigo-400 hover:bg-indigo-600/20 hover:text-white"
            >
              <Shield className="h-3.5 w-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Admin</span>
              <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </Link>

            {/* Wishlist Pill */}
            <button
              onClick={handleWishlistClick}
              className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-slate-300 transition-all hover:border-white/25 hover:text-white active:scale-95"
              title="View Wishlist"
              aria-label="Wishlist"
            >
              <Heart
                className={`h-4 w-4 ${wishlistCount > 0 ? 'fill-rose-500 text-rose-400' : ''}`}
              />
              {wishlistCount > 0 && (
                <span className="h-4.5 w-4.5 absolute -right-1 -top-1 flex items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-md shadow-rose-500/40">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Cart Bag Drawer Trigger */}
            <button
              onClick={openCart}
              className="group flex h-10 items-center gap-2.5 rounded-xl border border-indigo-500/40 bg-gradient-to-r from-indigo-600/20 to-violet-600/20 px-3.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/15 transition-all hover:border-indigo-400 hover:from-indigo-600/30 hover:to-violet-600/30 active:scale-95"
              aria-label="Open Cart Bag"
            >
              <div className="relative">
                <ShoppingBag className="h-4 w-4 text-indigo-300 transition-transform group-hover:scale-110" />
                {itemCount > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-4 w-4 animate-bounce items-center justify-center rounded-full bg-indigo-500 text-[10px] font-bold text-white shadow-sm shadow-indigo-500/50">
                    {itemCount}
                  </span>
                )}
              </div>
              <span className="hidden font-semibold sm:inline">Bag</span>
              <span className="font-mono text-xs font-bold text-indigo-300">
                ${subtotal > 0 ? subtotal.toFixed(0) : '0'}
              </span>
            </button>

            {/* Theme Switcher Toggle */}
            <ThemeToggle />

            {/* User Account / Auth CTAs */}
            {user ? (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Link
                  href="/settings"
                  title="Account Settings"
                  className="flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 text-xs font-semibold text-slate-200 transition-all hover:border-white/20 hover:text-white"
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
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.02] text-slate-400 transition-all hover:border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-400"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <div className="hidden items-center gap-2 sm:flex">
                <Link
                  href="/login"
                  className="rounded-xl px-3 py-2 text-xs font-semibold text-slate-300 transition-colors hover:text-white"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="rounded-xl border border-indigo-400/40 bg-indigo-600 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-indigo-600/30 transition-all hover:bg-indigo-500 hover:shadow-indigo-500/40 active:scale-95"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Menu Hamburger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Close navigation' : 'Open navigation'}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-slate-300 transition-colors hover:text-white md:hidden"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="animate-in slide-in-from-top-2 border-b border-white/10 bg-[#0b0f19] px-4 py-5 shadow-2xl duration-200 md:hidden">
            {/* Search Input for Mobile */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search heavyweight hoodies & jackets..."
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleSearchClick();
                }}
                readOnly
                className="w-full cursor-pointer rounded-xl border border-white/10 bg-white/[0.04] py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500"
              />
            </div>

            <nav className="flex flex-col gap-1.5">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-bold text-slate-300 transition-colors hover:bg-white/[0.06] hover:text-white"
                >
                  <span>{link.label}</span>
                  {link.tag && (
                    <span className="rounded bg-indigo-500/20 px-2 py-0.5 font-mono text-[10px] font-bold text-indigo-300">
                      {link.tag}
                    </span>
                  )}
                </Link>
              ))}

              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between rounded-xl border border-indigo-500/20 bg-indigo-500/10 px-3 py-2.5 text-sm font-bold text-indigo-300 transition-colors hover:bg-indigo-500/20"
              >
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-indigo-400" />
                  <span>Admin Management Console</span>
                </div>
                <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                  ● Nominal
                </span>
              </Link>

              {/* Guest Login/Register for Mobile */}
              {!user && (
                <div className="mt-3 grid grid-cols-2 gap-2 border-t border-white/10 pt-3">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-xl border border-white/10 py-2.5 text-center text-xs font-bold text-white hover:bg-white/[0.05]"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-xl bg-indigo-600 py-2.5 text-center text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-indigo-600/30 hover:bg-indigo-500"
                  >
                    Register
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </header>
    </>
  );
}

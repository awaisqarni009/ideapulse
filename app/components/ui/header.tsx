'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useUser } from '@/lib/auth/use-user';
import { useCart } from '@/lib/store/cart-context';
import { useWishlist } from '@/lib/store/wishlist-context';
import { useCurrency } from '@/lib/store/currency-context';
import { useToast } from '@/app/components/ui/toast';
import { ThemeToggle } from '@/app/components/ui/theme-toggle';
import { FontControls } from '@/app/components/ui/font-controls';
import { EnergyBadge } from '@/app/components/energy/energy-badge';
import { PulseWearLogo } from '@/app/components/ui/logo';
import { PRODUCTS, getStoredCategories, ProductCategory } from '@/lib/store/products';
import { createClient } from '@/lib/supabase/client';
import {
  ShoppingBag,
  Heart,
  Search,
  Menu,
  X,
  User,
  LogOut,
  Shield,
  ChevronDown,
} from 'lucide-react';
import { signOutAction } from '@/app/actions/auth';

export function Header() {
  const pathname = usePathname();
  const { user, profile } = useUser();
  const { itemCount, openCart } = useCart();
  const { wishlistCount } = useWishlist();
  const { formatPrice } = useCurrency();
  const { info } = useToast();

  // Header scroll state
  const [isScrolledPast80, setIsScrolledPast80] = useState(false);
  const [isHiddenOnScrollDown, setIsHiddenOnScrollDown] = useState(false);
  const lastScrollY = useRef(0);

  // Navigation & Dropdown states
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');
  const [categoriesList, setCategoriesList] = useState<ProductCategory[]>([]);
  const categoryMenuRef = useRef<HTMLDivElement>(null);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);

  // Load and listen to categories
  useEffect(() => {
    setCategoriesList(getStoredCategories());
    const handleCategoriesUpdate = () => {
      setCategoriesList(getStoredCategories());
    };
    window.addEventListener('pulsewear-categories-updated', handleCategoriesUpdate);
    return () => window.removeEventListener('pulsewear-categories-updated', handleCategoriesUpdate);
  }, []);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(e.target as Node)) {
        setAccountMenuOpen(false);
      }
      if (categoryMenuRef.current && !categoryMenuRef.current.contains(e.target as Node)) {
        setCategoryMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Header scroll hide/reveal behavior
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // 80px background switch
      setIsScrolledPast80(currentScrollY > 80);

      // Hide on scroll down, show on scroll up
      if (currentScrollY > 200 && currentScrollY > lastScrollY.current + 10) {
        setIsHiddenOnScrollDown(true);
      } else if (currentScrollY < lastScrollY.current - 5) {
        setIsHiddenOnScrollDown(false);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleWishlistClick = () => {
    if (wishlistCount === 0) {
      info('Your wishlist is empty. Tap the heart on any piece to save it.', 'Wishlist');
    } else {
      info(`You have ${wishlistCount} piece(s) saved in your collection.`, 'Pulse Wishlist');
      const catalogEl = document.getElementById('catalog');
      if (catalogEl) catalogEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Robust Sign Out Handler (Client + Server + SessionStorage cleanup)
  const handleSignOut = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Client signout error:', err);
    }

    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('pulsewear_admin_session');
      sessionStorage.removeItem('pulsewear_admin_user');
    }

    try {
      await signOutAction();
    } catch (err: any) {
      if (err?.digest?.startsWith('NEXT_REDIRECT')) {
        window.location.href = '/login';
        return;
      }
    }

    window.location.href = '/login';
  };

  const isAdmin = profile?.role === 'admin';

  // Live filtered products & categories inside the category search
  const filteredProducts = categorySearch.trim()
    ? PRODUCTS.filter(
        (p) =>
          p.title.toLowerCase().includes(categorySearch.toLowerCase()) ||
          p.category.toLowerCase().includes(categorySearch.toLowerCase()) ||
          p.subtitle.toLowerCase().includes(categorySearch.toLowerCase()),
      ).slice(0, 4)
    : [];

  const filteredCategories = categorySearch.trim()
    ? categoriesList.filter((cat) => cat.label.toLowerCase().includes(categorySearch.toLowerCase()))
    : categoriesList;

  return (
    <>
      {/* Main Header Bar (No top free shipping bar per user request) */}
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          isHiddenOnScrollDown ? '-translate-y-full' : 'translate-y-0'
        } ${
          isScrolledPast80
            ? 'border-b border-white/[0.08] bg-[#15181B]/95 shadow-2xl backdrop-blur-md'
            : 'border-b border-transparent bg-transparent'
        }`}
        style={{
          boxShadow: isScrolledPast80 ? 'inset 0 1px 0 rgba(255, 255, 255, 0.05)' : 'none',
        }}
      >
        <div className="container mx-auto flex h-[68px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Left: Brand Monogram & Navigation Buttons */}
          <div className="flex items-center gap-6 lg:gap-10">
            <PulseWearLogo size="md" showTagline={false} />

            {/* Desktop Navigation Buttons: HOME, CATEGORY, ABOUT US, REVIEWS */}
            <nav className="hidden items-center gap-1 md:flex">
              {/* HOME BUTTON */}
              <Link
                href="/"
                className={`rounded-lg px-3.5 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
                  pathname === '/'
                    ? 'bg-white/[0.06] text-[#FF5A1F]'
                    : 'text-[#DEDBD2] hover:bg-white/[0.04] hover:text-white'
                }`}
              >
                Home
              </Link>

              {/* CATEGORY BUTTON (With Dropdown & Embedded Search) */}
              <div className="relative" ref={categoryMenuRef}>
                <button
                  type="button"
                  onClick={() => setCategoryMenuOpen(!categoryMenuOpen)}
                  className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
                    categoryMenuOpen
                      ? 'bg-white/[0.08] text-[#FF5A1F]'
                      : 'text-[#DEDBD2] hover:bg-white/[0.04] hover:text-white'
                  }`}
                  aria-expanded={categoryMenuOpen}
                  aria-haspopup="true"
                >
                  <span>Category</span>
                  <ChevronDown
                    className={`h-3.5 w-3.5 transition-transform duration-200 ${
                      categoryMenuOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* CATEGORY DROPDOWN MENU */}
                {categoryMenuOpen && (
                  <div className="animate-in fade-in slide-in-from-top-2 absolute left-0 top-full z-50 mt-2 w-80 rounded-2xl border border-white/15 bg-[#121620]/95 p-4 shadow-2xl backdrop-blur-xl duration-200">
                    {/* Embedded Search Input */}
                    <div className="relative mb-3">
                      <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search categories & products..."
                        value={categorySearch}
                        onChange={(e) => setCategorySearch(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-[#0a0d14] py-2 pl-9 pr-3 text-xs text-white placeholder-slate-400 shadow-inner focus:border-indigo-500 focus:outline-none"
                        autoFocus
                      />
                    </div>

                    {/* Live Matching Products (if user typed search query) */}
                    {categorySearch.trim() && (
                      <div className="mb-3 max-h-48 overflow-y-auto border-b border-white/10 pb-3">
                        <span className="mb-1.5 block font-sans text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Matching Products
                        </span>
                        {filteredProducts.length > 0 ? (
                          <div className="space-y-1">
                            {filteredProducts.map((p) => (
                              <Link
                                key={p.id}
                                href={`/?category=${p.category}#catalog`}
                                onClick={() => {
                                  setCategoryMenuOpen(false);
                                  setCategorySearch('');
                                }}
                                className="flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs text-slate-200 transition-colors hover:bg-white/10 hover:text-white"
                              >
                                <div className="flex items-center gap-2 truncate">
                                  <Image
                                    src={p.image}
                                    alt={p.title}
                                    width={24}
                                    height={24}
                                    sizes="24px"
                                    className="h-6 w-6 rounded object-cover"
                                  />
                                  <span className="truncate">{p.title}</span>
                                </div>
                                <span className="font-mono text-[11px] font-bold text-cyan-400">
                                  {formatPrice(p.price)}
                                </span>
                              </Link>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[11px] italic text-slate-400">
                            No products matching &quot;{categorySearch}&quot;
                          </p>
                        )}
                      </div>
                    )}

                    {/* Categories List */}
                    <div>
                      <div className="flex items-center justify-between border-b border-white/10 pb-1.5 font-sans text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        <span>Collections</span>
                        <Link
                          href="/#catalog"
                          onClick={() => setCategoryMenuOpen(false)}
                          className="text-[#FF5A1F] hover:underline"
                        >
                          All Products →
                        </Link>
                      </div>

                      <div className="mt-2 space-y-1">
                        <Link
                          href="/#catalog"
                          onClick={() => setCategoryMenuOpen(false)}
                          className="flex items-center justify-between rounded-lg px-2.5 py-2 text-xs font-semibold text-slate-200 transition-colors hover:bg-white/10 hover:text-white"
                        >
                          <span>All Categories</span>
                          <span className="font-mono text-[10px] text-slate-400">
                            {PRODUCTS.length}
                          </span>
                        </Link>

                        {filteredCategories.map((cat) => (
                          <Link
                            key={cat.id}
                            href={`/?category=${cat.id}#catalog`}
                            onClick={() => setCategoryMenuOpen(false)}
                            className="flex items-center justify-between rounded-lg px-2.5 py-2 text-xs font-semibold text-slate-200 transition-colors hover:bg-white/10 hover:text-white"
                          >
                            <span>{cat.label}</span>
                            {cat.badge && (
                              <span className="rounded bg-indigo-500/20 px-2 py-0.5 text-[9px] font-bold uppercase text-indigo-300">
                                {cat.badge}
                              </span>
                            )}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ABOUT US BUTTON */}
              <Link
                href="/about"
                className={`rounded-lg px-3.5 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
                  pathname === '/about'
                    ? 'bg-white/[0.06] text-[#FF5A1F]'
                    : 'text-[#DEDBD2] hover:bg-white/[0.04] hover:text-white'
                }`}
              >
                About Us
              </Link>

              {/* REVIEWS BUTTON */}
              <Link
                href="/#reviews"
                className="rounded-lg px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-[#DEDBD2] transition-colors hover:bg-white/[0.04] hover:text-white"
              >
                Reviews
              </Link>
            </nav>
          </div>

          {/* Right Section: Wishlist, Zoom, Dark/Light Mode, Auth, and Bag (Bag at far right!) */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Wishlist Pill */}
            <button
              onClick={handleWishlistClick}
              className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-[#DEDBD2] transition-all hover:border-white/30 hover:text-white active:scale-95"
              aria-label="Wishlist"
              title="Saved items"
            >
              <Heart
                className={`h-4 w-4 ${wishlistCount > 0 ? 'fill-[#FF5A1F] text-[#FF5A1F]' : ''}`}
              />
              {wishlistCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#FF5A1F] text-[9px] font-bold tabular-nums text-white">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Small Zoom Button (Pops open small section when clicked) */}
            <FontControls />

            {/* Small Light/Dark Mode Button (No switch, direct toggle on click) */}
            <ThemeToggle />

            {/* Energy Badge Container (Preserved for system invariants) */}
            <EnergyBadge />

            {/* User Account / Auth Controls */}
            {user ? (
              <div className="relative" ref={accountMenuRef}>
                <button
                  onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                  className="flex h-9 items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 text-xs font-semibold text-[#DEDBD2] transition-all hover:border-white/30 hover:text-white"
                  aria-label="User Account"
                >
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#FF5A1F] text-[10px] font-bold text-white">
                    {(
                      profile?.display_name?.charAt(0) ||
                      profile?.username?.charAt(0) ||
                      user.email?.charAt(0) ||
                      'U'
                    ).toUpperCase()}
                  </div>
                  <span className="hidden max-w-[80px] truncate text-[11px] font-medium sm:inline">
                    {profile?.username || profile?.display_name || 'Member'}
                  </span>
                  <ChevronDown className="h-3 w-3 text-[#8A8F95]" />
                </button>

                {accountMenuOpen && (
                  <div className="animate-in fade-in slide-in-from-top-2 absolute right-0 top-full z-50 mt-2 w-48 rounded-xl border border-white/10 bg-[#1F2327] p-2 shadow-2xl backdrop-blur-md">
                    <div className="border-b border-white/10 px-2 pb-2">
                      <p className="truncate text-xs font-bold text-white">
                        {profile?.display_name || 'Pulse Member'}
                      </p>
                      <p className="truncate font-mono text-[10px] text-[#8A8F95]">{user.email}</p>
                    </div>

                    {isAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setAccountMenuOpen(false)}
                        className="mt-1 flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-[#FF5A1F] hover:bg-white/5"
                      >
                        <Shield className="h-3.5 w-3.5" />
                        <span>Admin Console</span>
                      </Link>
                    )}

                    <div className="mt-1">
                      <button
                        type="button"
                        onClick={handleSignOut}
                        className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs text-[#8A8F95] transition-colors hover:bg-white/5 hover:text-white"
                      >
                        <LogOut className="h-3.5 w-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="flex h-9 items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 text-xs font-semibold text-[#DEDBD2] transition-all hover:border-white/30 hover:text-white"
                aria-label="Sign In"
              >
                <User className="h-3.5 w-3.5 text-[#8A8F95]" />
                <span className="hidden sm:inline">Sign In</span>
              </Link>
            )}

            {/* Shopping Bag Button — Kept at the right side! */}
            <button
              onClick={openCart}
              className="group flex h-9 items-center gap-2 rounded-lg border border-white/10 bg-[#1F2327] px-3.5 text-xs font-semibold text-[#F2F5F7] shadow-sm transition-all hover:border-white/30 active:scale-95"
              aria-label="Open Cart Bag"
            >
              <ShoppingBag className="h-4 w-4 text-[#DEDBD2] transition-colors group-hover:text-white" />
              <span>Bag</span>
              <span className="font-mono text-xs font-bold tabular-nums text-white">
                {itemCount}
              </span>
            </button>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-white md:hidden"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="animate-in fade-in border-b border-white/10 bg-[#15181B] px-6 py-6 duration-200 md:hidden">
            <nav className="flex flex-col space-y-3">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-bold uppercase tracking-wider text-[#FF5A1F] hover:bg-white/5"
              >
                Home
              </Link>

              {/* Mobile Search Input */}
              <div className="relative py-1">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search categories & products..."
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#0e121a] py-2 pl-9 pr-3 text-xs text-white placeholder-slate-400"
                />
              </div>

              {/* Mobile Categories Accordion */}
              <div className="rounded-xl border border-white/10 bg-[#0e121a] p-3">
                <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Categories
                </span>
                <div className="mt-2 space-y-1.5">
                  <Link
                    href="/#catalog"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-xs font-semibold text-slate-200"
                  >
                    All Collections ({PRODUCTS.length})
                  </Link>
                  {filteredCategories.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/?category=${cat.id}#catalog`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-between text-xs text-slate-300"
                    >
                      <span>{cat.label}</span>
                      {cat.badge && (
                        <span className="rounded bg-indigo-500/20 px-1.5 py-0.5 text-[9px] font-bold text-indigo-300">
                          {cat.badge}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              </div>

              <Link
                href="/about"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-bold uppercase tracking-wider text-[#DEDBD2] hover:bg-white/5 hover:text-white"
              >
                About Us
              </Link>

              <Link
                href="/#reviews"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-bold uppercase tracking-wider text-[#DEDBD2] hover:bg-white/5 hover:text-white"
              >
                Reviews
              </Link>
            </nav>

            {/* Mobile Auth Links */}
            <div className="mt-6 border-t border-white/10 pt-4">
              {user ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs text-[#8A8F95]">
                    <User className="h-3.5 w-3.5 text-[#FF5A1F]" />
                    <span>
                      Signed in as{' '}
                      <strong className="text-white">{profile?.username || user.email}</strong>
                    </span>
                  </div>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#FF5A1F]"
                    >
                      <Shield className="h-3.5 w-3.5" />
                      <span>Admin Console</span>
                    </Link>
                  )}
                  <div>
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="flex items-center gap-2 text-xs text-[#8A8F95] hover:text-white"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 text-sm font-semibold text-white"
                >
                  <User className="h-4 w-4 text-[#FF5A1F]" />
                  <span>Sign In / Join Drop Access</span>
                </Link>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
}

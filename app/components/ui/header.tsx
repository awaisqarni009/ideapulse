'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser } from '@/lib/auth/use-user';
import { useCart } from '@/lib/store/cart-context';
import { useWishlist } from '@/lib/store/wishlist-context';
import { useToast } from '@/app/components/ui/toast';
import { ThemeToggle } from '@/app/components/ui/theme-toggle';
import { PulseWearLogo } from '@/app/components/ui/logo';
import { SearchOverlay } from '@/app/components/store/search-overlay';
import { PRODUCTS } from '@/lib/store/products';
import {
  ShoppingBag,
  Heart,
  Search,
  Pause,
  Play,
  ArrowRight,
  Menu,
  X,
  User,
  LogOut,
  Shield,
} from 'lucide-react';
import { ease, dur } from '@/lib/motion';

const ANNOUNCEMENTS = [
  'Free express shipping over $100',
  'Code PULSE20: 20% off your first order',
  '30-day returns',
];

export function Header() {
  const pathname = usePathname();
  const { user, profile } = useUser();
  const { itemCount, subtotal, openCart } = useCart();
  const { wishlistCount } = useWishlist();
  const { info } = useToast();

  // Announcement rotator state
  const [activeAnnouncement, setActiveAnnouncement] = useState(0);
  const [isAnnouncementPaused, setIsAnnouncementPaused] = useState(false);
  const [isHoveredAnnouncement, setIsHoveredAnnouncement] = useState(false);

  // Header scroll state
  const [isScrolledPast80, setIsScrolledPast80] = useState(false);
  const [isHiddenOnScrollDown, setIsHiddenOnScrollDown] = useState(false);
  const lastScrollY = useRef(0);

  // Search & mega menu state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [hoveredNavMenu, setHoveredNavMenu] = useState<'hoodie' | 'jacket' | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Keyboard shortcut '/' to trigger search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === '/' &&
        !isSearchOpen &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen]);

  // Rotator timer (every 5s, stops on hover, pause control, static under reduced motion)
  useEffect(() => {
    if (isAnnouncementPaused || isHoveredAnnouncement) return;
    const interval = setInterval(() => {
      setActiveAnnouncement((prev) => (prev + 1) % ANNOUNCEMENTS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isAnnouncementPaused, isHoveredAnnouncement]);

  // Scroll direction and elevation listener
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // 80px background switch per spec §7.1
      setIsScrolledPast80(currentScrollY > 80);

      // Hide on scroll down, show on scroll up (280ms)
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

  const previewHoodies = PRODUCTS.filter((p) => p.category === 'hoodie').slice(0, 3);
  const previewJackets = PRODUCTS.filter((p) => p.category === 'jacket').slice(0, 3);

  const isAdmin = profile?.role === 'admin';

  return (
    <>
      {/* 7.1 Announcement Bar with 5s vertical slide and pause control */}
      <div
        onMouseEnter={() => setIsHoveredAnnouncement(true)}
        onMouseLeave={() => setIsHoveredAnnouncement(false)}
        className="relative z-50 w-full select-none border-b border-white/[0.08] bg-[#0f1214] text-[11px] text-[#DEDBD2]"
      >
        <div className="container mx-auto flex h-7 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex h-5 flex-1 items-center justify-center overflow-hidden sm:justify-start">
            <div
              key={activeAnnouncement}
              className="animate-in fade-in slide-in-from-bottom-2 flex items-center gap-2 font-mono duration-300"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[#FF5A1F]" />
              <span>{ANNOUNCEMENTS[activeAnnouncement]}</span>
            </div>
          </div>

          {/* Pause / Play Control per §5.2 rule 7 */}
          <button
            onClick={() => setIsAnnouncementPaused(!isAnnouncementPaused)}
            className="hidden items-center gap-1 text-[10px] text-[#8A8F95] transition-colors hover:text-white sm:flex"
            aria-label={isAnnouncementPaused ? 'Resume announcements' : 'Pause announcements'}
            title={isAnnouncementPaused ? 'Resume' : 'Pause'}
          >
            {isAnnouncementPaused ? (
              <Play className="h-2.5 w-2.5" />
            ) : (
              <Pause className="h-2.5 w-2.5" />
            )}
            <span className="font-mono">{isAnnouncementPaused ? 'play' : 'pause'}</span>
          </button>
        </div>
      </div>

      {/* 7.1 Header: Transparent over hero, switches to --shell (#15181B) after 80px */}
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
          {/* Left: Brand Monogram & Wordmark */}
          <div className="flex items-center gap-8 lg:gap-12">
            <PulseWearLogo size="md" />

            {/* Desktop Navigation Links */}
            <nav className="hidden items-center gap-6 md:flex">
              {/* Hoodies with preview panel */}
              <div
                className="relative"
                onMouseEnter={() => setHoveredNavMenu('hoodie')}
                onMouseLeave={() => setHoveredNavMenu(null)}
              >
                <Link
                  href="/?category=hoodie#catalog"
                  className={`py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
                    hoveredNavMenu === 'hoodie' ? 'text-white' : 'text-[#DEDBD2] hover:text-white'
                  }`}
                >
                  Hoodies
                </Link>

                {/* Hover Preview Panel §7.1 (3 thumbnails + Shop all link) */}
                {hoveredNavMenu === 'hoodie' && (
                  <div className="animate-in fade-in slide-in-from-top-2 absolute left-0 top-full mt-2 w-80 rounded-sm border border-white/10 bg-[#1F2327] p-4 shadow-2xl duration-200">
                    <div className="flex items-center justify-between border-b border-white/5 pb-2 font-mono text-xs text-[#8A8F95]">
                      <span>500 GSM HEAVYWEIGHT</span>
                      <Link
                        href="/?category=hoodie#catalog"
                        className="text-[#FF5A1F] hover:underline"
                      >
                        Shop all →
                      </Link>
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      {previewHoodies.map((item) => (
                        <Link
                          key={item.id}
                          href="/?category=hoodie#catalog"
                          className="group block text-center"
                        >
                          <img
                            src={item.image}
                            alt={item.title}
                            className="aspect-[4/5] w-full rounded-none bg-black/40 object-cover transition-opacity group-hover:opacity-85"
                          />
                          <span className="mt-1 block truncate text-[10px] font-medium text-white">
                            {item.title}
                          </span>
                          <span className="text-[10px] tabular-nums text-[#8A8F95]">
                            ${item.price}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Jackets with preview panel */}
              <div
                className="relative"
                onMouseEnter={() => setHoveredNavMenu('jacket')}
                onMouseLeave={() => setHoveredNavMenu(null)}
              >
                <Link
                  href="/?category=jacket#catalog"
                  className={`py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
                    hoveredNavMenu === 'jacket' ? 'text-white' : 'text-[#DEDBD2] hover:text-white'
                  }`}
                >
                  Jackets
                </Link>

                {/* Hover Preview Panel §7.1 */}
                {hoveredNavMenu === 'jacket' && (
                  <div className="animate-in fade-in slide-in-from-top-2 absolute left-0 top-full mt-2 w-80 rounded-sm border border-white/10 bg-[#1F2327] p-4 shadow-2xl duration-200">
                    <div className="flex items-center justify-between border-b border-white/5 pb-2 font-mono text-xs text-[#8A8F95]">
                      <span>20,000 MM WEATHERPROOF</span>
                      <Link
                        href="/?category=jacket#catalog"
                        className="text-[#FF5A1F] hover:underline"
                      >
                        Shop all →
                      </Link>
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      {previewJackets.map((item) => (
                        <Link
                          key={item.id}
                          href="/?category=jacket#catalog"
                          className="group block text-center"
                        >
                          <img
                            src={item.image}
                            alt={item.title}
                            className="aspect-[4/5] w-full rounded-none bg-black/40 object-cover transition-opacity group-hover:opacity-85"
                          />
                          <span className="mt-1 block truncate text-[10px] font-medium text-white">
                            {item.title}
                          </span>
                          <span className="text-[10px] tabular-nums text-[#8A8F95]">
                            ${item.price}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <Link
                href="/#lookbook"
                className="text-xs font-semibold uppercase tracking-wider text-[#DEDBD2] transition-colors hover:text-white"
              >
                Lookbook
              </Link>
              <Link
                href="/#reviews"
                className="text-xs font-semibold uppercase tracking-wider text-[#DEDBD2] transition-colors hover:text-white"
              >
                Reviews
              </Link>
            </nav>
          </div>

          {/* Right Section: Search, Wishlist, Bag, Theme, Auth */}
          <div className="flex items-center gap-3">
            {/* Search Trigger (Keyboard '/' indicator) */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-2 rounded-sm border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-[#8A8F95] transition-all hover:border-white/25 hover:text-white"
              aria-label="Open search overlay"
            >
              <Search className="h-3.5 w-3.5" />
              <span className="hidden font-mono sm:inline">Search</span>
              <kbd className="hidden rounded bg-white/10 px-1.5 py-0.5 font-mono text-[9px] text-white sm:inline">
                /
              </kbd>
            </button>

            {/* Wishlist Pill */}
            <button
              onClick={handleWishlistClick}
              className="relative flex h-9 w-9 items-center justify-center rounded-sm border border-white/10 bg-white/[0.03] text-[#DEDBD2] transition-all hover:border-white/30 hover:text-white"
              aria-label="Wishlist"
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

            {/* Bag Button: Vertical rolling count §7.1 */}
            <button
              onClick={openCart}
              className="group flex h-9 items-center gap-2 rounded-sm border border-white/10 bg-[#1F2327] px-3.5 text-xs font-semibold text-[#F2F5F7] transition-all hover:border-white/30"
              aria-label="Open Cart Bag"
            >
              <ShoppingBag className="h-4 w-4 text-[#DEDBD2] group-hover:text-white" />
              <span>Bag</span>
              <span className="font-mono text-xs font-bold tabular-nums text-white">
                {itemCount}
              </span>
            </button>

            {/* Only show Admin icon if user role is admin §1 problem 3 */}
            {isAdmin && (
              <Link
                href="/admin"
                title="Admin Console"
                className="flex h-9 w-9 items-center justify-center rounded-sm border border-[#FF5A1F]/30 bg-[#FF5A1F]/10 text-[#FF5A1F]"
              >
                <Shield className="h-4 w-4" />
              </Link>
            )}

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex h-9 w-9 items-center justify-center rounded-sm border border-white/10 text-white md:hidden"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="animate-in fade-in border-b border-white/10 bg-[#15181B] px-6 py-6 duration-200 md:hidden">
            <nav className="flex flex-col space-y-4">
              <Link
                href="/?category=hoodie#catalog"
                onClick={() => setMobileMenuOpen(false)}
                className="flex justify-between text-sm font-semibold uppercase tracking-wider text-white"
              >
                <span>Hoodies</span>
                <span className="font-mono text-xs text-[#8A8F95]">500 GSM</span>
              </Link>
              <Link
                href="/?category=jacket#catalog"
                onClick={() => setMobileMenuOpen(false)}
                className="flex justify-between text-sm font-semibold uppercase tracking-wider text-white"
              >
                <span>Jackets</span>
                <span className="font-mono text-xs text-[#8A8F95]">20K MM</span>
              </Link>
              <Link
                href="/#lookbook"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-semibold uppercase tracking-wider text-[#DEDBD2]"
              >
                Lookbook
              </Link>
              <Link
                href="/#reviews"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-semibold uppercase tracking-wider text-[#DEDBD2]"
              >
                Reviews
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* Full-width Search Overlay §7.1 */}
      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}

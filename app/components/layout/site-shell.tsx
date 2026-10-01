'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Header } from '@/app/components/ui/header';
import { Footer } from '@/app/components/ui/footer';
import { CartProvider } from '@/lib/store/cart-context';
import { WishlistProvider } from '@/lib/store/wishlist-context';
import { CartDrawer } from '@/app/components/store/cart-drawer';

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  // Completely separate admin panel environment
  if (isAdmin) {
    return <div className="min-h-screen w-full bg-[var(--canvas)]">{children}</div>;
  }

  return (
    <CartProvider>
      <WishlistProvider>
        {/* Skip to main content */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[9999] focus:rounded-lg focus:border focus:border-indigo-400 focus:bg-slate-900 focus:px-4 focus:py-2.5 focus:text-sm focus:font-medium focus:text-white focus:outline-none"
        >
          Skip to content
        </a>
        <Header />
        <CartDrawer />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <Footer />
      </WishlistProvider>
    </CartProvider>
  );
}

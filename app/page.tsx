'use client';

import React, { useState, useEffect } from 'react';
import Flashlight from '@/app/components/motion/flashlight';
import ShellStory from '@/app/components/motion/shell-story';
import { Catalog } from '@/app/components/store/catalog';
import { ReviewsSection } from '@/app/components/store/reviews-section';
import { NewsletterSection } from '@/app/components/store/newsletter-section';
import { QuickViewModal } from '@/app/components/store/quick-view-modal';
import { Product } from '@/lib/store/products';
import { ArrowRight } from 'lucide-react';

export default function StoreHomePage() {
  const [activeQuickViewProduct, setActiveQuickViewProduct] = useState<Product | null>(null);

  // Check if session has already played the page-load sequence (§6.3)
  useEffect(() => {
    try {
      if (!sessionStorage.getItem('pulsewear_has_loaded_v1')) {
        sessionStorage.setItem('pulsewear_has_loaded_v1', 'true');
      }
    } catch {
      // ignore
    }
  }, []);

  const scrollToCategory = (category: string) => {
    const catalogEl = document.getElementById('catalog');
    if (catalogEl) {
      window.history.pushState(null, '', `/?category=${category}#catalog`);
      window.dispatchEvent(new Event('popstate'));
      catalogEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#15181B] text-[#F2F5F7]">
      {/* 7.2 Hero Section with Flashlight Signature Interaction (§6.1) */}
      <section className="relative h-[88vh] min-h-[600px] w-full overflow-hidden border-b border-white/5 bg-[#15181B]">
        {/* Flashlight interactive beam background */}
        <div className="absolute inset-0 z-0">
          <Flashlight
            src="/images/hero-banner.jpg"
            alt="PULSEWEAR 500 GSM Heavyweight Outerwear"
            className="h-full w-full object-cover"
          />
          {/* Subtle bottom gradient to merge into catalog */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-[#15181B] to-transparent" />
        </div>

        {/* Hero Content: Left-aligned headline, bottom-right CTAs (§7.1 ASCII & §7.2) */}
        <div className="container relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-end px-4 pb-12 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            {/* Headline and Single Supporting Sentence (§7.2) */}
            <div className="max-w-2xl">
              <h1 className="font-display text-4xl font-extrabold uppercase leading-[0.94] tracking-tight text-white sm:text-6xl lg:text-7xl">
                ENGINEERED <br />
                FOR WARMTH. <br />
                CUT FOR STREETS.
              </h1>
              <p className="mt-4 max-w-lg text-sm font-normal leading-relaxed text-[#DEDBD2] sm:text-base">
                Dense 500 GSM loopback hoodies and 20,000 mm waterproof shells, built to outlast the
                season.
              </p>
            </div>

            {/* CTAs: Primary 'Shop hoodies' (orange); Secondary 'Shop jackets' (text link with underline) (§7.2) */}
            <div className="flex items-center gap-6 pb-2 sm:gap-8">
              <button
                onClick={() => scrollToCategory('hoodie')}
                className="flex items-center gap-2 rounded-sm bg-[#FF5A1F] px-7 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-[#FF5A1F]/20 transition-all hover:brightness-110 active:scale-[0.98]"
              >
                <span>Shop hoodies</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                onClick={() => scrollToCategory('jacket')}
                className="group relative py-2 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:text-[#DEDBD2]"
              >
                <span>Shop jackets</span>
                <span className="absolute inset-x-0 bottom-1 h-0.5 origin-left scale-x-0 bg-white transition-transform duration-200 group-hover:scale-x-100" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 7.3 Catalog with Filter Bar & Product Cards */}
      <Catalog onQuickView={(p) => setActiveQuickViewProduct(p)} />

      {/* 6.2 & 7.5 Material Lab: Three-Layer Shell Scroll Set-Piece */}
      <ShellStory />

      {/* 7.6 Reviews Section in --bone Rhythm */}
      <ReviewsSection />

      {/* 7.7 Newsletter VIP Drop Access */}
      <NewsletterSection />

      {/* Quick View Spec Modal */}
      <QuickViewModal
        product={activeQuickViewProduct}
        onClose={() => setActiveQuickViewProduct(null)}
      />
    </div>
  );
}

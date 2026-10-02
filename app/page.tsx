'use client';

import React, { useState, useEffect } from 'react';
import { Hero3D } from '@/app/components/home/hero-3d';
import ShellStory from '@/app/components/motion/shell-story';
import { Catalog } from '@/app/components/store/catalog';
import { ReviewsSection } from '@/app/components/store/reviews-section';
import { NewsletterSection } from '@/app/components/store/newsletter-section';
import { QuickViewModal } from '@/app/components/store/quick-view-modal';
import { Product } from '@/lib/store/products';

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
      if (category === 'all') {
        window.history.pushState(null, '', `/#catalog`);
      } else {
        window.history.pushState(null, '', `/?category=${category}#catalog`);
      }
      window.dispatchEvent(new Event('popstate'));
      catalogEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#15181B] text-[#F2F5F7]">
      {/* 3D Streetwear Hero with Layered Typography & Tiered Quick-Nav */}
      <Hero3D onSelectCategory={(cat) => scrollToCategory(cat)} />

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

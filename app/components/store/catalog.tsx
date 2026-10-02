'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'motion/react';
import { PRODUCTS, CATEGORIES, Product } from '@/lib/store/products';
import { ProductCard } from '@/app/components/store/product-card';
import { springHeavy, ease } from '@/lib/motion';

interface CatalogProps {
  onQuickView: (product: Product) => void;
}

export function Catalog({ onQuickView }: CatalogProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [priceFilter, setPriceFilter] = useState<'all' | 'under100' | '100to160' | 'over160'>(
    'all',
  );
  const [sortBy, setSortBy] = useState<'featured' | 'priceAsc' | 'priceDesc' | 'rating'>(
    'featured',
  );

  // Sync category from URL query parameters (e.g. from header nav links)
  useEffect(() => {
    const handleUrlSync = () => {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const cat = params.get('category');
        if (cat && ['hoodie', 'jacket', 'bestseller', 'new', 'all'].includes(cat)) {
          setSelectedCategory(cat);
        }
      }
    };
    handleUrlSync();
    window.addEventListener('popstate', handleUrlSync);
    window.addEventListener('hashchange', handleUrlSync);
    return () => {
      window.removeEventListener('popstate', handleUrlSync);
      window.removeEventListener('hashchange', handleUrlSync);
    };
  }, []);

  const filtered = useMemo(() => {
    return PRODUCTS.filter((item) => {
      if (selectedCategory === 'hoodie' && item.category !== 'hoodie') return false;
      if (selectedCategory === 'jacket' && item.category !== 'jacket') return false;
      if (selectedCategory === 'bestseller' && item.badge !== 'Bestseller') return false;
      if (selectedCategory === 'new' && item.badge !== 'New drop') return false;

      if (priceFilter === 'under100' && item.price >= 100) return false;
      if (priceFilter === '100to160' && (item.price < 100 || item.price > 160)) return false;
      if (priceFilter === 'over160' && item.price <= 160) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'priceAsc') return a.price - b.price;
      if (sortBy === 'priceDesc') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
    });
  }, [selectedCategory, priceFilter, sortBy]);

  return (
    <section id="catalog" className="w-full bg-[#15181B] px-4 py-16 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-7xl">
        {/* Sticky Filter Bar under header with gliding layoutId underline §7.3 & §8.6 */}
        <LayoutGroup>
          <div className="sticky top-[68px] z-30 flex flex-col gap-4 border-b border-white/10 bg-[#15181B]/95 py-4 backdrop-blur-md md:flex-row md:items-center md:justify-between">
            {/* Category Chips with Gliding Underline */}
            <nav
              className="flex items-center gap-1 overflow-x-auto pb-1 sm:gap-2 sm:pb-0"
              aria-label="Category filter"
            >
              {CATEGORIES.map((c) => {
                const isActive = selectedCategory === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCategory(c.id)}
                    className={`relative rounded-none px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
                      isActive ? 'text-white' : 'text-[#8A8F95] hover:text-white'
                    }`}
                  >
                    <span>{c.label}</span>
                    {isActive && (
                      <motion.span
                        layoutId="chip-underline"
                        transition={springHeavy}
                        className="absolute inset-x-0 bottom-0 h-0.5 bg-[#FF5A1F]"
                      />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Price Filter Chips & Sort Dropdown */}
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <div className="flex items-center gap-1">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'under100', label: 'Under $100' },
                  { id: '100to160', label: '$100–$160' },
                  { id: 'over160', label: '$160+' },
                ].map((pf) => (
                  <button
                    key={pf.id}
                    onClick={() => setPriceFilter(pf.id as any)}
                    className={`px-2.5 py-1 font-mono text-[11px] transition-colors ${
                      priceFilter === pf.id
                        ? 'bg-white/15 font-bold text-white'
                        : 'text-[#8A8F95] hover:text-white'
                    }`}
                  >
                    {pf.label}
                  </button>
                ))}
              </div>

              {/* Sorter */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="rounded-none border border-white/10 bg-[#1F2327] px-3 py-1.5 text-xs text-white focus:outline-none"
                aria-label="Sort products"
              >
                <option value="featured">Featured</option>
                <option value="priceAsc">Price: low to high</option>
                <option value="priceDesc">Price: high to low</option>
                <option value="rating">Rating</option>
              </select>

              {/* Result Count §7.3 */}
              <span className="hidden pl-2 font-mono text-[11px] tabular-nums text-[#8A8F95] sm:inline">
                Showing {filtered.length} styles
              </span>
            </div>
          </div>

          {/* Product Grid with Motion layout & popLayout AnimatePresence §7.3 & §8.6 */}
          {filtered.length === 0 ? (
            <div className="py-24 text-center">
              <p className="text-sm text-[#8A8F95]">No styles match these filters.</p>
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setPriceFilter('all');
                }}
                className="mt-4 border border-white/20 px-4 py-2 font-mono text-xs uppercase text-white hover:bg-white/10"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <motion.ul layout className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
              <AnimatePresence mode="popLayout">
                {filtered.map((product, i) => (
                  <motion.li
                    key={product.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      transition: {
                        duration: 0.22,
                        ease: ease.drape,
                        delay: Math.min(i, 7) * 0.025,
                      },
                    }}
                    exit={{ opacity: 0, transition: { duration: 0.12 } }}
                    className="list-none"
                  >
                    <ProductCard product={product} onQuickView={onQuickView} />
                  </motion.li>
                ))}
              </AnimatePresence>
            </motion.ul>
          )}
        </LayoutGroup>
      </div>
    </section>
  );
}

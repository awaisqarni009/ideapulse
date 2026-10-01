'use client';

import React, { useState, useMemo } from 'react';
import { PRODUCTS, CATEGORIES, Product } from '@/lib/store/products';
import { ProductCard } from '@/app/components/store/product-card';
import { QuickViewModal } from '@/app/components/store/quick-view-modal';
import {
  Sparkles,
  Shield,
  Flame,
  Zap,
  ArrowRight,
  Check,
  Search,
  SlidersHorizontal,
} from 'lucide-react';

export default function StoreHomePage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [priceFilter, setPriceFilter] = useState<'all' | 'under100' | '100to160' | 'over160'>(
    'all',
  );
  const [sortBy, setSortBy] = useState<'featured' | 'priceAsc' | 'priceDesc' | 'rating'>(
    'featured',
  );
  const [activeQuickViewProduct, setActiveQuickViewProduct] = useState<Product | null>(null);

  // Filter & sort logic
  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((item) => {
      // Category filter
      if (selectedCategory === 'hoodie' && item.category !== 'hoodie') return false;
      if (selectedCategory === 'jacket' && item.category !== 'jacket') return false;
      if (selectedCategory === 'bestseller' && item.badge !== 'BESTSELLER') return false;
      if (selectedCategory === 'new' && item.badge !== 'NEW DROP') return false;

      // Price filter
      if (priceFilter === 'under100' && item.price >= 100) return false;
      if (priceFilter === '100to160' && (item.price < 100 || item.price > 160)) return false;
      if (priceFilter === 'over160' && item.price <= 160) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesSubtitle = item.subtitle.toLowerCase().includes(q);
        const matchesDesc = item.description.toLowerCase().includes(q);
        const matchesSubcat = item.subcategory.toLowerCase().includes(q);
        if (!matchesTitle && !matchesSubtitle && !matchesDesc && !matchesSubcat) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'priceAsc') return a.price - b.price;
      if (sortBy === 'priceDesc') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
    });
  }, [selectedCategory, priceFilter, searchQuery, sortBy]);

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100">
      {/* Hero Banner Section */}
      <section className="relative overflow-hidden border-b border-white/10 bg-[#07090e] py-16 sm:py-24 lg:py-28">
        {/* Background Ambient Glow & Imagery */}
        <div className="absolute inset-0 z-0 opacity-40">
          <img
            src="/images/hero-banner.jpg"
            alt="PulseWear Streetwear Hero"
            className="h-full w-full object-cover object-center brightness-75 contrast-125 filter"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#07090e] via-[#07090e]/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#07090e] via-[#07090e]/80 to-transparent" />
        </div>

        <div className="container relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            {/* Pill */}
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-1.5 text-xs font-semibold text-indigo-300 backdrop-blur-md">
              <span className="flex h-2 w-2 animate-ping rounded-full bg-indigo-400" />
              <span>COLLECTION 2026 // NOW SHIPPING WORLDWIDE</span>
            </div>

            <h1 className="mt-5 font-display text-4xl font-black tracking-tight text-white sm:text-6xl lg:text-7xl">
              ENGINEERED <br />
              <span className="bg-gradient-to-r from-indigo-400 via-violet-300 to-cyan-400 bg-clip-text text-transparent">
                FOR WARMTH.
              </span>
              <br />
              CUT FOR STREETS.
            </h1>

            <p className="mt-5 text-sm leading-relaxed text-slate-300 sm:text-base">
              Dense 500 GSM loopback French terry hoodies and storm-grade 20,000mm waterproof
              tactical shells. Handcrafted with architectural drop shoulders, concealed storage, and
              lifelong durability.
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                onClick={() => {
                  setSelectedCategory('hoodie');
                  document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-xl shadow-indigo-600/30 transition-all hover:bg-indigo-500 hover:shadow-indigo-500/40 active:scale-95"
              >
                <span>Shop Heavyweight Hoodies</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                onClick={() => {
                  setSelectedCategory('jacket');
                  document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-white backdrop-blur-md transition-all hover:bg-white/20 active:scale-95"
              >
                <span>Explore Techwear Jackets</span>
              </button>
            </div>

            {/* Value Props Row */}
            <div className="mt-10 grid grid-cols-2 gap-4 border-t border-white/10 pt-6 sm:grid-cols-4">
              <div>
                <div className="font-mono text-lg font-bold text-white">500 GSM</div>
                <div className="text-[11px] text-slate-400">Dense Organic Cotton</div>
              </div>
              <div>
                <div className="font-mono text-lg font-bold text-indigo-400">20,000mm</div>
                <div className="text-[11px] text-slate-400">Waterproof Shells</div>
              </div>
              <div>
                <div className="font-mono text-lg font-bold text-white">FREE EXPR.</div>
                <div className="text-[11px] text-slate-400">Orders Over $100</div>
              </div>
              <div>
                <div className="font-mono text-lg font-bold text-emerald-400">30 DAYS</div>
                <div className="text-[11px] text-slate-400">Hassle-Free Returns</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Catalog & Filter Section */}
      <section id="catalog" className="container mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Category Selector Tabs */}
        <div className="flex flex-col gap-4 border-b border-white/10 pb-6 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold tracking-wide transition-all ${
                    isSelected
                      ? 'border border-indigo-500 bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                      : 'border border-white/10 bg-white/[0.03] text-slate-400 hover:border-white/20 hover:text-white'
                  }`}
                >
                  {cat.id === 'all' && <Sparkles className="h-3.5 w-3.5" />}
                  {cat.id === 'hoodie' && <span>👕</span>}
                  {cat.id === 'jacket' && <Shield className="h-3.5 w-3.5" />}
                  {cat.id === 'bestseller' && <Flame className="h-3.5 w-3.5 text-amber-400" />}
                  {cat.id === 'new' && <Zap className="h-3.5 w-3.5 text-cyan-400" />}
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search & Sort Controls */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-60">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search styles, GSM..."
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Sorter */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="rounded-xl border border-white/10 bg-[#0e131f] px-3 py-2 text-xs font-medium text-slate-300 focus:border-indigo-500 focus:outline-none"
            >
              <option value="featured">Featured Drops</option>
              <option value="priceAsc">Price: Low to High</option>
              <option value="priceDesc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>

        {/* Sub-Filters: Price row & Counter */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">Price:</span>
            <button
              onClick={() => setPriceFilter('all')}
              className={`rounded-lg px-2.5 py-1 ${
                priceFilter === 'all' ? 'bg-white/15 font-bold text-white' : 'hover:text-white'
              }`}
            >
              All Prices
            </button>
            <button
              onClick={() => setPriceFilter('under100')}
              className={`rounded-lg px-2.5 py-1 ${
                priceFilter === 'under100' ? 'bg-white/15 font-bold text-white' : 'hover:text-white'
              }`}
            >
              Under $100
            </button>
            <button
              onClick={() => setPriceFilter('100to160')}
              className={`rounded-lg px-2.5 py-1 ${
                priceFilter === '100to160' ? 'bg-white/15 font-bold text-white' : 'hover:text-white'
              }`}
            >
              $100 - $160
            </button>
            <button
              onClick={() => setPriceFilter('over160')}
              className={`rounded-lg px-2.5 py-1 ${
                priceFilter === 'over160' ? 'bg-white/15 font-bold text-white' : 'hover:text-white'
              }`}
            >
              $160+
            </button>
          </div>

          <div>
            Showing <strong className="text-white">{filteredProducts.length}</strong> styles
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="my-16 flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-[#0e131f] p-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-2xl text-slate-400">
              🔍
            </div>
            <h3 className="mt-4 font-display text-lg font-bold text-white">
              No garments match your filters
            </h3>
            <p className="mt-1 max-w-sm text-xs text-slate-400">
              Try clearing your search query or switching price ranges to discover other heavyweight
              pieces.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
                setPriceFilter('all');
              }}
              className="mt-4 rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white hover:bg-indigo-500"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickView={(p) => setActiveQuickViewProduct(p)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Editorial Lookbook & Craftsmanship Section */}
      <section id="lookbook" className="border-t border-white/10 bg-[#0b0f19] py-16 sm:py-24">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="font-mono text-xs uppercase tracking-widest text-indigo-400">
              AESTHETIC & MATERIAL LAB
            </span>
            <h2 className="mt-2 font-display text-3xl font-black text-white sm:text-4xl">
              BEYOND FAST FASHION.
            </h2>
            <p className="mt-3 text-xs leading-relaxed text-slate-400 sm:text-sm">
              We reject paper-thin polyester. Every PULSEWEAR garment is engineered from heavy-gauge
              fibers calibrated for supreme drape and multi-season resistance.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Card 1 */}
            <div className="flex flex-col rounded-2xl border border-white/10 bg-[#07090e] p-6 transition-all hover:border-indigo-500/40">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-xl text-indigo-400">
                🧶
              </div>
              <h3 className="mt-4 font-display text-lg font-bold text-white">
                500 GSM French Terry
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-400">
                Substantial loopback interior absorbs moisture and maintains architectural posture.
                Double-lined hood stays upright without messy drawcords.
              </p>
            </div>

            {/* Card 2 */}
            <div className="flex flex-col rounded-2xl border border-white/10 bg-[#07090e] p-6 transition-all hover:border-indigo-500/40">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-xl text-indigo-400">
                🛡️
              </div>
              <h3 className="mt-4 font-display text-lg font-bold text-white">
                20,000mm Hydrostatic Shell
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-400">
                Triple-layer fluorocarbon-free DWR laminate repels downpours while letting internal
                body vapor escape through laser-cut underarm vents.
              </p>
            </div>

            {/* Card 3 */}
            <div className="flex flex-col rounded-2xl border border-white/10 bg-[#07090e] p-6 transition-all hover:border-indigo-500/40">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-xl text-indigo-400">
                ⚙️
              </div>
              <h3 className="mt-4 font-display text-lg font-bold text-white">
                German Fidlock & YKK
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-400">
                Industrial two-way zippers, magnetic quick-release chest buckles, and bar-tack
                stress-point reinforcement tested for 100,000 cycles.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Reviews Section */}
      <section id="reviews" className="border-t border-white/10 bg-[#07090e] py-16 sm:py-24">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col border-b border-white/10 pb-6 md:flex-row md:items-end md:justify-between">
            <div>
              <span className="font-mono text-xs uppercase tracking-widest text-indigo-400">
                VERIFIED COLLECTORS
              </span>
              <h2 className="mt-2 font-display text-3xl font-black text-white sm:text-4xl">
                WHAT THE STREETS ARE SAYING
              </h2>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm text-slate-300 md:mt-0">
              <span className="text-lg text-amber-400">★★★★★</span>
              <span className="font-bold text-white">4.92 / 5.0</span>
              <span className="text-slate-500">• Over 12,000 Verified Deliveries</span>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-[#0e131f] p-6">
              <div className="flex items-center justify-between text-xs">
                <span className="text-amber-400">★★★★★</span>
                <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                  Verified Buyer
                </span>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-slate-300">
                &quot;The Shadow Matrix hoodie is pure luxury. You immediately feel the weight when
                you pick it up. It sits with that perfect Balenciaga/Yeezy boxy drop without being
                sloppy.&quot;
              </p>
              <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3 text-[11px]">
                <strong className="text-white">Malik Z.</strong>
                <span className="text-slate-500">Purchased: Shadow Matrix (L)</span>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#0e131f] p-6">
              <div className="flex items-center justify-between text-xs">
                <span className="text-amber-400">★★★★★</span>
                <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                  Verified Buyer
                </span>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-slate-300">
                &quot;Took the Cyber-Spec jacket on a motorcycle trip through heavy storm
                conditions. Zero leakage, Fidlock buckles work with gloves on. Unreal value for the
                price.&quot;
              </p>
              <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3 text-[11px]">
                <strong className="text-white">Julian D.</strong>
                <span className="text-slate-500">Purchased: Cyber-Spec Jacket (XL)</span>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#0e131f] p-6">
              <div className="flex items-center justify-between text-xs">
                <span className="text-amber-400">★★★★★</span>
                <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                  Verified Buyer
                </span>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-slate-300">
                &quot;Shipping took only 2 days to arrive. Packaging had custom dust bags and metal
                tags. My favorite clothing brand of 2026.&quot;
              </p>
              <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3 text-[11px]">
                <strong className="text-white">Ayesha K.</strong>
                <span className="text-slate-500">Purchased: Sub-Zero Down Puffer (M)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter VIP Club */}
      <section className="border-t border-white/10 bg-gradient-to-b from-[#07090e] to-[#0d121f] py-16 text-center">
        <div className="container mx-auto max-w-xl px-4">
          <span className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-[11px] font-bold text-indigo-400">
            JOIN THE INNER CIRCLE
          </span>
          <h2 className="mt-3 font-display text-2xl font-black text-white sm:text-3xl">
            GET 20% OFF YOUR FIRST DROP
          </h2>
          <p className="mt-2 text-xs text-slate-400">
            Enter your email to receive early access to seasonal capsule drops and private discount
            codes.
          </p>
          <div className="mt-6 flex gap-2">
            <input
              type="email"
              placeholder="Enter your email address"
              className="flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
            />
            <button
              onClick={() =>
                alert('Welcome to the Pulse Club! Use code PULSE20 at checkout for 20% off.')
              }
              className="rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-indigo-500"
            >
              Claim 20%
            </button>
          </div>
        </div>
      </section>

      {/* Quick View Spec Modal */}
      <QuickViewModal
        product={activeQuickViewProduct}
        onClose={() => setActiveQuickViewProduct(null)}
      />
    </div>
  );
}

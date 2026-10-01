'use client';

import React, { useState } from 'react';
import { Product, ProductColor } from '@/lib/store/products';
import { useCart } from '@/lib/store/cart-context';
import { useWishlist } from '@/lib/store/wishlist-context';

interface ProductCardProps {
  product: Product;
  onQuickView: (product: Product) => void;
}

export function ProductCard({ product, onQuickView }: ProductCardProps) {
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [activeColor, setActiveColor] = useState<ProductColor>(
    product.colors[0] ?? { name: 'Default', hex: '#0a0d14', bgClass: 'bg-[#0a0d14]' },
  );
  const [quickAddedSize, setQuickAddedSize] = useState<string | null>(null);

  const isFavorited = isInWishlist(product.id);

  const handleQuickAdd = (size: 'S' | 'M' | 'L' | 'XL' | 'XXL', e: React.MouseEvent) => {
    e.stopPropagation();
    addItem(product, size, activeColor, 1);
    setQuickAddedSize(size);
    setTimeout(() => setQuickAddedSize(null), 1200);
  };

  return (
    <div
      onClick={() => onQuickView(product)}
      className="group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0e131f] transition-all duration-300 hover:-translate-y-1.5 hover:border-indigo-500/40 hover:shadow-xl hover:shadow-indigo-500/10"
    >
      {/* Product Image Area */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#07090e]">
        {/* Badges */}
        <div className="absolute left-3 top-3 z-10 flex flex-col gap-1.5">
          {product.badge && (
            <span className="rounded-full border border-indigo-400/30 bg-indigo-600/90 px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-white shadow-md backdrop-blur-md">
              {product.badge}
            </span>
          )}
          <span className="rounded-md border border-white/10 bg-black/60 px-2 py-0.5 font-mono text-[9px] tracking-wider text-slate-300 backdrop-blur-md">
            {product.weightGsm} GSM
          </span>
        </div>

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className={`absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full border backdrop-blur-md transition-all ${
            isFavorited
              ? 'border-rose-500 bg-rose-500/20 text-rose-400'
              : 'border-white/10 bg-black/50 text-slate-300 hover:border-white/30 hover:text-white'
          }`}
          title={isFavorited ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          {isFavorited ? '♥' : '♡'}
        </button>

        {/* Main Image */}
        <img
          src={product.image}
          alt={product.title}
          className="group-hover:scale-108 h-full w-full object-cover transition-transform duration-700 ease-out"
        />

        {/* Quick View Button overlay on desktop */}
        <div className="absolute inset-x-3 bottom-3 z-10 hidden opacity-0 transition-opacity duration-300 group-hover:opacity-100 sm:flex">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickView(product);
            }}
            className="w-full rounded-xl border border-white/20 bg-black/75 py-2.5 text-xs font-bold uppercase tracking-wider text-white backdrop-blur-md transition-colors hover:bg-black"
          >
            Quick View Specs
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex flex-1 flex-col p-4">
        {/* Category & Rating */}
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span className="font-mono uppercase text-indigo-400">
            {product.category} • {product.fit}
          </span>
          <div className="flex items-center gap-1 text-amber-400">
            <span>★</span>
            <span className="font-semibold text-slate-300">{product.rating}</span>
            <span className="text-slate-500">({product.reviewsCount})</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="mt-1 line-clamp-1 font-display text-sm font-bold text-white transition-colors group-hover:text-indigo-300">
          {product.title}
        </h3>
        <p className="line-clamp-1 text-[11px] text-slate-400">{product.subtitle}</p>

        {/* Color swatches */}
        <div className="mt-3 flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          {product.colors.map((color) => {
            const isSelected = activeColor.name === color.name;
            return (
              <button
                key={color.name}
                onClick={() => setActiveColor(color)}
                className={`h-4 w-4 rounded-full border transition-all ${
                  isSelected
                    ? 'scale-110 border-white shadow-sm'
                    : 'border-white/20 opacity-70 hover:opacity-100'
                }`}
                style={{ backgroundColor: color.hex }}
                title={color.name}
              />
            );
          })}
          <span className="ml-1 text-[10px] text-slate-400">{activeColor.name}</span>
        </div>

        {/* Price & Quick Size Selector */}
        <div className="mt-4 border-t border-white/5 pt-3">
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-2">
              <span className="font-display text-base font-extrabold text-white">
                ${product.price}
              </span>
              {product.originalPrice && (
                <span className="text-xs text-slate-500 line-through">
                  ${product.originalPrice}
                </span>
              )}
            </div>
            {product.originalPrice && (
              <span className="text-[10px] font-bold text-rose-400">
                SAVE ${product.originalPrice - product.price}
              </span>
            )}
          </div>

          {/* 1-Click Quick Add Sizes */}
          <div
            className="mt-2.5 flex items-center justify-between gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
              Add:
            </span>
            <div className="flex gap-1">
              {product.sizes.map((size) => {
                const wasAdded = quickAddedSize === size;
                return (
                  <button
                    key={size}
                    onClick={(e) => handleQuickAdd(size, e)}
                    className={`flex h-6 w-6 items-center justify-center rounded-md border text-[10px] font-bold transition-all ${
                      wasAdded
                        ? 'border-emerald-500 bg-emerald-500 text-white'
                        : 'border-white/10 bg-white/[0.04] text-slate-300 hover:border-indigo-400 hover:bg-indigo-600 hover:text-white'
                    }`}
                    title={`Add size ${size} to bag`}
                  >
                    {wasAdded ? '✓' : size}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { Product, ProductColor } from '@/lib/store/products';
import { useCart } from '@/lib/store/cart-context';
import { useWishlist } from '@/lib/store/wishlist-context';
import { Heart, Check } from 'lucide-react';
import { ease } from '@/lib/motion';

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
}

export function ProductCard({ product, onQuickView }: ProductCardProps) {
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [activeColor] = useState<ProductColor>(
    product.colors[0] ?? { name: 'Onyx', hex: '#15181B', bgClass: 'bg-[#15181B]' },
  );
  const [isHovered, setIsHovered] = useState(false);
  const [quickAddedSize, setQuickAddedSize] = useState<string | null>(null);

  const isFavorited = isInWishlist(product.id);

  const handleQuickAdd = (size: 'S' | 'M' | 'L' | 'XL' | 'XXL', e: React.MouseEvent) => {
    e.stopPropagation();
    addItem(product, size, activeColor, 1);
    setQuickAddedSize(size);
    setTimeout(() => setQuickAddedSize(null), 1000);
  };

  // Badge styling per §7.4: Orange only for "Low stock" and "Limited run"
  const isOrangeBadge = product.badge === 'Low stock' || product.badge === 'Limited run';

  return (
    <div
      onClick={() => onQuickView && onQuickView(product)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative flex cursor-pointer flex-col bg-transparent text-[#F2F5F7] focus-within:ring-2 focus-within:ring-[#F2F5F7]"
      tabIndex={0}
      role="button"
      aria-label={`View specs for ${product.title}`}
    >
      {/* 4:5 Image Container with Crossfade to alt photo §7.4 */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#1F2327]">
        {/* Single badge top-left in sentence case §7.4 */}
        {product.badge && (
          <span
            className={`absolute left-3 top-3 z-20 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${
              isOrangeBadge
                ? 'bg-[#FF5A1F] font-bold text-white'
                : 'border border-white/10 bg-[#15181B]/90 text-[#DEDBD2]'
            }`}
          >
            {product.badge}
          </span>
        )}

        {/* Heart Favorite Button (stroke draws in, no bounce §7.4) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className="absolute right-3 top-3 z-20 flex h-8 w-8 items-center justify-center text-white/70 transition-colors hover:text-white"
          aria-label={isFavorited ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart
            className={`h-4 w-4 transition-all duration-200 ${
              isFavorited ? 'fill-[#FF5A1F] text-[#FF5A1F]' : 'stroke-white stroke-[1.5]'
            }`}
          />
        </button>

        {/* Front Photo */}
        <img
          src={product.image}
          alt={product.title}
          className={`duration-240 h-full w-full object-cover transition-opacity ${
            isHovered && product.secondaryImage ? 'opacity-0' : 'opacity-100'
          }`}
        />

        {/* Alt Photo Crossfade (240 ms per §7.4) */}
        {product.secondaryImage && (
          <img
            src={product.secondaryImage}
            alt={`${product.title} alternate angle`}
            className={`duration-240 absolute inset-0 h-full w-full object-cover transition-opacity ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}
          />
        )}

        {/* Size Tray slides up from bottom edge (280 ms) on hover & focus-within §7.4 */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="duration-280 absolute inset-x-0 bottom-0 z-20 flex translate-y-full items-center justify-between gap-1 border-t border-white/10 bg-[#15181B]/95 px-3 py-2 backdrop-blur-sm transition-transform ease-[cubic-bezier(0.32,0.72,0,1)] group-focus-within:translate-y-0 group-hover:translate-y-0"
        >
          <span className="font-mono text-[10px] uppercase tracking-wider text-[#8A8F95]">
            Quick add:
          </span>
          <div className="flex gap-1">
            {product.sizes.map((size) => {
              const isAdded = quickAddedSize === size;
              return (
                <button
                  key={size}
                  onClick={(e) => handleQuickAdd(size, e)}
                  className={`flex h-7 w-7 items-center justify-center font-mono text-[10px] font-bold transition-transform active:scale-95 ${
                    isAdded
                      ? 'bg-[#10B981] text-white'
                      : 'border border-white/10 bg-[#1F2327] text-white hover:bg-white/20'
                  }`}
                  aria-label={`Add size ${size}`}
                >
                  {isAdded ? <Check className="h-3 w-3" /> : size}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Product Details Section (Typography & Tabular Numerals §7.4) */}
      <div className="flex flex-1 flex-col justify-between pb-1 pt-3">
        <div>
          <h3 className="line-clamp-1 font-display text-sm font-bold text-white transition-colors group-hover:text-[#DEDBD2]">
            {product.title}
          </h3>
          <div className="line-clamp-1 text-xs text-[#8A8F95]">
            {product.category === 'hoodie' ? 'Heavyweight Hoodie' : 'Tactical Shell'}
          </div>

          {/* Spec line: the only place GSM appears §7.4 */}
          <div className="mt-1 font-mono text-[11px] text-[#8A8F95]">
            {product.weightGsm} GSM · {activeColor.name}
          </div>
        </div>

        {/* Pricing with Tabular Numerals §7.4 */}
        <div className="mt-2 flex items-baseline gap-2 border-t border-white/5 pt-2">
          <span className="text-sm font-bold tabular-nums text-white">${product.price}</span>
          {product.originalPrice && (
            <span className="text-xs tabular-nums text-[#8A8F95] line-through">
              ${product.originalPrice}
            </span>
          )}
          {product.originalPrice && (
            <span className="font-mono text-[10px] text-[#FF5A1F]">
              Save ${product.originalPrice - product.price}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

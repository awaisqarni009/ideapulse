'use client';

import React, { useState } from 'react';
import { Product, ProductColor } from '@/lib/store/products';
import { useCart } from '@/lib/store/cart-context';
import { useWishlist } from '@/lib/store/wishlist-context';
import { SizeGuideModal } from './size-guide-modal';

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
}

export function QuickViewModal({ product, onClose }: QuickViewModalProps) {
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [selectedColor, setSelectedColor] = useState<ProductColor | null>(
    product?.colors[0] || null,
  );
  const [selectedSize, setSelectedSize] = useState<'S' | 'M' | 'L' | 'XL' | 'XXL'>(
    product?.sizes[0] || 'L',
  );
  const [quantity, setQuantity] = useState(1);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'specs' | 'reviews'>('details');
  const [addedAnimation, setAddedAnimation] = useState(false);

  // Sync selected color and size when product changes
  React.useEffect(() => {
    if (product) {
      setSelectedColor(product.colors[0] ?? null);
      setSelectedSize(product.sizes[0] || 'L');
      setQuantity(1);
      setAddedAnimation(false);
    }
  }, [product]);

  if (!product) return null;

  const isFavorited = isInWishlist(product.id);

  const handleAddToCart = () => {
    if (!selectedColor) return;
    addItem(product, selectedSize, selectedColor, quantity);
    setAddedAnimation(true);
    setTimeout(() => {
      setAddedAnimation(false);
      onClose();
    }, 700);
  };

  return (
    <>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="quick-view-title"
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6"
      >
        {/* Backdrop */}
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity duration-300"
        />

        {/* Modal Dialog */}
        <div className="relative flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0b0f19] shadow-2xl md:flex-row">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-slate-300 backdrop-blur-md transition-colors hover:bg-black hover:text-white"
            aria-label="Close modal"
          >
            ✕
          </button>

          {/* Left Column: Image Showcase */}
          <div className="relative flex min-h-[280px] w-full items-center justify-center bg-[#07090e] p-6 md:min-h-[520px] md:w-1/2">
            {product.badge && (
              <span className="absolute left-4 top-4 z-10 rounded-full border border-indigo-400/30 bg-indigo-600/90 px-3 py-1 text-[11px] font-bold tracking-wider text-white shadow-lg backdrop-blur-md">
                {product.badge}
              </span>
            )}
            <img
              src={product.image}
              alt={product.title}
              className="h-full max-h-[460px] w-full rounded-xl object-cover transition-transform duration-500 hover:scale-105"
            />
            {/* GSM & Fit Watermark */}
            <div className="absolute bottom-4 left-4 rounded-lg border border-white/10 bg-black/70 px-3 py-1.5 font-mono text-[11px] tracking-wider text-slate-300 backdrop-blur-md">
              {product.weightGsm} GSM • {product.fit}
            </div>
          </div>

          {/* Right Column: Details & Customizer */}
          <div className="flex w-full flex-col overflow-y-auto p-6 md:w-1/2 md:p-8">
            {/* Category & Rating */}
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono uppercase tracking-wider text-indigo-400">
                {`${product.category} // ${product.subcategory}`}
              </span>
              <div className="flex items-center gap-1 text-amber-400">
                <span>★</span>
                <span className="font-semibold text-slate-200">{product.rating}</span>
                <span className="text-slate-500">({product.reviewsCount} reviews)</span>
              </div>
            </div>

            <h2
              id="quick-view-title"
              className="mt-2 font-display text-2xl font-extrabold text-white"
            >
              {product.title}
            </h2>
            <p className="mt-1 text-xs text-slate-400">{product.subtitle}</p>

            {/* Price section */}
            <div className="mt-3 flex items-baseline gap-3">
              <span className="text-2xl font-extrabold text-white">${product.price}</span>
              {product.originalPrice && (
                <span className="text-sm text-slate-500 line-through">
                  ${product.originalPrice}
                </span>
              )}
              {product.originalPrice && (
                <span className="rounded bg-rose-500/20 px-2 py-0.5 text-xs font-semibold text-rose-400">
                  Save ${product.originalPrice - product.price}
                </span>
              )}
            </div>

            {/* Color Swatches */}
            <div className="mt-5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-300">
                  Color: <strong className="text-white">{selectedColor?.name}</strong>
                </span>
              </div>
              <div className="mt-2 flex items-center gap-2">
                {product.colors.map((color) => {
                  const isSelected = selectedColor?.name === color.name;
                  return (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color)}
                      className={`group relative flex h-8 w-8 items-center justify-center rounded-full p-0.5 transition-all ${
                        isSelected
                          ? 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-[#0b0f19]'
                          : 'opacity-80 hover:opacity-100'
                      }`}
                      title={color.name}
                    >
                      <span
                        className="h-full w-full rounded-full border border-white/20 shadow-inner"
                        style={{ backgroundColor: color.hex }}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Size Selector */}
            <div className="mt-5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-300">
                  Select Size: <strong className="text-white">{selectedSize}</strong>
                </span>
                <button
                  onClick={() => setShowSizeGuide(true)}
                  className="text-xs text-indigo-400 underline transition-colors hover:text-indigo-300"
                >
                  Size & Measurement Guide
                </button>
              </div>
              <div className="mt-2 grid grid-cols-5 gap-2">
                {product.sizes.map((size) => {
                  const isSelected = selectedSize === size;
                  return (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`flex h-10 items-center justify-center rounded-xl border text-xs font-bold transition-all ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                          : 'border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/25 hover:text-white'
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Stock indicator */}
            <div className="mt-4 flex items-center gap-2 text-xs">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              </span>
              <span className="font-medium text-emerald-400">In Stock</span>
              <span className="text-slate-500">• Only {product.stock} units remaining</span>
            </div>

            {/* Quantity and Add to Cart Buttons */}
            <div className="mt-5 flex items-center gap-3">
              <div className="flex h-11 items-center rounded-xl border border-white/10 bg-white/[0.03] px-3">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-2 text-slate-400 transition-colors hover:text-white"
                >
                  -
                </button>
                <span className="w-8 text-center text-xs font-semibold text-white">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  className="px-2 text-slate-400 transition-colors hover:text-white"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={addedAnimation}
                className={`flex h-11 flex-1 items-center justify-center gap-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                  addedAnimation
                    ? 'bg-emerald-600 text-white'
                    : 'bg-indigo-600 text-white hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-500/25 active:scale-95'
                }`}
              >
                {addedAnimation ? (
                  <>✓ Added to Pulse Cart</>
                ) : (
                  <>Add to Bag • ${(product.price * quantity).toFixed(2)}</>
                )}
              </button>

              <button
                onClick={() => toggleWishlist(product.id)}
                className={`flex h-11 w-11 items-center justify-center rounded-xl border transition-all ${
                  isFavorited
                    ? 'border-rose-500/50 bg-rose-500/20 text-rose-400'
                    : 'border-white/10 bg-white/[0.03] text-slate-400 hover:border-white/20 hover:text-white'
                }`}
                title={isFavorited ? 'Remove from Wishlist' : 'Add to Wishlist'}
              >
                {isFavorited ? '♥' : '♡'}
              </button>
            </div>

            {/* Tabs for details, fabric, reviews */}
            <div className="mt-6 border-t border-white/10 pt-4">
              <div className="flex gap-4 border-b border-white/10 pb-2 text-xs font-medium">
                <button
                  onClick={() => setActiveTab('details')}
                  className={`pb-1 transition-colors ${
                    activeTab === 'details'
                      ? 'border-b-2 border-indigo-500 font-semibold text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Description
                </button>
                <button
                  onClick={() => setActiveTab('specs')}
                  className={`pb-1 transition-colors ${
                    activeTab === 'specs'
                      ? 'border-b-2 border-indigo-500 font-semibold text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Fabric & Specs
                </button>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`pb-1 transition-colors ${
                    activeTab === 'reviews'
                      ? 'border-b-2 border-indigo-500 font-semibold text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Reviews ({product.reviewsCount})
                </button>
              </div>

              <div className="mt-3 text-xs leading-relaxed text-slate-300">
                {activeTab === 'details' && (
                  <div className="space-y-2">
                    <p>{product.description}</p>
                    <ul className="list-disc space-y-1 pl-4 text-slate-400">
                      {product.features.map((feat, i) => (
                        <li key={i}>{feat}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {activeTab === 'specs' && (
                  <ul className="space-y-1.5">
                    {product.fabricDetails.map((item, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="text-indigo-400">▪</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {activeTab === 'reviews' && (
                  <div className="space-y-3">
                    {product.reviews && product.reviews.length > 0 ? (
                      product.reviews.map((rev) => (
                        <div
                          key={rev.id}
                          className="rounded-lg border border-white/5 bg-white/[0.02] p-2.5"
                        >
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-semibold text-white">{rev.author}</span>
                            <span className="text-slate-500">{rev.date}</span>
                          </div>
                          <p className="mt-1 text-slate-300">{rev.comment}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-500">
                        No customer reviews yet. Be the first to review!
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <SizeGuideModal isOpen={showSizeGuide} onClose={() => setShowSizeGuide(false)} />
    </>
  );
}

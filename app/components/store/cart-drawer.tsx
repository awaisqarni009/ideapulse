'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/lib/store/cart-context';

export function CartDrawer() {
  const {
    items,
    isCartOpen,
    closeCart,
    removeItem,
    updateQuantity,
    subtotal,
    discount,
    shipping,
    total,
    promoCode,
    promoDiscountPercent,
    applyPromo,
    removePromo,
    itemCount,
  } = useCart();

  const [promoInput, setPromoInput] = useState('');
  const [promoFeedback, setPromoFeedback] = useState<{ text: string; error?: boolean } | null>(
    null,
  );

  if (!isCartOpen) return null;

  const freeShippingThreshold = 100;
  const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;
    const res = applyPromo(promoInput);
    setPromoFeedback({ text: res.message, error: !res.success });
    if (res.success) setPromoInput('');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cart-drawer-title"
      className="fixed inset-0 z-50 overflow-hidden"
    >
      {/* Backdrop */}
      <div
        onClick={closeCart}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300"
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-md transform border-l border-white/10 bg-[#0b0f19] shadow-2xl transition-all duration-300">
          <div className="flex h-full flex-col">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
              <div className="flex items-center gap-2">
                <h2 id="cart-drawer-title" className="font-display text-lg font-bold text-white">
                  Your Pulse Bag
                </h2>
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                  {itemCount}
                </span>
              </div>
              <button
                onClick={closeCart}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-slate-400 transition-colors hover:text-white"
                aria-label="Close cart"
              >
                ✕
              </button>
            </div>

            {/* Free Shipping Meter */}
            <div className="border-b border-white/5 bg-white/[0.02] px-6 py-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300">
                  {remainingForFreeShipping > 0 ? (
                    <>
                      Add <strong className="text-indigo-400">${remainingForFreeShipping}</strong>{' '}
                      for{' '}
                      <span className="font-semibold text-emerald-400">Free Express Shipping</span>
                    </>
                  ) : (
                    <span className="font-semibold text-emerald-400">
                      🎉 Unlocked Free Worldwide Shipping!
                    </span>
                  )}
                </span>
                <span className="font-mono text-xs text-slate-400">{progressPercent}%</span>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-400 transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 divide-y divide-white/10 overflow-y-auto px-6 py-4">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-2xl text-slate-400">
                    🛍️
                  </div>
                  <h3 className="mt-4 font-display text-base font-bold text-white">
                    Your bag is empty
                  </h3>
                  <p className="mt-1 max-w-[240px] text-xs text-slate-400">
                    Looks like you haven&apos;t added any heavyweight hoodies or tactical jackets
                    yet.
                  </p>
                  <button
                    onClick={closeCart}
                    className="mt-5 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-indigo-600/30 transition-all hover:bg-indigo-500"
                  >
                    Explore Drops
                  </button>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="flex gap-4 py-4">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-20 w-20 flex-shrink-0 rounded-xl border border-white/10 object-cover"
                    />
                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between">
                          <h4 className="line-clamp-1 text-xs font-bold text-white">
                            {item.title}
                          </h4>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-xs text-slate-500 transition-colors hover:text-rose-400"
                            title="Remove item"
                          >
                            🗑️
                          </button>
                        </div>
                        <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-400">
                          <span className="flex items-center gap-1">
                            <span
                              className="h-2.5 w-2.5 rounded-full border border-white/20"
                              style={{ backgroundColor: item.color.hex }}
                            />
                            {item.color.name}
                          </span>
                          <span>•</span>
                          <span className="font-semibold text-indigo-400">Size {item.size}</span>
                        </div>
                      </div>

                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center rounded-lg border border-white/10 bg-white/[0.02] px-2 py-0.5">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="px-1 text-slate-400 hover:text-white"
                          >
                            -
                          </button>
                          <span className="w-6 text-center text-xs font-medium text-white">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="px-1 text-slate-400 hover:text-white"
                          >
                            +
                          </button>
                        </div>
                        <span className="text-xs font-bold text-white">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer Summary & Checkout */}
            {items.length > 0 && (
              <div className="space-y-4 border-t border-white/10 bg-[#07090e] p-6">
                {/* Promo Code Input */}
                <form onSubmit={handleApplyPromo} className="flex gap-2">
                  <input
                    type="text"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    placeholder="Promo code (e.g. PULSE20)"
                    className="flex-1 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="rounded-xl border border-indigo-500/30 bg-indigo-600/20 px-4 py-2 text-xs font-bold text-indigo-300 transition-all hover:bg-indigo-600 hover:text-white"
                  >
                    Apply
                  </button>
                </form>

                {promoFeedback && (
                  <p
                    className={`text-[11px] ${
                      promoFeedback.error ? 'text-rose-400' : 'text-emerald-400'
                    }`}
                  >
                    {promoFeedback.text}
                  </p>
                )}

                {promoCode && (
                  <div className="flex items-center justify-between rounded-lg border border-indigo-500/20 bg-indigo-500/10 px-3 py-1.5 text-xs text-indigo-300">
                    <span>
                      Coupon <strong>{promoCode}</strong> applied ({promoDiscountPercent}% off)
                    </span>
                    <button
                      onClick={removePromo}
                      className="ml-2 text-xs font-bold text-rose-400 hover:text-rose-300"
                    >
                      ✕
                    </button>
                  </div>
                )}

                {/* Pricing details */}
                <div className="space-y-1.5 text-xs text-slate-300">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-semibold text-white">${subtotal.toFixed(2)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-400">
                      <span>Promo Discount ({promoDiscountPercent}%)</span>
                      <span>-${discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Estimated Shipping</span>
                    <span>
                      {shipping === 0 ? (
                        <span className="font-semibold text-emerald-400">FREE</span>
                      ) : (
                        `$${shipping.toFixed(2)}`
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-white/10 pt-2 text-sm font-bold text-white">
                    <span>Total</span>
                    <span className="text-base text-indigo-400">${total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Checkout Link */}
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="active:scale-98 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-xl shadow-indigo-600/30 transition-all hover:opacity-95"
                >
                  Proceed to Checkout • ${total.toFixed(2)}
                </Link>

                <p className="text-center text-[10px] text-slate-500">
                  🔒 Encrypted 256-Bit SSL Checkout • Free 30-Day Returns
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

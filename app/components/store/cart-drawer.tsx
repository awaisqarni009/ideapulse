'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { useCart } from '@/lib/store/cart-context';
import { X, Trash2, ArrowRight } from 'lucide-react';
import { ease } from '@/lib/motion';

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

  // Esc key closes drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isCartOpen) {
        closeCart();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCartOpen, closeCart]);

  if (!isCartOpen) return null;

  const freeShippingThreshold = 100;
  const progressRatio = Math.min(1, subtotal / freeShippingThreshold);
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
      {/* Backdrop fades 0 → 50% in 200 ms per §7.9 */}
      <div
        onClick={closeCart}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-200"
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-6">
        <div
          data-lenis-prevent="true"
          className="duration-360 flex h-full w-screen max-w-md transform flex-col border-l border-white/10 bg-[#15181B] text-[#F2F5F7] shadow-2xl transition-transform ease-[cubic-bezier(0.32,0.72,0,1)]"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
            <div className="flex items-baseline gap-2">
              <h2
                id="cart-drawer-title"
                className="font-display text-lg font-bold tracking-tight text-white"
              >
                Bag
              </h2>
              <span className="font-mono text-xs tabular-nums text-[#8A8F95]">
                ({itemCount} {itemCount === 1 ? 'item' : 'items'})
              </span>
            </div>
            <button
              onClick={closeCart}
              className="flex h-8 w-8 items-center justify-center rounded-sm border border-white/10 text-[#8A8F95] transition-colors hover:border-white/30 hover:text-white"
              aria-label="Close bag"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Free-Shipping ScaleX Progress Bar §7.9 */}
          <div className="border-b border-white/5 bg-[#1F2327] px-6 py-3.5">
            <div className="flex items-center justify-between font-mono text-xs">
              <span className="text-[#DEDBD2]">
                {remainingForFreeShipping > 0 ? (
                  <>
                    Add{' '}
                    <strong className="tabular-nums text-white">${remainingForFreeShipping}</strong>{' '}
                    for free express shipping
                  </>
                ) : (
                  <span className="font-semibold text-[#10B981]">
                    You&apos;ve unlocked free express shipping
                  </span>
                )}
              </span>
              <span className="tabular-nums text-[#8A8F95]">
                {Math.round(progressRatio * 100)}%
              </span>
            </div>
            <div className="mt-2 h-1 w-full overflow-hidden bg-white/10">
              <div
                className="duration-320 h-full origin-left bg-[#FF5A1F] transition-transform ease-out"
                style={{ transform: `scaleX(${progressRatio})` }}
              />
            </div>
          </div>

          {/* Cart Items List with Motion layout collapse §7.9 */}
          <div className="flex-1 divide-y divide-white/10 overflow-y-auto px-6 py-4">
            {items.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center py-16 text-center">
                <p className="font-display text-base font-bold text-white">Your bag is empty.</p>
                <p className="mt-1 max-w-[220px] text-xs text-[#8A8F95]">
                  Explore our dense 500 GSM loopback hoodies and waterproof shells.
                </p>
                <button
                  onClick={closeCart}
                  className="mt-6 border border-white/20 bg-white/[0.04] px-5 py-2.5 font-mono text-xs uppercase text-white hover:bg-white/10"
                >
                  Shop drops
                </button>
              </div>
            ) : (
              <AnimatePresence>
                {items.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 1 }}
                    exit={{
                      opacity: 0,
                      height: 0,
                      transition: { duration: 0.2, ease: ease.settle },
                    }}
                    className="flex gap-4 py-4"
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-20 w-16 shrink-0 rounded-none bg-black/40 object-cover"
                    />
                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between">
                          <h4 className="line-clamp-1 font-display text-xs font-bold text-white">
                            {item.title}
                          </h4>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="ml-2 text-[#8A8F95] transition-colors hover:text-[#FF5A1F]"
                            aria-label={`Remove ${item.title}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <div className="mt-1 font-mono text-[11px] text-[#8A8F95]">
                          Size {item.size} · {item.color.name}
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        {/* Stepper with snap feel §7.9 */}
                        <div className="flex items-center border border-white/10 bg-[#1F2327]">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="px-2 py-0.5 text-xs text-[#8A8F95] hover:text-white"
                          >
                            -
                          </button>
                          <span className="w-6 text-center font-mono text-xs font-semibold tabular-nums text-white">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="px-2 py-0.5 text-xs text-[#8A8F95] hover:text-white"
                          >
                            +
                          </button>
                        </div>

                        <span className="font-mono text-xs font-bold tabular-nums text-white">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>

          {/* Footer Summary & Checkout */}
          {items.length > 0 && (
            <div className="space-y-4 border-t border-white/10 bg-[#1F2327] p-6">
              {/* Promo Code Input */}
              <form onSubmit={handleApplyPromo} className="flex gap-2">
                <input
                  type="text"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value)}
                  placeholder="Code (e.g. PULSE20)"
                  className="flex-1 rounded-sm border border-white/10 bg-[#15181B] px-3 py-2 font-mono text-xs text-white placeholder-[#8A8F95] focus:border-white/30 focus:outline-none"
                />
                <button
                  type="submit"
                  className="rounded-sm border border-white/10 bg-white/[0.04] px-4 py-2 font-mono text-xs uppercase text-white hover:bg-white/10"
                >
                  Apply
                </button>
              </form>

              {promoFeedback && (
                <p
                  className={`font-mono text-[11px] ${promoFeedback.error ? 'text-[#FF5A1F]' : 'text-[#10B981]'}`}
                >
                  {promoFeedback.text}
                </p>
              )}

              {promoCode && (
                <div className="flex items-center justify-between border border-white/5 bg-[#15181B] p-2 font-mono text-xs text-[#DEDBD2]">
                  <span>
                    Code <strong>{promoCode}</strong> applied ({promoDiscountPercent}% off)
                  </span>
                  <button onClick={removePromo} className="text-xs text-[#FF5A1F] hover:underline">
                    Remove
                  </button>
                </div>
              )}

              {/* Price Breakdown */}
              <div className="space-y-1.5 font-mono text-xs text-[#8A8F95]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="tabular-nums text-white">${subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-[#10B981]">
                    <span>Discount ({promoDiscountPercent}%)</span>
                    <span className="tabular-nums">-${discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>
                    {shipping === 0 ? (
                      <strong className="text-[#10B981]">FREE</strong>
                    ) : (
                      `$${shipping.toFixed(2)}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between border-t border-white/10 pt-2 text-sm font-bold text-white">
                  <span>Total</span>
                  <span className="tabular-nums text-white">${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Checkout Verb Button §7.12: "Proceed to checkout" */}
              <Link
                href="/checkout"
                onClick={closeCart}
                className="flex w-full items-center justify-center gap-2 rounded-sm bg-[#FF5A1F] py-3 text-xs font-bold uppercase tracking-wider text-white transition-all hover:brightness-110 active:scale-[0.99]"
              >
                <span>Proceed to checkout</span>
                <span className="font-mono tabular-nums">(${total.toFixed(2)})</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

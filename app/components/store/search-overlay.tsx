'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PRODUCTS, Product } from '@/lib/store/products';
import { useCart } from '@/lib/store/cart-context';
import { Search, X, ArrowRight } from 'lucide-react';
import { ease } from '@/lib/motion';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct?: (product: Product) => void;
}

export function SearchOverlay({ isOpen, onClose, onSelectProduct }: SearchOverlayProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const { addItem } = useCart();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Handle Esc key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
      if (e.key === '/' && !isOpen && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        // open search handled by parent or header
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const filtered = query.trim()
    ? PRODUCTS.filter((p) => {
        const q = query.toLowerCase();
        return (
          p.title.toLowerCase().includes(q) ||
          p.subtitle.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          `${p.weightGsm} gsm`.includes(q)
        );
      })
    : [];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28, ease: ease.settle }}
          className="fixed inset-0 z-50 flex flex-col bg-[#15181B]/95 backdrop-blur-2xl"
          role="dialog"
          aria-modal="true"
          aria-label="Search outerwear"
        >
          {/* Search Header Bar */}
          <div className="container mx-auto max-w-4xl border-b border-white/10 px-4 pb-6 pt-8">
            <div className="flex items-center justify-between gap-4">
              <div className="relative flex flex-1 items-center gap-3">
                <Search className="h-6 w-6 text-[#8A8F95]" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Type to search hoodies, jackets, 500 GSM, Cordura..."
                  className="w-full bg-transparent text-xl font-medium text-white placeholder-[#8A8F95] focus:outline-none"
                />
              </div>
              <button
                onClick={onClose}
                className="flex h-10 w-10 items-center justify-center rounded-sm border border-white/10 text-[#8A8F95] transition-colors hover:border-white/30 hover:text-white"
                aria-label="Close search (Esc)"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-[#8A8F95]">
              <span>
                Press{' '}
                <kbd className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-white">Esc</kbd> to
                exit
              </span>
              <span>Showing {filtered.length} styles</span>
            </div>
          </div>

          {/* Search Results Area */}
          <div className="container mx-auto max-w-4xl flex-1 overflow-y-auto px-4 py-8">
            {query.trim() === '' ? (
              <div className="py-16 text-center text-[#8A8F95]">
                <p className="text-sm">Search by fabric, GSM, color, or outerwear silhouette.</p>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  {[
                    '500 GSM Hoodie',
                    'DWR Tactical Jacket',
                    'Down Puffer',
                    'Full-Zip',
                    'Heavy Bomber',
                  ].map((term) => (
                    <button
                      key={term}
                      onClick={() => setQuery(term)}
                      className="rounded-sm border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-slate-300 hover:border-white/20 hover:text-white"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-16 text-center text-[#8A8F95]">
                <p className="text-sm">No styles match &ldquo;{query}&rdquo;.</p>
                <button
                  onClick={() => setQuery('')}
                  className="mt-3 text-xs text-[#FF5A1F] hover:underline"
                >
                  Clear search query
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {filtered.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      if (onSelectProduct) onSelectProduct(item);
                      onClose();
                    }}
                    className="group flex cursor-pointer gap-4 rounded-sm border border-white/10 bg-[#1F2327] p-3 transition-all hover:border-white/30"
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-24 w-20 rounded-none bg-black/40 object-cover"
                    />
                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between font-mono text-[11px] text-[#8A8F95]">
                          <span className="uppercase">{item.category}</span>
                          <span>{item.weightGsm} GSM</span>
                        </div>
                        <h4 className="mt-1 font-display text-sm font-bold text-white group-hover:text-white">
                          {item.title}
                        </h4>
                        <div className="line-clamp-1 text-xs text-[#8A8F95]">{item.subtitle}</div>
                      </div>
                      <div className="flex items-center justify-between border-t border-white/5 pt-2">
                        <span className="font-bold tabular-nums text-white">${item.price}</span>
                        <span className="flex items-center gap-1 text-xs font-semibold text-[#FF5A1F]">
                          View Specs <ArrowRight className="h-3 w-3" />
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

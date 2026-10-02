'use client';

import React, { useRef } from 'react';
import { motion } from 'motion/react';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';

interface ReviewItem {
  id: string;
  author: string;
  rating: number;
  product: string;
  size: string;
  quote: string;
}

const REVIEWS_DATA: ReviewItem[] = [
  {
    id: 'rev-1',
    author: 'Malik Z.',
    rating: 5,
    product: 'Shadow Matrix Hoodie',
    size: 'Size L · Onyx',
    quote:
      'The weight of this hoodie is substantial. 500 GSM loopback cotton maintains an architectural drape wash after wash without sagging at the waist.',
  },
  {
    id: 'rev-2',
    author: 'Julian D.',
    rating: 5,
    product: 'Cyber-Spec Modular Jacket',
    size: 'Size XL · Stealth Black',
    quote:
      'Tested through a torrential downpour on my commute. Zero leakage, taped seams held completely, and the Fidlock hardware is quick to engage with gloves on.',
  },
  {
    id: 'rev-3',
    author: 'Ayesha K.',
    rating: 5,
    product: 'Sub-Zero Arctic Puffer',
    size: 'Size M · Bone White',
    quote:
      'The thermal baffle insulation keeps warm down to freezing conditions while remaining surprisingly light. The standing storm collar is cut perfectly.',
  },
  {
    id: 'rev-4',
    author: 'Marcus V.',
    rating: 5,
    product: 'Retro-Velocity Bomber',
    size: 'Size L · Vintage Olive',
    quote:
      'Heavyweight flight satin shell with the bright orange quilted interior. Heavy gauge YKK zippers feel indestructible.',
  },
];

export function ReviewsSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollBy = (offset: number) => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  return (
    <section
      id="reviews"
      className="w-full border-t border-black/10 bg-[#DEDBD2] px-4 py-20 text-[#15181B] sm:px-6 lg:px-8"
    >
      <div className="container mx-auto max-w-7xl">
        {/* Header (§7.6) */}
        <div className="mb-10 flex flex-col border-b border-black/10 pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="font-display text-3xl font-extrabold tracking-tight text-[#15181B] sm:text-4xl">
              Verified Reviews
            </h2>
            <div className="mt-2 flex items-center gap-2 font-mono text-xs text-[#8A8F95]">
              <span className="flex text-[#FF5A1F]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-[#FF5A1F]" />
                ))}
              </span>
              <span className="font-bold text-[#15181B]">4.92 / 5.0</span>
              <span>· 12,000+ verified deliveries</span>
            </div>
          </div>

          {/* Navigation Arrow Buttons */}
          <div className="mt-4 flex items-center gap-2 md:mt-0">
            <button
              onClick={() => scrollBy(-320)}
              className="flex h-9 w-9 items-center justify-center rounded-sm border border-black/15 bg-black/[0.04] text-[#15181B] transition-colors hover:bg-black/10"
              aria-label="Previous review"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => scrollBy(320)}
              className="flex h-9 w-9 items-center justify-center rounded-sm border border-black/15 bg-black/[0.04] text-[#15181B] transition-colors hover:bg-black/10"
              aria-label="Next review"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Horizontal Draggable Row of Review Cards §7.6 */}
        <div
          ref={containerRef}
          className="scrollbar-none flex gap-6 overflow-x-auto scroll-smooth pb-4"
        >
          {REVIEWS_DATA.map((rev) => (
            <motion.div
              key={rev.id}
              className="flex w-[320px] shrink-0 flex-col justify-between rounded-sm border border-black/10 bg-white/70 p-6 shadow-sm sm:w-[380px]"
            >
              <div>
                <div className="mb-3 flex items-center gap-1 text-[#FF5A1F]">
                  {[...Array(rev.rating)].map((_, idx) => (
                    <Star key={idx} className="h-3 w-3 fill-[#FF5A1F]" />
                  ))}
                </div>
                <p className="text-xs font-normal leading-relaxed text-[#15181B]">
                  &ldquo;{rev.quote}&rdquo;
                </p>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-black/5 pt-3 font-mono text-[11px]">
                <div>
                  <span className="font-bold text-[#15181B]">{rev.author}</span>
                  <div className="text-[#8A8F95]">{rev.size}</div>
                </div>
                <span className="text-[#8A8F95]">{rev.product}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

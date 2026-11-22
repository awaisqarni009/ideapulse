'use client';

import React from 'react';
import { Truck, ShieldCheck, RefreshCw, Star } from 'lucide-react';

const FEATURES = [
  {
    icon: Truck,
    title: 'Free Express Shipping',
    description: 'On all orders over $100 worldwide. Tracked delivery in 2–4 business days.',
    badge: 'Worldwide',
  },
  {
    icon: ShieldCheck,
    title: '500 GSM French Terry',
    description:
      'Double-knit 100% organic cotton. 1.8x denser than standard hoodies, zero shrinkage.',
    badge: 'Heavyweight',
  },
  {
    icon: RefreshCw,
    title: '30-Day Easy Returns',
    description: 'Hassle-free size exchanges and returns with prepaid return labels provided.',
    badge: 'Guaranteed',
  },
  {
    icon: Star,
    title: '4.92 / 5.0 Verified Rating',
    description: 'Over 12,000+ orders fulfilled with 5-star customer ratings globally.',
    badge: '12K+ Reviews',
  },
];

export function TrustFeatures() {
  return (
    <section className="relative z-20 border-y border-white/10 bg-[#0e1117] py-8 text-white">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {FEATURES.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="group flex items-start gap-4 rounded-xl border border-white/5 bg-white/[0.02] p-4 transition-all duration-200 hover:border-indigo-500/30 hover:bg-white/[0.04]"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 transition-colors group-hover:bg-indigo-500 group-hover:text-white">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-white">
                      {item.title}
                    </h3>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-slate-400">{item.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

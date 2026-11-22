'use client';

import React, { useState } from 'react';
import { Check, X, Shield, Sparkles, Droplets, Layers, ArrowRight } from 'lucide-react';

export function FabricComparison() {
  const [activeTab, setActiveTab] = useState<'gsm' | 'membrane'>('gsm');

  return (
    <section
      id="fabric-guide"
      className="relative w-full border-t border-white/10 bg-[#0B0F19] px-4 py-20 text-white sm:px-6 lg:px-8"
    >
      <div className="container mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/15 px-3.5 py-1 text-xs font-semibold tracking-wider text-indigo-300">
            <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
            <span>FABRIC ARCHITECTURE & CRAFTSMANSHIP</span>
          </div>
          <h2 className="mt-4 font-display text-3xl font-black uppercase tracking-tight text-white sm:text-4xl lg:text-5xl">
            Why Heavyweight Matters
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-300 sm:text-base">
            Most fast-fashion hoodies use lightweight 280 GSM fleece that loses its boxy shape after
            2 washes. We custom-mill dense 500 GSM organic cotton engineered to last decades.
          </p>

          {/* Tab Selector */}
          <div className="mt-8 inline-flex rounded-xl border border-white/10 bg-[#12161F] p-1.5">
            <button
              onClick={() => setActiveTab('gsm')}
              className={`flex items-center gap-2 rounded-lg px-5 py-2 text-xs font-bold transition-all ${
                activeTab === 'gsm'
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="h-4 w-4" />
              <span>500 GSM Cotton vs. Standard</span>
            </button>
            <button
              onClick={() => setActiveTab('membrane')}
              className={`flex items-center gap-2 rounded-lg px-5 py-2 text-xs font-bold transition-all ${
                activeTab === 'membrane'
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Droplets className="h-4 w-4" />
              <span>20,000 MM Waterproof Shell</span>
            </button>
          </div>
        </div>

        {/* Comparison Grid */}
        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Card 1: Fast Fashion Standard */}
          <div className="relative rounded-2xl border border-white/5 bg-[#12151C]/60 p-6 sm:p-8">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Ordinary Fast-Fashion
                </span>
                <h3 className="mt-1 font-display text-xl font-bold text-slate-300">
                  {activeTab === 'gsm' ? '280–320 GSM Lightweight' : 'Water-Resistant DWR Coating'}
                </h3>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-rose-500/30 bg-rose-500/10 text-rose-400">
                <X className="h-5 w-5" />
              </div>
            </div>

            <ul className="mt-6 space-y-4 text-xs text-slate-400">
              {activeTab === 'gsm' ? (
                <>
                  <li className="flex items-start gap-3">
                    <X className="h-4 w-4 shrink-0 text-rose-400" />
                    <span>
                      Thin polyester blend fleece that develops fuzz and pills after 3–5 cycles.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <X className="h-4 w-4 shrink-0 text-rose-400" />
                    <span>Limp hood that sags backwards without structure or neck coverage.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <X className="h-4 w-4 shrink-0 text-rose-400" />
                    <span>
                      High thermal shrinkage (shrinks up to 2 sizes when washed with warm water).
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <X className="h-4 w-4 shrink-0 text-rose-400" />
                    <span>Thin cuffs and waistband that warp and lose elasticity quickly.</span>
                  </li>
                </>
              ) : (
                <>
                  <li className="flex items-start gap-3">
                    <X className="h-4 w-4 shrink-0 text-rose-400" />
                    <span>
                      Surface spray-on coating that washes away in the rain after 2 months.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <X className="h-4 w-4 shrink-0 text-rose-400" />
                    <span>
                      Non-breathable plastic feel causing sweat buildup during mild activity.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <X className="h-4 w-4 shrink-0 text-rose-400" />
                    <span>Leaks through untaped seams under sustained downpours or snow.</span>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Card 2: PulseWear Heavyweight Standard */}
          <div className="relative rounded-2xl border border-indigo-500/40 bg-gradient-to-b from-[#161B26] to-[#12161F] p-6 shadow-2xl shadow-indigo-500/10 sm:p-8">
            {/* Top highlight glow */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-400 to-transparent" />

            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-400/30 bg-indigo-500/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-300">
                  <Shield className="h-3 w-3" />
                  PulseWear Specification
                </span>
                <h3 className="mt-1 font-display text-xl font-bold text-white">
                  {activeTab === 'gsm' ? '500 GSM Organic Loopback' : '20,000 MM 3-Layer Membrane'}
                </h3>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                <Check className="h-5 w-5" />
              </div>
            </div>

            <ul className="mt-6 space-y-4 text-xs text-slate-200">
              {activeTab === 'gsm' ? (
                <>
                  <li className="flex items-start gap-3">
                    <Check className="h-4 w-4 shrink-0 text-emerald-400" />
                    <span>
                      <strong className="text-white">1.8x denser French terry</strong> — custom
                      double-faced yarn knitted for substantial thermal insulation.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-4 w-4 shrink-0 text-emerald-400" />
                    <span>
                      <strong className="text-white">Double-layer structured hood</strong> — stands
                      upright naturally with a signature clean architectural drape.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-4 w-4 shrink-0 text-emerald-400" />
                    <span>
                      <strong className="text-white">Pre-shrunk organic cotton</strong> — zero
                      shrinkage guarantee, retains fit over 10+ years of washing.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-4 w-4 shrink-0 text-emerald-400" />
                    <span>
                      <strong className="text-white">Reinforced 2x2 ribbing</strong> — heavy stretch
                      cuffs and hem with flatlock seam strength.
                    </span>
                  </li>
                </>
              ) : (
                <>
                  <li className="flex items-start gap-3">
                    <Check className="h-4 w-4 shrink-0 text-emerald-400" />
                    <span>
                      <strong className="text-white">20,000 mm Hydrostatic Head</strong> —
                      withstands torrential storm downpours and mountain blizzards.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-4 w-4 shrink-0 text-emerald-400" />
                    <span>
                      <strong className="text-white">Microporous breathable membrane</strong> —
                      allows perspiration vapor to escape while blocking liquid water.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-4 w-4 shrink-0 text-emerald-400" />
                    <span>
                      <strong className="text-white">100% Fully taped seams & YKK AquaGuard</strong>{' '}
                      water-sealed zippers throughout.
                    </span>
                  </li>
                </>
              )}
            </ul>

            <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-4">
              <span className="text-xs text-slate-400">Available across all Drop 26 items</span>
              <button
                onClick={() => {
                  const cat = document.getElementById('catalog');
                  cat?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-400 hover:text-indigo-300"
              >
                <span>View Products</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

'use client';

import React, { useRef, useState, useEffect } from 'react';
import { ArrowRight, ChevronRight, Sparkles, Shield, Flame } from 'lucide-react';

interface Hero3DProps {
  onSelectCategory: (category: 'hoodie' | 'jacket' | 'all') => void;
}

export function Hero3D({ onSelectCategory }: Hero3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  // Smooth mouse movement tracking for 3D parallax effect
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2; // -1 to 1
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2; // -1 to 1
    setMousePos({ x, y });
  };

  const handlePointerLeave = () => {
    setIsHovered(false);
    setMousePos({ x: 0, y: 0 });
  };

  const handlePointerEnter = () => {
    setIsHovered(true);
  };

  return (
    <section
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      className="relative flex min-h-[85vh] w-full select-none items-center justify-center overflow-hidden border-b border-white/10 bg-[#0A0C0E] lg:h-[calc(100vh-80px)]"
      style={{
        perspective: '1400px',
      }}
    >
      {/* 1. Deep Atmospheric Lighting & Subtle Specular Light Beams */}
      <div className="pointer-events-none absolute inset-0 z-0">
        {/* Directional streak/caustic light ray */}
        <div
          className="absolute -left-32 -top-32 h-[800px] w-[800px] rounded-full opacity-30 blur-[130px] transition-transform duration-700 ease-out"
          style={{
            background:
              'radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, rgba(34, 211, 238, 0.08) 35%, transparent 70%)',
            transform: `translate3d(${mousePos.x * 25}px, ${mousePos.y * 20}px, 0)`,
          }}
        />

        {/* Ambient bottom-right vignette glow */}
        <div className="absolute -bottom-40 -right-40 h-[600px] w-[600px] rounded-full bg-[radial-gradient(circle,rgba(255,90,31,0.08)_0%,transparent_70%)] blur-[100px]" />

        {/* Light beam diagonal streak simulating high-end studio lighting */}
        <div
          className="pointer-events-none absolute -left-40 -top-20 h-[1200px] w-[600px] rotate-[35deg] opacity-20 blur-3xl"
          style={{
            background:
              'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(99,102,241,0.06) 40%, transparent 80%)',
          }}
        />
      </div>

      {/* 2. Main 3D Stage Container */}
      <div className="container relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-between px-4 py-4 sm:px-6 sm:py-5 lg:px-8">
        {/* Top Empty Space to allow clearance for header */}
        <div className="h-2 sm:h-4" />

        {/* 3. Center Sandwich Layout: Giant Typography + 3D Model */}
        <div className="relative my-auto flex min-h-[440px] flex-1 items-center justify-center sm:min-h-[500px] lg:min-h-[560px]">
          {/* LAYER A: Background Brand Typography (Positioned BEHIND Model in 3D Z-space) */}
          <div
            className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center transition-transform duration-500 ease-out"
            style={{
              transform: `translate3d(${-mousePos.x * 24}px, ${-mousePos.y * 16}px, -40px) rotateX(${-mousePos.y * 4}deg) rotateY(${mousePos.x * 4}deg)`,
            }}
          >
            {/* Top Row: PULSE (Left) + WEAR (Right) */}
            <div className="flex w-full max-w-6xl items-center justify-between px-2 sm:px-6 lg:px-12">
              <div
                className="relative transition-transform duration-300"
                style={{
                  transform: `translate3d(${-mousePos.x * 10}px, 0, 10px)`,
                }}
              >
                <span className="font-display text-5xl font-black uppercase tracking-tight text-white drop-shadow-[0_15px_35px_rgba(0,0,0,0.95)] sm:text-7xl lg:text-8xl xl:text-9xl">
                  PULSE
                </span>
              </div>

              <div
                className="relative transition-transform duration-300"
                style={{
                  transform: `translate3d(${mousePos.x * 8}px, 0, 10px)`,
                }}
              >
                <span
                  className="font-display text-5xl font-black uppercase tracking-tight sm:text-7xl lg:text-8xl xl:text-9xl"
                  style={{
                    background: 'linear-gradient(180deg, #FFFFFF 0%, #A5B4FC 50%, #6366F1 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    filter: 'drop-shadow(0 10px 25px rgba(0,0,0,0.85))',
                  }}
                >
                  WEAR
                </span>
              </div>
            </div>

            {/* Bottom Row: DROP (Left) + 2026 (Right) */}
            <div className="mt-3 flex w-full max-w-6xl items-center justify-between px-2 sm:mt-5 sm:px-6 lg:px-12">
              <div
                className="relative transition-transform duration-300"
                style={{
                  transform: `translate3d(${-mousePos.x * 8}px, 0, 10px)`,
                }}
              >
                <span className="font-display text-5xl font-black uppercase tracking-tight text-slate-400/60 drop-shadow-[0_15px_35px_rgba(0,0,0,0.95)] sm:text-7xl lg:text-8xl xl:text-9xl">
                  DROP
                </span>
              </div>

              <div
                className="relative transition-transform duration-300"
                style={{
                  transform: `translate3d(${mousePos.x * 10}px, 0, 10px)`,
                }}
              >
                <span className="font-display text-5xl font-black uppercase tracking-tight text-white/90 drop-shadow-[0_15px_35px_rgba(0,0,0,0.95)] sm:text-7xl lg:text-8xl xl:text-9xl">
                  2026
                </span>
              </div>
            </div>
          </div>

          {/* LAYER B: The 3D Streetwear Model (Positioned IN FRONT of text, with parallax tilt) */}
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 z-20 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center transition-transform duration-300 ease-out"
            style={{
              transform: `translate3d(calc(-50% + ${mousePos.x * 18}px), calc(-50% + ${mousePos.y * 12}px), 40px) rotateY(${mousePos.x * 5}deg) rotateX(${-mousePos.y * 5}deg)`,
            }}
          >
            {/* Model Cutout Image - Pure Transparent PNG */}
            <div className="relative h-[440px] w-auto max-w-[90vw] sm:h-[520px] lg:h-[580px] xl:h-[620px]">
              <img
                src="/images/streetwear-hero-model.png"
                alt="PULSEWEAR 3D Streetwear Model"
                className="h-full w-auto object-contain drop-shadow-[0_25px_50px_rgba(0,0,0,0.9)]"
              />

              {/* Ambient Specular Highlight following cursor */}
              <div
                className="pointer-events-none absolute inset-0 opacity-25 mix-blend-overlay transition-opacity duration-300"
                style={{
                  background: `radial-gradient(circle at ${50 + mousePos.x * 30}% ${40 + mousePos.y * 30}%, rgba(99,102,241,0.3) 0%, transparent 60%)`,
                }}
              />
            </div>
          </div>
        </div>

        {/* 4. Bottom HUD Bar: Left Typography & CTAs + Right Tiered Category Quick-Nav */}
        <div className="relative z-30 flex flex-col justify-between gap-8 pt-4 sm:flex-row sm:items-end">
          {/* Bottom-Left: Storefront Value Proposition & Engaging CTAs */}
          <div className="flex max-w-xl flex-col">
            {/* Spec eyebrow badge */}
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/15 px-3 py-1 font-sans text-xs font-semibold tracking-wider text-indigo-300">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400" />
                DROP 26 · 500 GSM HEAVYWEIGHT
              </span>
            </div>

            <h1 className="mt-2.5 font-display text-3xl font-black uppercase tracking-tight text-white sm:text-4xl lg:text-5xl">
              CRAFTED FOR{' '}
              <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
                ENDURANCE
              </span>
            </h1>

            <p className="mt-2 text-xs leading-relaxed text-slate-300 sm:text-sm">
              Dense 500 GSM loopback French terry and 20,000 mm waterproof tactical shells.
              Engineered for supreme cold-weather warmth, structural drape, and zero shrinkage.
            </p>

            {/* Clear, Engaging Action Buttons */}
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                onClick={() => {
                  const catalog = document.getElementById('catalog');
                  catalog?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="group inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-indigo-600/30 transition-all hover:brightness-110 active:scale-[0.98]"
              >
                <span>Shop The Collection</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
              </button>

              <button
                onClick={() => {
                  const guide = document.getElementById('fabric-guide');
                  guide?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.05] px-4 py-2.5 text-xs font-semibold text-slate-300 backdrop-blur-md transition-all hover:border-white/20 hover:bg-white/10 hover:text-white active:scale-[0.98]"
              >
                <span>Why 500 GSM?</span>
              </button>
            </div>
          </div>

          {/* Bottom-Right: Tiered Category Quick-Nav (Luxury Obsidian Glassmorphism) */}
          <div className="flex w-full flex-col overflow-hidden rounded-xl border border-white/10 bg-[#12161F]/90 shadow-2xl backdrop-blur-xl sm:w-72 lg:w-80">
            {/* Tier 1: HOODIES */}
            <button
              onClick={() => onSelectCategory('hoodie')}
              className="group flex items-center justify-between border-b border-white/10 px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-white transition-all duration-200 hover:bg-indigo-600/15 hover:pl-6 active:scale-[0.99]"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-sm font-black tracking-tight text-white">HOODIES</span>
                <span className="rounded-md border border-indigo-500/30 bg-indigo-500/15 px-2 py-0.5 font-sans text-[10px] font-semibold text-indigo-300">
                  500 GSM
                </span>
              </div>
              <div className="flex items-center -space-x-1 text-indigo-400 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-indigo-300">
                <ChevronRight className="h-4 w-4 stroke-[2.5]" />
                <ChevronRight className="h-4 w-4 stroke-[2.5]" />
              </div>
            </button>

            {/* Tier 2: JACKETS */}
            <button
              onClick={() => onSelectCategory('jacket')}
              className="group flex items-center justify-between border-b border-white/10 px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-white transition-all duration-200 hover:bg-cyan-600/15 hover:pl-6 active:scale-[0.99]"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-sm font-black tracking-tight text-white">JACKETS</span>
                <span className="rounded-md border border-cyan-500/30 bg-cyan-500/15 px-2 py-0.5 font-sans text-[10px] font-semibold text-cyan-300">
                  20,000 MM
                </span>
              </div>
              <div className="flex items-center -space-x-1 text-cyan-400 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-cyan-300">
                <ChevronRight className="h-4 w-4 stroke-[2.5]" />
                <ChevronRight className="h-4 w-4 stroke-[2.5]" />
              </div>
            </button>

            {/* Tier 3: ALL PRODUCTS */}
            <button
              onClick={() => onSelectCategory('all')}
              className="group flex items-center justify-between bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-indigo-500/20 transition-all duration-200 hover:pl-6 hover:brightness-110 active:scale-[0.99]"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-sm font-black tracking-tight text-white">ALL PRODUCTS</span>
                <span className="rounded-md border border-white/30 bg-white/20 px-2 py-0.5 font-sans text-[10px] font-bold text-white">
                  DROP 26
                </span>
              </div>
              <div className="flex items-center -space-x-1 text-white transition-transform duration-200 group-hover:translate-x-1">
                <ChevronRight className="h-4 w-4 stroke-[3]" />
                <ChevronRight className="h-4 w-4 stroke-[3]" />
              </div>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

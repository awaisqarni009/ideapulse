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
      className="relative flex min-h-[92vh] w-full select-none items-center justify-center overflow-hidden border-b border-white/10 bg-[#0A0C0E]"
      style={{
        perspective: '1400px',
      }}
    >
      {/* 1. Deep Atmospheric Lighting & Angular Light Beams from Top-Left */}
      <div className="pointer-events-none absolute inset-0 z-0">
        {/* Directional streak/caustic light ray */}
        <div
          className="absolute -left-32 -top-32 h-[800px] w-[800px] rounded-full opacity-30 blur-[130px] transition-transform duration-700 ease-out"
          style={{
            background:
              'radial-gradient(circle, rgba(212, 255, 0, 0.18) 0%, rgba(255, 255, 255, 0.08) 35%, transparent 70%)',
            transform: `translate3d(${mousePos.x * 25}px, ${mousePos.y * 20}px, 0)`,
          }}
        />

        {/* Ambient bottom-right vignette glow */}
        <div className="absolute -bottom-40 -right-40 h-[600px] w-[600px] rounded-full bg-[radial-gradient(circle,rgba(255,90,31,0.08)_0%,transparent_70%)] blur-[100px]" />

        {/* Light beam diagonal streak simulating the top-left shadow cast in reference */}
        <div
          className="pointer-events-none absolute -left-40 -top-20 h-[1200px] w-[600px] rotate-[35deg] opacity-25 blur-3xl"
          style={{
            background:
              'linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(212,255,0,0.05) 40%, transparent 80%)',
          }}
        />
      </div>

      {/* 2. Main 3D Stage Container */}
      <div className="container relative z-10 mx-auto flex h-full min-h-[820px] max-w-7xl flex-col justify-between px-4 py-12 sm:px-6 lg:px-8">
        {/* Top Empty Space to allow clearance for header */}
        <div className="h-6 sm:h-10" />

        {/* 3. Center Sandwich Layout: Giant Typography + 3D Model */}
        <div className="relative my-auto flex flex-1 items-center justify-center">
          {/* LAYER A: Background Giant Typography (Positioned BEHIND the Model in 3D Z-space) */}
          <div
            className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center transition-transform duration-500 ease-out"
            style={{
              transform: `translate3d(${-mousePos.x * 24}px, ${-mousePos.y * 16}px, -40px) rotateX(${-mousePos.y * 4}deg) rotateY(${mousePos.x * 4}deg)`,
            }}
          >
            {/* Top Row: [MAKE] (Neon Lime Box) + YOUR (Metallic Embossed) */}
            <div className="flex w-full max-w-5xl items-center justify-center gap-4 sm:gap-8">
              {/* Neon Lime Box: MAKE */}
              <div
                className="rounded-sm bg-[#D4FF00] px-4 py-1.5 shadow-[0_0_50px_rgba(212,255,0,0.35)] transition-transform duration-300 sm:px-8 sm:py-3"
                style={{
                  transform: `translate3d(${-mousePos.x * 10}px, 0, 10px)`,
                }}
              >
                <span className="font-display text-4xl font-black uppercase tracking-tighter text-black sm:text-7xl lg:text-8xl">
                  MAKE
                </span>
              </div>

              {/* Metallic Embossed: YOUR */}
              <div className="relative">
                <span
                  className="font-display text-5xl font-black uppercase tracking-tight sm:text-8xl lg:text-9xl"
                  style={{
                    background: 'linear-gradient(180deg, #FFFFFF 0%, #A0AEC0 60%, #4A5568 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textShadow: '0 10px 30px rgba(0,0,0,0.8)',
                  }}
                >
                  YOUR
                </span>
              </div>
            </div>

            {/* Bottom Row: OWN (Solid White 3D) + [OUTFIT] (Neon Lime Box) */}
            <div className="mt-2 flex w-full max-w-5xl items-center justify-center gap-4 sm:mt-4 sm:gap-8">
              {/* Solid White 3D: OWN */}
              <div className="relative">
                <span className="font-display text-5xl font-black uppercase tracking-tight text-white drop-shadow-[0_15px_35px_rgba(0,0,0,0.9)] sm:text-8xl lg:text-9xl">
                  OWN
                </span>
              </div>

              {/* Neon Lime Box: OUTFIT */}
              <div
                className="rounded-sm bg-[#D4FF00] px-4 py-1.5 shadow-[0_0_50px_rgba(212,255,0,0.35)] transition-transform duration-300 sm:px-8 sm:py-3"
                style={{
                  transform: `translate3d(${mousePos.x * 10}px, 0, 10px)`,
                }}
              >
                <span className="font-display text-4xl font-black uppercase tracking-tighter text-black sm:text-7xl lg:text-8xl">
                  OUTFIT
                </span>
              </div>
            </div>
          </div>

          {/* LAYER B: The 3D Streetwear Model (Positioned IN FRONT of text, with parallax tilt) */}
          <div
            className="pointer-events-none relative z-20 flex w-full max-w-lg items-center justify-center transition-transform duration-300 ease-out"
            style={{
              transform: `translate3d(${mousePos.x * 20}px, ${mousePos.y * 14}px, 60px) rotateY(${mousePos.x * 6}deg) rotateX(${-mousePos.y * 6}deg)`,
            }}
          >
            {/* Model Cutout Image */}
            <div className="relative h-[520px] w-auto max-w-full sm:h-[640px] lg:h-[720px]">
              <img
                src="/images/streetwear-hero-model.jpg"
                alt="PULSEWEAR 3D Streetwear Model"
                className="h-full w-auto object-contain mix-blend-screen brightness-110 contrast-125 drop-shadow-[0_20px_50px_rgba(0,0,0,0.9)] filter"
                style={{
                  maskImage: 'radial-gradient(ellipse at 50% 50%, black 80%, transparent 100%)',
                  WebkitMaskImage:
                    'radial-gradient(ellipse at 50% 50%, black 80%, transparent 100%)',
                }}
              />

              {/* Ambient Edge Specular Glow on the Model */}
              <div
                className="pointer-events-none absolute inset-0 opacity-40 mix-blend-overlay transition-opacity duration-300"
                style={{
                  background: `radial-gradient(circle at ${50 + mousePos.x * 30}% ${40 + mousePos.y * 30}%, rgba(212,255,0,0.4) 0%, transparent 60%)`,
                }}
              />
            </div>
          </div>
        </div>

        {/* 4. Bottom HUD Bar: Left Typography + Right Tiered Category Quick-Nav */}
        <div className="relative z-30 flex flex-col justify-between gap-8 pt-6 sm:flex-row sm:items-end">
          {/* Bottom-Left: "STYLE YOUR LIFE" / Brand Identity */}
          <div className="flex flex-col">
            {/* Neon Bar Accent */}
            <div className="mb-3 h-1.5 w-14 rounded-none bg-[#D4FF00] shadow-[0_0_15px_rgba(212,255,0,0.6)]" />

            <div className="flex flex-col font-display leading-none">
              <span className="text-3xl font-black uppercase tracking-tight text-white sm:text-4xl lg:text-5xl">
                STYLE
              </span>
              <span
                className="my-1 text-3xl font-black uppercase tracking-tight sm:text-4xl lg:text-5xl"
                style={{
                  WebkitTextStroke: '1.5px #FFFFFF',
                  color: 'transparent',
                }}
              >
                YOUR
              </span>
              <span className="text-3xl font-black uppercase tracking-tight text-white sm:text-4xl lg:text-5xl">
                LIFE
              </span>
            </div>

            {/* Sub-label */}
            <div className="mt-3 flex items-center gap-2 font-mono text-[11px] text-[#A0AEC0]">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#D4FF00]" />
              <span>500 GSM LOOPBACK COTTON // 20K MM MEMBRANE</span>
            </div>
          </div>

          {/* Bottom-Right: Tiered Category Quick-Nav (Exact from Reference) */}
          <div className="flex w-full flex-col shadow-2xl sm:w-72 lg:w-80">
            {/* Tier 1: WOMENS / HOODIES */}
            <button
              onClick={() => onSelectCategory('hoodie')}
              className="group flex items-center justify-between border-b border-black/15 bg-[#D4FF00] px-6 py-3.5 text-xs font-black uppercase tracking-wider text-black transition-all duration-200 hover:pl-8 hover:brightness-105 active:scale-[0.99]"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-black">HOODIES</span>
                <span className="rounded bg-black/15 px-1.5 py-0.5 font-mono text-[9px] font-bold">
                  500 GSM
                </span>
              </div>
              <ChevronRight className="h-4 w-4 stroke-[3] transition-transform duration-200 group-hover:translate-x-1" />
            </button>

            {/* Tier 2: MENS / JACKETS */}
            <button
              onClick={() => onSelectCategory('jacket')}
              className="group flex items-center justify-between border-b border-black/15 bg-[#D4FF00] px-6 py-3.5 text-xs font-black uppercase tracking-wider text-black transition-all duration-200 hover:pl-8 hover:brightness-105 active:scale-[0.99]"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-black">JACKETS</span>
                <span className="rounded bg-black/15 px-1.5 py-0.5 font-mono text-[9px] font-bold">
                  20,000 MM
                </span>
              </div>
              <ChevronRight className="h-4 w-4 stroke-[3] transition-transform duration-200 group-hover:translate-x-1" />
            </button>

            {/* Tier 3: ALL / NEW DROPS */}
            <button
              onClick={() => onSelectCategory('all')}
              className="group flex items-center justify-between bg-[#D4FF00] px-6 py-3.5 text-xs font-black uppercase tracking-wider text-black transition-all duration-200 hover:pl-8 hover:brightness-105 active:scale-[0.99]"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-black">ALL PRODUCTS</span>
                <span className="rounded bg-black/15 px-1.5 py-0.5 font-mono text-[9px] font-bold">
                  DROP 26
                </span>
              </div>
              <ChevronRight className="h-4 w-4 stroke-[3] transition-transform duration-200 group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

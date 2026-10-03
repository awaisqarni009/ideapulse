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
      <div className="container relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-between px-4 py-4 sm:px-6 sm:py-5 lg:px-8">
        {/* Top Empty Space to allow clearance for header */}
        <div className="h-2 sm:h-4" />

        {/* 3. Center Sandwich Layout: Giant Typography + 3D Model */}
        <div className="relative my-auto flex min-h-[440px] flex-1 items-center justify-center sm:min-h-[500px] lg:min-h-[560px]">
          {/* LAYER A: Background Giant Typography (Positioned BEHIND the Model in 3D Z-space) */}
          <div
            className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center transition-transform duration-500 ease-out"
            style={{
              transform: `translate3d(${-mousePos.x * 24}px, ${-mousePos.y * 16}px, -40px) rotateX(${-mousePos.y * 4}deg) rotateY(${mousePos.x * 4}deg)`,
            }}
          >
            {/* Top Row: [MAKE] (Neon Lime Box on Left) + YOUR (Metallic Embossed on Right) */}
            <div className="flex w-full max-w-6xl items-center justify-between px-2 sm:px-6 lg:px-12">
              {/* Neon Lime Box: MAKE */}
              <div
                className="rounded-none bg-[#D4FF00] px-4 py-1.5 shadow-[0_0_45px_rgba(212,255,0,0.35)] transition-transform duration-300 sm:px-8 sm:py-3"
                style={{
                  transform: `translate3d(${-mousePos.x * 10}px, 0, 10px)`,
                }}
              >
                <span className="font-display text-5xl font-black uppercase tracking-tighter text-black sm:text-7xl lg:text-8xl xl:text-9xl">
                  MAKE
                </span>
              </div>

              {/* Metallic Embossed: YOUR */}
              <div
                className="relative transition-transform duration-300"
                style={{
                  transform: `translate3d(${mousePos.x * 8}px, 0, 10px)`,
                }}
              >
                <span
                  className="font-display text-5xl font-black uppercase tracking-tight sm:text-7xl lg:text-8xl xl:text-9xl"
                  style={{
                    background: 'linear-gradient(180deg, #FFFFFF 0%, #CBD5E1 50%, #64748B 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    filter: 'drop-shadow(0 10px 25px rgba(0,0,0,0.85))',
                  }}
                >
                  YOUR
                </span>
              </div>
            </div>

            {/* Bottom Row: OWN (Solid White 3D on Left) + [OUTFIT] (Neon Lime Box on Right) */}
            <div className="mt-3 flex w-full max-w-6xl items-center justify-between px-2 sm:mt-5 sm:px-6 lg:px-12">
              {/* Solid White 3D: OWN */}
              <div
                className="relative transition-transform duration-300"
                style={{
                  transform: `translate3d(${-mousePos.x * 8}px, 0, 10px)`,
                }}
              >
                <span className="font-display text-5xl font-black uppercase tracking-tight text-white drop-shadow-[0_15px_35px_rgba(0,0,0,0.95)] sm:text-7xl lg:text-8xl xl:text-9xl">
                  OWN
                </span>
              </div>

              {/* Neon Lime Box: OUTFIT */}
              <div
                className="rounded-none bg-[#D4FF00] px-4 py-1.5 shadow-[0_0_45px_rgba(212,255,0,0.35)] transition-transform duration-300 sm:px-8 sm:py-3"
                style={{
                  transform: `translate3d(${mousePos.x * 10}px, 0, 10px)`,
                }}
              >
                <span className="font-display text-5xl font-black uppercase tracking-tighter text-black sm:text-7xl lg:text-8xl xl:text-9xl">
                  OUTFIT
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
                className="pointer-events-none absolute inset-0 opacity-20 mix-blend-overlay transition-opacity duration-300"
                style={{
                  background: `radial-gradient(circle at ${50 + mousePos.x * 30}% ${40 + mousePos.y * 30}%, rgba(212,255,0,0.3) 0%, transparent 60%)`,
                }}
              />
            </div>
          </div>
        </div>

        {/* 4. Bottom HUD Bar: Left Typography + Right Tiered Category Quick-Nav */}
        <div className="relative z-30 flex flex-col justify-between gap-8 pt-4 sm:flex-row sm:items-end">
          {/* Bottom-Left: "STYLE YOUR LIFE" / Brand Identity */}
          <div className="flex flex-col">
            {/* Neon Bar Accent with angled tip matching reference */}
            <div
              className="mb-3 h-1.5 w-16 bg-[#D4FF00] shadow-[0_0_15px_rgba(212,255,0,0.6)]"
              style={{
                clipPath: 'polygon(0 0, 100% 0, 85% 100%, 0 100%)',
              }}
            />

            <div className="flex flex-col font-display leading-[0.95]">
              <span className="text-3xl font-black uppercase tracking-tight text-white sm:text-4xl lg:text-5xl">
                STYLE
              </span>
              <span
                className="my-0.5 text-3xl font-black uppercase tracking-tight sm:text-4xl lg:text-5xl"
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
            {/* Tier 1: HOODIES */}
            <button
              onClick={() => onSelectCategory('hoodie')}
              className="group flex items-center justify-between border-b border-black/20 bg-[#D4FF00] px-6 py-3.5 text-xs font-black uppercase tracking-wider text-black transition-all duration-200 hover:pl-8 hover:brightness-105 active:scale-[0.99]"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-black tracking-tight">HOODIES</span>
                <span className="rounded bg-black/15 px-1.5 py-0.5 font-mono text-[9px] font-bold">
                  500 GSM
                </span>
              </div>
              <div className="flex items-center -space-x-1 transition-transform duration-200 group-hover:translate-x-1">
                <ChevronRight className="h-4 w-4 stroke-[3]" />
                <ChevronRight className="h-4 w-4 stroke-[3]" />
              </div>
            </button>

            {/* Tier 2: JACKETS */}
            <button
              onClick={() => onSelectCategory('jacket')}
              className="group flex items-center justify-between border-b border-black/20 bg-[#D4FF00] px-6 py-3.5 text-xs font-black uppercase tracking-wider text-black transition-all duration-200 hover:pl-8 hover:brightness-105 active:scale-[0.99]"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-black tracking-tight">JACKETS</span>
                <span className="rounded bg-black/15 px-1.5 py-0.5 font-mono text-[9px] font-bold">
                  20,000 MM
                </span>
              </div>
              <div className="flex items-center -space-x-1 transition-transform duration-200 group-hover:translate-x-1">
                <ChevronRight className="h-4 w-4 stroke-[3]" />
                <ChevronRight className="h-4 w-4 stroke-[3]" />
              </div>
            </button>

            {/* Tier 3: ALL PRODUCTS */}
            <button
              onClick={() => onSelectCategory('all')}
              className="group flex items-center justify-between bg-[#D4FF00] px-6 py-3.5 text-xs font-black uppercase tracking-wider text-black transition-all duration-200 hover:pl-8 hover:brightness-105 active:scale-[0.99]"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-black tracking-tight">ALL PRODUCTS</span>
                <span className="rounded bg-black/15 px-1.5 py-0.5 font-mono text-[9px] font-bold">
                  DROP 26
                </span>
              </div>
              <div className="flex items-center -space-x-1 transition-transform duration-200 group-hover:translate-x-1">
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

'use client';

import React, { useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import {
  Shield,
  Droplets,
  Wind,
  Wrench,
  Layers,
  Sparkles,
  Maximize2,
  CheckCircle2,
  ChevronRight,
  Flame,
} from 'lucide-react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function ShellStory() {
  const containerRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);

  // Active layer state: 1 (Outer), 2 (Membrane), 3 (Lining), or 'exploded'
  const [activeLayer, setActiveLayer] = useState<1 | 2 | 3 | 'exploded'>('exploded');
  const [hydrostaticValue, setHydrostaticValue] = useState(20000);
  const [isCounted, setIsCounted] = useState(false);

  // Smooth scroll sync with ScrollTrigger
  useGSAP(
    () => {
      const container = containerRef.current;
      if (!container) return;

      const mm = gsap.matchMedia();

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        // ScrollTrigger scrubbing across the scroll track
        ScrollTrigger.create({
          trigger: container,
          start: 'top top+=80',
          end: 'bottom bottom',
          scrub: 0.5,
          onUpdate: (self) => {
            const progress = self.progress;

            // Map progress to steps if user isn't overriding with manual clicks
            if (progress < 0.32) {
              setActiveLayer(1);
            } else if (progress < 0.68) {
              setActiveLayer(2);
            } else {
              setActiveLayer(3);
            }
          },
        });

        // Trigger hydrostatic count-up when reaching membrane
        ScrollTrigger.create({
          trigger: container,
          start: 'top top+=20%',
          once: true,
          onEnter: () => {
            if (!isCounted) {
              setIsCounted(true);
              const countObj = { val: 0 };
              gsap.to(countObj, {
                val: 20000,
                duration: 1.6,
                ease: 'power3.out',
                onUpdate: () => {
                  setHydrostaticValue(Math.round(countObj.val));
                },
              });
            }
          },
        });
      });
    },
    { scope: containerRef },
  );

  const handleSelectLayer = (layer: 1 | 2 | 3 | 'exploded') => {
    setActiveLayer(layer);
    if (layer === 2 || layer === 'exploded') {
      const countObj = { val: 0 };
      gsap.to(countObj, {
        val: 20000,
        duration: 1.2,
        ease: 'power3.out',
        onUpdate: () => {
          setHydrostaticValue(Math.round(countObj.val));
        },
      });
    }
  };

  return (
    <section className="relative w-full border-t border-white/10 bg-[#15181B] text-[#F2F5F7]">
      {/* Scroll track container for smooth progressive scrubbing */}
      <div ref={containerRef} className="relative min-h-[180vh] w-full lg:min-h-[240vh]">
        {/* Sticky stage: Always stays in viewport without jerky hard pins */}
        <div
          ref={stickyRef}
          className="sticky top-14 z-20 flex min-h-[calc(100vh-3.5rem)] flex-col justify-center px-4 py-6 sm:px-6 lg:px-8"
        >
          <div className="container mx-auto max-w-7xl">
            {/* Section Header */}
            <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end lg:mb-12">
              <div className="max-w-2xl">
                <div className="mb-2 flex items-center gap-2">
                  <span className="flex h-2 w-2 rounded-full bg-[#FF5A1F]" />
                  <span className="font-mono text-xs uppercase tracking-widest text-[#FF5A1F]">
                    Material Lab // Three-Tier Architecture
                  </span>
                </div>
                <h2 className="font-display text-3xl font-extrabold uppercase tracking-tight text-[#F2F5F7] sm:text-4xl lg:text-5xl">
                  Built heavy. Built to keep weather out.
                </h2>
                <p className="mt-3 text-xs leading-relaxed text-[#8A8F95] sm:text-sm">
                  Every storm shell is constructed as an architectural three-tier membrane
                  calibrated to resist torrential downpours while releasing interior heat during
                  active movement.
                </p>
              </div>

              {/* Interactive Layer Mode Switcher */}
              <div className="flex flex-wrap items-center gap-1.5 rounded-sm border border-white/10 bg-[#1F2327] p-1.5 font-mono text-[11px]">
                <button
                  onClick={() => handleSelectLayer('exploded')}
                  className={`flex items-center gap-1.5 rounded-sm px-2.5 py-1.5 font-bold transition-all ${
                    activeLayer === 'exploded'
                      ? 'bg-[#FF5A1F] text-white shadow-sm'
                      : 'text-[#8A8F95] hover:text-white'
                  }`}
                >
                  <Layers className="h-3.5 w-3.5" />
                  <span>Exploded 3-Ply</span>
                </button>
                <button
                  onClick={() => handleSelectLayer(1)}
                  className={`rounded-sm px-2.5 py-1.5 font-bold transition-all ${
                    activeLayer === 1
                      ? 'bg-[#FF5A1F] text-white shadow-sm'
                      : 'text-[#8A8F95] hover:text-white'
                  }`}
                >
                  01 Face
                </button>
                <button
                  onClick={() => handleSelectLayer(2)}
                  className={`rounded-sm px-2.5 py-1.5 font-bold transition-all ${
                    activeLayer === 2
                      ? 'bg-[#FF5A1F] text-white shadow-sm'
                      : 'text-[#8A8F95] hover:text-white'
                  }`}
                >
                  02 Membrane
                </button>
                <button
                  onClick={() => handleSelectLayer(3)}
                  className={`rounded-sm px-2.5 py-1.5 font-bold transition-all ${
                    activeLayer === 3
                      ? 'bg-[#FF5A1F] text-white shadow-sm'
                      : 'text-[#8A8F95] hover:text-white'
                  }`}
                >
                  03 Lining
                </button>
              </div>
            </div>

            {/* Main Stage: Two-Column Interactive Exploded View */}
            <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-12">
              {/* Left Column: Interactive Step Cards */}
              <div className="space-y-4 lg:col-span-5">
                {/* Step 01 */}
                <div
                  onClick={() => handleSelectLayer(1)}
                  className={`cursor-pointer rounded-sm border p-5 transition-all duration-300 ${
                    activeLayer === 1 || activeLayer === 'exploded'
                      ? 'border-[#FF5A1F] bg-[#1F2327] shadow-lg shadow-[#FF5A1F]/10'
                      : 'border-white/5 bg-[#15181B]/50 opacity-40 hover:border-white/20 hover:opacity-80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`font-mono text-xs uppercase tracking-widest ${
                        activeLayer === 1 ? 'font-bold text-[#FF5A1F]' : 'text-[#8A8F95]'
                      }`}
                    >
                      01 // Outer Face
                    </span>
                    <span className="rounded-sm bg-white/10 px-2 py-0.5 font-mono text-[10px] text-white">
                      DWR 20K
                    </span>
                  </div>
                  <h3 className="mt-1.5 font-display text-lg font-bold text-white sm:text-xl">
                    DWR-Treated Cordura Ripstop
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-[#8A8F95]">
                    Fluorocarbon-free water-repellent barrier. High-tensile yarn prevents abrasions
                    and causes torrential downpours to bead up and roll off instantly.
                  </p>
                </div>

                {/* Step 02 */}
                <div
                  onClick={() => handleSelectLayer(2)}
                  className={`cursor-pointer rounded-sm border p-5 transition-all duration-300 ${
                    activeLayer === 2
                      ? 'border-[#FF5A1F] bg-[#1F2327] shadow-lg shadow-[#FF5A1F]/10'
                      : activeLayer === 'exploded'
                        ? 'border-white/20 bg-[#1F2327]/80'
                        : 'border-white/5 bg-[#15181B]/50 opacity-40 hover:border-white/20 hover:opacity-80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`font-mono text-xs uppercase tracking-widest ${
                        activeLayer === 2 ? 'font-bold text-[#FF5A1F]' : 'text-[#8A8F95]'
                      }`}
                    >
                      02 // Microporous Membrane
                    </span>
                    <span className="rounded-sm bg-[#FF5A1F]/20 px-2 py-0.5 font-mono text-[10px] font-bold text-[#FF5A1F]">
                      20,000 MM
                    </span>
                  </div>
                  <h3 className="mt-1.5 flex items-baseline gap-2 font-display text-lg font-bold text-white sm:text-xl">
                    <span className="font-mono text-2xl font-black tabular-nums text-[#FF5A1F]">
                      {hydrostaticValue.toLocaleString()}
                    </span>
                    <span>mm Hydrostatic Head</span>
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-[#8A8F95]">
                    Withstands water pressure exceeding 20 meters before failure. Completely
                    impervious to torrential rains and sub-zero wind chills.
                  </p>
                </div>

                {/* Step 03 */}
                <div
                  onClick={() => handleSelectLayer(3)}
                  className={`cursor-pointer rounded-sm border p-5 transition-all duration-300 ${
                    activeLayer === 3
                      ? 'border-[#FF5A1F] bg-[#1F2327] shadow-lg shadow-[#FF5A1F]/10'
                      : activeLayer === 'exploded'
                        ? 'border-white/20 bg-[#1F2327]/80'
                        : 'border-white/5 bg-[#15181B]/50 opacity-40 hover:border-white/20 hover:opacity-80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`font-mono text-xs uppercase tracking-widest ${
                        activeLayer === 3 ? 'font-bold text-[#FF5A1F]' : 'text-[#8A8F95]'
                      }`}
                    >
                      03 // Internal Lining
                    </span>
                    <span className="rounded-sm bg-cyan-500/20 px-2 py-0.5 font-mono text-[10px] font-bold text-cyan-400">
                      15,000 G/M²
                    </span>
                  </div>
                  <h3 className="mt-1.5 font-display text-lg font-bold text-white sm:text-xl">
                    Laser-Vented Breathable Mesh
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-[#8A8F95]">
                    Engineered with 15,000 g/m² breathability and laser-cut underarm vents to
                    evacuate core body vapor without lowering thermal efficiency.
                  </p>
                </div>
              </div>

              {/* Right Column: Dynamic 3D Exploded Visual Stage */}
              <div className="relative flex min-h-[440px] items-center justify-center sm:min-h-[500px] lg:col-span-7">
                {/* 3D Perspective Stage Container */}
                <div
                  className="relative flex h-[420px] w-full max-w-xl items-center justify-center"
                  style={{ perspective: '1200px' }}
                >
                  {/* Layer 01: Outer Weather Face Card */}
                  <div
                    onClick={() => handleSelectLayer(1)}
                    className={`group absolute inset-x-2 cursor-pointer rounded-sm border p-4 shadow-2xl backdrop-blur-md transition-all duration-500 sm:inset-x-6 ${
                      activeLayer === 1
                        ? 'z-40 scale-[1.03] border-[#FF5A1F] bg-[#1F2327] shadow-[#FF5A1F]/20'
                        : activeLayer === 'exploded'
                          ? 'z-30 border-white/20 bg-[#1F2327]/95'
                          : 'z-10 scale-[0.94] border-white/10 bg-[#1F2327]/60 opacity-30 hover:opacity-70'
                    }`}
                    style={{
                      transform:
                        activeLayer === 'exploded'
                          ? 'translateY(-115px) translateZ(50px) rotateX(10deg)'
                          : activeLayer === 1
                            ? 'translateY(0px) translateZ(70px)'
                            : 'translateY(-60px) translateZ(-40px)',
                    }}
                  >
                    <div className="mb-2.5 flex items-center justify-between font-mono text-xs">
                      <div className="flex items-center gap-2">
                        <span className="flex h-2 w-2 rounded-full bg-[#FF5A1F]" />
                        <span className="font-bold text-white">LAYER 01 // SHELL FACE</span>
                      </div>
                      <span className="rounded-sm bg-[#FF5A1F]/20 px-2 py-0.5 text-[10px] font-bold text-[#FF5A1F]">
                        CORDURA® RIPSTOP
                      </span>
                    </div>

                    <div className="relative aspect-[16/9] w-full overflow-hidden rounded-sm bg-black/60">
                      <img
                        src="/images/jacket-collection.jpg"
                        alt="Outer Face Shell Construction"
                        className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                      />
                      {/* Water-repellent overlay badge */}
                      <div className="absolute bottom-2.5 left-2.5 flex items-center gap-2 rounded-sm border border-white/20 bg-black/70 px-2.5 py-1 font-mono text-[10px] text-white backdrop-blur-sm">
                        <Droplets className="h-3 w-3 text-cyan-400" />
                        <span>Fluorocarbon-Free DWR Coating</span>
                      </div>
                    </div>
                  </div>

                  {/* Layer 02: Microporous Hydrostatic Membrane Card */}
                  <div
                    onClick={() => handleSelectLayer(2)}
                    className={`group absolute inset-x-2 cursor-pointer rounded-sm border p-4 shadow-2xl backdrop-blur-md transition-all duration-500 sm:inset-x-6 ${
                      activeLayer === 2
                        ? 'z-40 scale-[1.03] border-[#FF5A1F] bg-[#1F2327] shadow-[#FF5A1F]/20'
                        : activeLayer === 'exploded'
                          ? 'z-20 border-white/20 bg-[#15181B]/95'
                          : 'z-10 scale-[0.94] border-white/10 bg-[#15181B]/60 opacity-30 hover:opacity-70'
                    }`}
                    style={{
                      transform:
                        activeLayer === 'exploded'
                          ? 'translateY(0px) translateZ(0px) rotateX(10deg)'
                          : activeLayer === 2
                            ? 'translateY(0px) translateZ(70px)'
                            : activeLayer === 1
                              ? 'translateY(50px) translateZ(-30px)'
                              : 'translateY(-50px) translateZ(-30px)',
                    }}
                  >
                    <div className="mb-2.5 flex items-center justify-between font-mono text-xs">
                      <div className="flex items-center gap-2">
                        <span className="flex h-2 w-2 rounded-full bg-cyan-400" />
                        <span className="font-bold text-white">
                          LAYER 02 // MONOLITHIC MEMBRANE
                        </span>
                      </div>
                      <span className="rounded-sm bg-cyan-500/20 px-2 py-0.5 text-[10px] font-bold text-cyan-400">
                        20,000 MM HEAD
                      </span>
                    </div>

                    <div className="relative aspect-[16/9] w-full overflow-hidden rounded-sm bg-slate-900/90">
                      <img
                        src="/images/hero-banner.jpg"
                        alt="Microporous Membrane Construction"
                        className="brightness-60 h-full w-full object-cover object-center filter transition-transform duration-500 group-hover:scale-105"
                      />
                      {/* Technical membrane grid callout */}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <div className="text-center font-mono">
                          <div className="text-3xl font-black tabular-nums text-white">
                            {hydrostaticValue.toLocaleString()} MM
                          </div>
                          <div className="text-[10px] uppercase tracking-widest text-[#8A8F95]">
                            Hydrostatic Water Column
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Layer 03: Internal Vapor Lining Card */}
                  <div
                    onClick={() => handleSelectLayer(3)}
                    className={`group absolute inset-x-2 cursor-pointer rounded-sm border p-4 shadow-2xl backdrop-blur-md transition-all duration-500 sm:inset-x-6 ${
                      activeLayer === 3
                        ? 'z-40 scale-[1.03] border-[#FF5A1F] bg-[#1F2327] shadow-[#FF5A1F]/20'
                        : activeLayer === 'exploded'
                          ? 'z-10 border-white/20 bg-[#0e131f]/95'
                          : 'z-10 scale-[0.94] border-white/10 bg-[#0e131f]/60 opacity-30 hover:opacity-70'
                    }`}
                    style={{
                      transform:
                        activeLayer === 'exploded'
                          ? 'translateY(115px) translateZ(-50px) rotateX(10deg)'
                          : activeLayer === 3
                            ? 'translateY(0px) translateZ(70px)'
                            : 'translateY(60px) translateZ(-40px)',
                    }}
                  >
                    <div className="mb-2.5 flex items-center justify-between font-mono text-xs">
                      <div className="flex items-center gap-2">
                        <span className="flex h-2 w-2 rounded-full bg-emerald-400" />
                        <span className="font-bold text-white">LAYER 03 // VAPOR VENT LINING</span>
                      </div>
                      <span className="rounded-sm bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                        15,000 G/M²
                      </span>
                    </div>

                    <div className="relative aspect-[16/9] w-full overflow-hidden rounded-sm bg-black/50">
                      <img
                        src="/images/hoodie-collection.jpg"
                        alt="Breathable Interior Lining"
                        className="h-full w-full object-cover brightness-50 filter transition-transform duration-500 group-hover:scale-105"
                      />
                      {/* Venting system badge */}
                      <div className="absolute bottom-2.5 left-2.5 flex items-center gap-2 rounded-sm border border-white/20 bg-black/70 px-2.5 py-1 font-mono text-[10px] text-white backdrop-blur-sm">
                        <Wind className="h-3 w-3 text-emerald-400" />
                        <span>Laser-Cut Underarm Vapor Vents</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Row of Three Spec Facts with Clean Line Icons (§7.5) */}
            <div className="mt-12 grid grid-cols-1 gap-6 border-t border-white/10 pt-8 sm:grid-cols-3 lg:mt-16">
              <div className="flex items-start gap-3.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm border border-white/10 bg-[#1F2327] text-white">
                  <Shield className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-display text-xs font-bold uppercase tracking-wider text-white">
                    German Fidlock Buckles
                  </h4>
                  <p className="mt-1 text-[11px] leading-relaxed text-[#8A8F95]">
                    Magnetic quick-release closures tested for 50,000 engagement cycles in sub-zero
                    temperatures.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm border border-white/10 bg-[#1F2327] text-white">
                  <Droplets className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-display text-xs font-bold uppercase tracking-wider text-white">
                    YKK Aquaguard Zippers
                  </h4>
                  <p className="mt-1 text-[11px] leading-relaxed text-[#8A8F95]">
                    Polyurethane laminated tape completely seals zipper teeth against high-pressure
                    wind and water.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm border border-white/10 bg-[#1F2327] text-white">
                  <Wrench className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-display text-xs font-bold uppercase tracking-wider text-white">
                    Bar-Tack Reinforced
                  </h4>
                  <p className="mt-1 text-[11px] leading-relaxed text-[#8A8F95]">
                    Every stress point on pockets, hoods, and zipper ends is anchored with
                    high-density bar-tack stitches.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

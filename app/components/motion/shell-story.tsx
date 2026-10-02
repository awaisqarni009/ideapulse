'use client';

import React, { useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { Shield, Droplets, Wind, Wrench, Layers } from 'lucide-react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function ShellStory() {
  const root = useRef<HTMLElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const [hydrostaticValue, setHydrostaticValue] = useState(0);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;

      const mm = gsap.matchMedia();

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: el,
            start: 'top top',
            end: '+=250%',
            pin: true,
            scrub: 0.6,
          },
          defaults: { ease: 'none' },
        });

        // Layer separations on Y
        tl.to('.layer-1', { yPercent: -28, rotateX: 6 }, 0)
          .to('.layer-3', { yPercent: 28, rotateX: -6 }, 0)
          // Step 1 active
          .to('.step-1', { opacity: 1, color: '#f2f5f7' }, 0)
          .to('.step-2', { opacity: 0.35 }, 0)
          .to('.step-3', { opacity: 0.35 }, 0)
          // Step 2 active
          .to('.step-1', { opacity: 0.35 }, 0.33)
          .to('.step-2', { opacity: 1, color: '#f2f5f7' }, 0.33)
          .to('.step-3', { opacity: 0.35 }, 0.33)
          // Step 3 active
          .to('.step-1', { opacity: 0.35 }, 0.66)
          .to('.step-2', { opacity: 0.35 }, 0.66)
          .to('.step-3', { opacity: 1, color: '#f2f5f7' }, 0.66);

        // Hydrostatic count-up animation when Step 2 enters
        const countObj = { val: 0 };
        ScrollTrigger.create({
          trigger: el,
          start: 'top top+=30%',
          once: true,
          onEnter: () => {
            gsap.to(countObj, {
              val: 20000,
              duration: 1.4,
              ease: 'power3.out',
              onUpdate: () => {
                setHydrostaticValue(Math.round(countObj.val));
              },
            });
          },
        });
      });
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      className="relative z-10 w-full border-t border-white/5 bg-[#15181B] py-20 text-[#F2F5F7]"
    >
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Clean Headline - No uppercase eyebrow (§1 problem 10, §7.5) */}
        <div className="mb-12 max-w-2xl">
          <h2 className="font-display text-3xl font-extrabold tracking-tight text-[#F2F5F7] sm:text-5xl">
            Built heavy. Built to keep weather out.
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[#8A8F95]">
            Every storm shell is constructed as an architectural three-tier membrane calibrated to
            resist driving rain while releasing interior heat during active movement.
          </p>
        </div>

        {/* The Two-Column Exploded View (§6.2) */}
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
          {/* Left Column: 01, 02, 03 Sequential Specs */}
          <div className="space-y-8 lg:col-span-5">
            {/* Step 01 */}
            <div className="step-1 border-l-2 border-white/20 pl-5 opacity-100 transition-all duration-300">
              <div className="font-mono text-xs uppercase tracking-widest text-[#8A8F95]">
                01 // Outer Face
              </div>
              <h3 className="mt-1 font-display text-xl font-bold text-white">
                DWR-Treated Cordura Ripstop
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-[#8A8F95]">
                Fluorocarbon-free water-repellent barrier. High-tensile yarn prevents abrasions and
                causes torrential downpours to bead up and roll off instantly.
              </p>
            </div>

            {/* Step 02 */}
            <div className="step-2 border-l-2 border-white/20 pl-5 opacity-35 transition-all duration-300">
              <div className="font-mono text-xs uppercase tracking-widest text-[#8A8F95]">
                02 // Microporous Membrane
              </div>
              <h3 className="mt-1 flex items-baseline gap-2 font-display text-xl font-bold text-white">
                <span ref={counterRef} className="text-2xl font-black tabular-nums text-[#FF5A1F]">
                  {hydrostaticValue > 0 ? hydrostaticValue.toLocaleString() : '20,000'}
                </span>
                <span>mm Hydrostatic Head</span>
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-[#8A8F95]">
                Withstands water pressure exceeding 20 meters before failure. Completely impervious
                to high-velocity wind chills.
              </p>
            </div>

            {/* Step 03 */}
            <div className="step-3 border-l-2 border-white/20 pl-5 opacity-35 transition-all duration-300">
              <div className="font-mono text-xs uppercase tracking-widest text-[#8A8F95]">
                03 // Internal Lining
              </div>
              <h3 className="mt-1 font-display text-xl font-bold text-white">
                Laser-Vented Breathable Mesh
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-[#8A8F95]">
                Engineered with 15,000 g/m² breathability and laser-cut underarm vents to evacuate
                core body vapor without lowering thermal efficiency.
              </p>
            </div>
          </div>

          {/* Right Column: Visual Exploded Layers */}
          <div className="relative flex min-h-[380px] items-center justify-center sm:min-h-[460px] lg:col-span-7">
            {/* Layer 1 (Outer) */}
            <div className="layer-1 absolute inset-x-4 z-30 rounded-2xl border border-white/10 bg-[#1F2327]/90 p-5 shadow-2xl backdrop-blur-md sm:inset-x-12">
              <div className="mb-2 flex items-center justify-between font-mono text-xs text-[#8A8F95]">
                <span>LAYER 01 // SHELL FACE</span>
                <span className="font-bold text-[#FF5A1F]">DWR 20K</span>
              </div>
              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl bg-black/60">
                <img
                  src="/images/jacket-collection.jpg"
                  alt="Outer Face Shell"
                  className="h-full w-full object-cover object-top opacity-85"
                />
              </div>
            </div>

            {/* Layer 2 (Membrane) */}
            <div className="layer-2 absolute inset-x-8 z-20 rounded-2xl border border-white/10 bg-[#15181B]/95 p-5 shadow-xl backdrop-blur-md sm:inset-x-16">
              <div className="mb-2 flex items-center justify-between font-mono text-xs text-[#8A8F95]">
                <span>LAYER 02 // HYDROSTATIC MEMBRANE</span>
                <span className="font-bold text-white">20,000 MM</span>
              </div>
              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl bg-slate-900/80">
                <img
                  src="/images/hero-banner.jpg"
                  alt="Membrane Construction"
                  className="h-full w-full object-cover object-center brightness-50 grayscale filter"
                />
              </div>
            </div>

            {/* Layer 3 (Lining) */}
            <div className="layer-3 absolute inset-x-12 z-10 rounded-2xl border border-white/10 bg-[#0e131f]/90 p-5 shadow-lg backdrop-blur-md sm:inset-x-20">
              <div className="mb-2 flex items-center justify-between font-mono text-xs text-[#8A8F95]">
                <span>LAYER 03 // VAPOR VENT LINING</span>
                <span className="font-bold text-white">15,000 G/M²</span>
              </div>
              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl bg-black/50">
                <img
                  src="/images/hoodie-collection.jpg"
                  alt="Breathable Interior Lining"
                  className="brightness-40 h-full w-full object-cover filter"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Row of Three Spec Facts with Clean Line Icons (No Cards, No Emojis §7.5) */}
        <div className="mt-20 grid grid-cols-1 gap-8 border-t border-white/10 pt-10 sm:grid-cols-3">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm border border-white/10 bg-[#1F2327] text-white">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-display text-sm font-bold text-white">German Fidlock Buckles</h4>
              <p className="mt-1 text-xs leading-relaxed text-[#8A8F95]">
                Magnetic quick-release closures tested for 50,000 engagement cycles in sub-zero
                temperatures.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm border border-white/10 bg-[#1F2327] text-white">
              <Droplets className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-display text-sm font-bold text-white">YKK Aquaguard Zippers</h4>
              <p className="mt-1 text-xs leading-relaxed text-[#8A8F95]">
                Polyurethane laminated tape completely seals zipper teeth against high-pressure wind
                and water.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm border border-white/10 bg-[#1F2327] text-white">
              <Wrench className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-display text-sm font-bold text-white">Bar-Tack Reinforced</h4>
              <p className="mt-1 text-xs leading-relaxed text-[#8A8F95]">
                Every stress point on pockets, hoods, and zipper ends is anchored with high-density
                bar-tack stitches.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

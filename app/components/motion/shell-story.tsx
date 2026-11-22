'use client';

import React, { useState } from 'react';
import { Shield, Droplets, Wind, Layers, Sparkles, CheckCircle2, Lock } from 'lucide-react';

interface LayerInfo {
  id: number;
  label: string;
  name: string;
  badge: string;
  badgeColor: string;
  description: string;
  benefits: string[];
  image: string;
}

const LAYERS: LayerInfo[] = [
  {
    id: 1,
    label: 'Layer 01',
    name: 'Ripstop Weather Face',
    badge: 'DWR Water-Beading',
    badgeColor: 'border-indigo-500/30 bg-indigo-500/15 text-indigo-300',
    description:
      'Fluorocarbon-free water-repellent surface where rain and snow bead up and roll off instantly.',
    benefits: [
      'High-tensile ripstop prevents snags and tears',
      'Water beads off without soaking through',
      'Wind-blocking dense woven exterior',
    ],
    image: '/images/jacket-collection.jpg',
  },
  {
    id: 2,
    label: 'Layer 02',
    name: '20,000 MM Waterproof Membrane',
    badge: '20K MM Hydrostatic',
    badgeColor: 'border-cyan-500/30 bg-cyan-500/15 text-cyan-300',
    description:
      'A microporous barrier that withstands extreme torrential rains and sub-zero blizzard chills.',
    benefits: [
      'Withstands 20 meters of water pressure',
      'Blocks gale-force wind chills completely',
      '100% waterproof monolithic barrier',
    ],
    image: '/images/hero-banner.jpg',
  },
  {
    id: 3,
    label: 'Layer 03',
    name: 'Active Vapor Lining',
    badge: '15,000 G/M² Breathable',
    badgeColor: 'border-emerald-500/30 bg-emerald-500/15 text-emerald-300',
    description:
      'Laser-vented interior mesh that releases body heat and moisture vapor during active movement.',
    benefits: [
      'Allows sweat vapor to escape freely',
      'No clammy or sticky interior feeling',
      'Laser-cut underarm airflow channels',
    ],
    image: '/images/hoodie-collection.jpg',
  },
];

export default function ShellStory() {
  const [activeLayer, setActiveLayer] = useState<number>(1);

  return (
    <section
      id="craftsmanship"
      className="relative w-full border-t border-white/10 bg-[#0B0F19] px-4 py-16 text-[#F2F5F7] sm:px-6 lg:px-8 lg:py-24"
    >
      <div className="container mx-auto max-w-7xl">
        {/* Section Header - Clean & Simple */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/15 px-3.5 py-1 text-xs font-semibold tracking-wider text-indigo-300">
            <Layers className="h-3.5 w-3.5 text-cyan-400" />
            <span>MATERIAL LAB // 3-TIER ARCHITECTURE</span>
          </div>

          <h2 className="mt-3.5 font-display text-3xl font-black uppercase tracking-tight text-white sm:text-4xl lg:text-5xl">
            Built Heavy. Built for Weather.
          </h2>

          <p className="mt-2.5 text-xs leading-relaxed text-slate-300 sm:text-sm">
            Three engineered layers working in harmony: rain beads off the outside, wind stops at
            the membrane, and interior heat vents naturally.
          </p>

          {/* Quick Layer Tabs (Clickable, light & intuitive) */}
          <div className="mt-6 inline-flex rounded-xl border border-white/10 bg-[#12161F] p-1.5">
            {LAYERS.map((layer) => (
              <button
                key={layer.id}
                onClick={() => setActiveLayer(layer.id)}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all ${
                  activeLayer === layer.id
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>{layer.label}</span>
                <span className="hidden sm:inline">· {layer.name.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 3-Column Interactive Cards Grid (Light, Engaging & Responsive) */}
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3 lg:gap-8">
          {LAYERS.map((layer) => {
            const isSelected = activeLayer === layer.id;
            return (
              <div
                key={layer.id}
                onClick={() => setActiveLayer(layer.id)}
                className={`group cursor-pointer rounded-2xl border p-5 transition-all duration-300 sm:p-6 ${
                  isSelected
                    ? 'border-indigo-500/50 bg-gradient-to-b from-[#151B28] to-[#10141E] shadow-xl shadow-indigo-500/15 ring-1 ring-indigo-500/30'
                    : 'border-white/5 bg-[#12161F]/70 hover:border-white/20 hover:bg-[#12161F]'
                }`}
              >
                {/* Image Container with subtle zoom */}
                <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-black/40">
                  <img
                    src={layer.image}
                    alt={layer.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3">
                    <span
                      className={`inline-flex rounded-md border px-2 py-0.5 font-sans text-[10px] font-bold uppercase tracking-wider backdrop-blur-md ${layer.badgeColor}`}
                    >
                      {layer.badge}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="mt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">
                      {layer.label}
                    </span>
                    {isSelected && (
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-cyan-400">
                        <Sparkles className="h-3 w-3" />
                        <span>Active</span>
                      </span>
                    )}
                  </div>

                  <h3 className="mt-1 font-display text-lg font-bold text-white">{layer.name}</h3>

                  <p className="mt-2 text-xs leading-relaxed text-slate-400">{layer.description}</p>

                  <ul className="mt-4 space-y-2 border-t border-white/5 pt-4 text-xs text-slate-300">
                    {layer.benefits.map((b, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Hardware Features Bar (Simple & Informative) */}
        <div className="mt-12 rounded-2xl border border-white/10 bg-[#12161F]/80 p-6 backdrop-blur-md">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-indigo-500/30 bg-indigo-500/10 text-indigo-400">
                <Droplets className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                  YKK AquaGuard®
                </h4>
                <p className="text-[11px] text-slate-400">Waterproof sealed zipper tracks</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-400">
                <Lock className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                  German Fidlock®
                </h4>
                <p className="text-[11px] text-slate-400">Magnetic quick-release buckles</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                  100% Taped Seams
                </h4>
                <p className="text-[11px] text-slate-400">Thermo-welded leak prevention</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-violet-500/30 bg-violet-500/10 text-violet-400">
                <Wind className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                  Laser Underarm Vents
                </h4>
                <p className="text-[11px] text-slate-400">Regulates internal temperature</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

'use client';

import React from 'react';
import Link from 'next/link';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  className?: string;
  href?: string;
}

export function PulseWearLogo({
  size = 'md',
  showTagline = true,
  className = '',
  href = '/',
}: LogoProps) {
  const iconSizes = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  const content = (
    <div className={`group flex select-none items-center gap-3 ${className}`}>
      {/* Modern High-End Logo Emblem */}
      <div
        className={`relative flex ${iconSizes[size]} shrink-0 items-center justify-center overflow-hidden rounded-xl border border-indigo-500/30 bg-[#07090e] shadow-lg shadow-indigo-500/20 transition-all duration-300 group-hover:scale-105 group-hover:border-indigo-400 group-hover:shadow-indigo-500/40`}
      >
        <img
          src="/images/pulsewear-logo.jpg"
          alt="PulseWear Logo"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />

        {/* Ambient Specular Highlight */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-indigo-500/10 via-transparent to-white/10" />

        {/* Active Pulse Status Beacon */}
        <span className="absolute -right-0.5 -top-0.5 flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-indigo-500" />
        </span>
      </div>

      {/* Typography Wordmark */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 leading-none">
          <span
            className={`font-display font-black tracking-tight text-white transition-colors duration-200 group-hover:text-slate-100 ${textSizes[size]}`}
          >
            PULSE
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
              WEAR
            </span>
          </span>
          <span className="py-0.2 rounded-[4px] border border-white/10 bg-white/[0.05] px-1 font-mono text-[8px] font-bold uppercase tracking-widest text-slate-400">
            DROP 26
          </span>
        </div>

        {showTagline && (
          <span className="mt-1 hidden font-mono text-[9px] uppercase tracking-widest text-slate-400 sm:block">
            500 GSM Heavyweight Streetwear
          </span>
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center">
        {content}
      </Link>
    );
  }

  return content;
}

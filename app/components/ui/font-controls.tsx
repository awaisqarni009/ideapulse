'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, X } from 'lucide-react';

export function FontControls({ className = '' }: { className?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('pulsewear_font_zoom');
      if (saved) {
        const val = parseInt(saved, 10);
        if (!isNaN(val) && val >= 80 && val <= 140) {
          setZoomLevel(val);
          document.documentElement.style.fontSize = `${val}%`;
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // Close when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  const changeZoom = (delta: number) => {
    setZoomLevel((prev) => {
      const next = Math.min(130, Math.max(85, prev + delta));
      document.documentElement.style.fontSize = `${next}%`;
      try {
        localStorage.setItem('pulsewear_font_zoom', next.toString());
      } catch {
        // ignore
      }
      return next;
    });
  };

  const resetZoom = () => {
    setZoomLevel(100);
    document.documentElement.style.fontSize = '100%';
    try {
      localStorage.removeItem('pulsewear_font_zoom');
    } catch {
      // ignore
    }
  };

  return (
    <div className={`relative inline-block ${className}`} ref={popoverRef}>
      {/* Small Zoom In/Out Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        title="Display & Font Zoom"
        aria-label="Display size scaling controls"
        className={`flex h-9 w-9 items-center justify-center rounded-lg border transition-all active:scale-95 ${
          isOpen
            ? 'border-indigo-500/50 bg-indigo-500/20 text-white shadow-sm'
            : 'border-white/10 bg-white/[0.04] text-slate-300 hover:border-white/25 hover:bg-white/[0.08] hover:text-white'
        }`}
        style={{
          boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.05)',
        }}
      >
        <ZoomIn className="h-4 w-4" />
      </button>

      {/* Popover section when clicked */}
      {isOpen && (
        <div className="animate-in fade-in zoom-in-95 absolute right-0 top-full z-50 mt-2 w-64 rounded-xl border border-white/15 bg-[#121620] p-3.5 shadow-2xl backdrop-blur-xl duration-150">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-200">
              Display & Text Zoom
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white"
              aria-label="Close zoom popover"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="mt-3 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => changeZoom(-5)}
              title="Decrease zoom (-)"
              aria-label="Decrease zoom"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 font-bold text-slate-200 transition-colors hover:bg-white/15 hover:text-white active:scale-95"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>

            <div className="flex flex-col items-center">
              <span className="font-mono text-sm font-bold text-[#FF5A1F]">{zoomLevel}%</span>
              <span className="text-[9px] uppercase tracking-wider text-slate-400">Scale</span>
            </div>

            <button
              type="button"
              onClick={() => changeZoom(5)}
              title="Increase zoom (+)"
              aria-label="Increase zoom"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 font-bold text-slate-200 transition-colors hover:bg-white/15 hover:text-white active:scale-95"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-2.5">
            <button
              type="button"
              onClick={resetZoom}
              className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400 transition-colors hover:text-white"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset 100%</span>
            </button>
            <span className="text-[10px] text-slate-400">85% – 130%</span>
          </div>
        </div>
      )}
    </div>
  );
}

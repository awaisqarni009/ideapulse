'use client';

import React, { useState, useEffect } from 'react';
import { Type, RotateCcw } from 'lucide-react';

export function FontControls({ className = '' }: { className?: string }) {
  const [zoomLevel, setZoomLevel] = useState<number>(100);

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
    <div
      className={`inline-flex items-center gap-1 rounded-sm border border-white/10 bg-[#15181B] p-1 text-xs text-[#8A8F95] shadow-sm ${className}`}
      role="group"
      aria-label="Text size accessibility controls"
    >
      <button
        type="button"
        onClick={() => changeZoom(-5)}
        title="Decrease font size (A-)"
        aria-label="Decrease font size"
        className="flex h-6 w-6 items-center justify-center rounded-sm font-bold text-slate-300 transition-colors hover:bg-white/10 hover:text-white active:scale-95"
      >
        A-
      </button>

      <span
        className="px-1 font-mono text-[10px] font-semibold text-[#FF5A1F]"
        title="Current text size scaling"
        aria-live="polite"
      >
        {zoomLevel}%
      </span>

      <button
        type="button"
        onClick={() => changeZoom(5)}
        title="Increase font size (A+)"
        aria-label="Increase font size"
        className="flex h-6 w-6 items-center justify-center rounded-sm font-bold text-slate-300 transition-colors hover:bg-white/10 hover:text-white active:scale-95"
      >
        A+
      </button>

      {zoomLevel !== 100 && (
        <button
          type="button"
          onClick={resetZoom}
          title="Reset font size to default"
          aria-label="Reset font size to default"
          className="flex h-6 w-6 items-center justify-center rounded-sm text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
        >
          <RotateCcw className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}

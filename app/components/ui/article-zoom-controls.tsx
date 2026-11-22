'use client';

import React, { useState } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, BookOpen } from 'lucide-react';

export function ArticleZoomControls({ targetId }: { targetId?: string }) {
  const [zoomPercent, setZoomPercent] = useState(100);

  const handleZoom = (delta: number) => {
    setZoomPercent((prev) => {
      const next = Math.min(150, Math.max(80, prev + delta));
      const target = targetId
        ? document.getElementById(targetId)
        : document.querySelector('article') || document.querySelector('main');
      if (target) {
        (target as HTMLElement).style.fontSize = `${next}%`;
      }
      return next;
    });
  };

  const handleReset = () => {
    setZoomPercent(100);
    const target = targetId
      ? document.getElementById(targetId)
      : document.querySelector('article') || document.querySelector('main');
    if (target) {
      (target as HTMLElement).style.fontSize = '100%';
    }
  };

  return (
    <div
      role="toolbar"
      aria-label="Article text zoom controls"
      className="my-6 inline-flex flex-wrap items-center gap-3 rounded-xl border border-white/10 bg-[#15181B] p-2.5 shadow-lg backdrop-blur-md"
    >
      <div className="flex items-center gap-2 pl-2 text-xs font-semibold text-slate-300">
        <BookOpen className="h-4 w-4 text-[#FF5A1F]" />
        <span>Reading Mode:</span>
      </div>

      <div className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-[#0e131f] p-1">
        <button
          type="button"
          onClick={() => handleZoom(-10)}
          title="Zoom Out Text (-)"
          aria-label="Zoom out article text"
          className="flex h-7 w-7 items-center justify-center rounded-md text-slate-300 transition-colors hover:bg-white/10 hover:text-white active:scale-95"
        >
          <ZoomOut className="h-4 w-4" />
        </button>

        <span
          className="min-w-[48px] text-center font-mono text-xs font-bold text-[#FF5A1F]"
          aria-live="polite"
        >
          {zoomPercent}%
        </span>

        <button
          type="button"
          onClick={() => handleZoom(10)}
          title="Zoom In Text (+)"
          aria-label="Zoom in article text"
          className="flex h-7 w-7 items-center justify-center rounded-md text-slate-300 transition-colors hover:bg-white/10 hover:text-white active:scale-95"
        >
          <ZoomIn className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={handleReset}
          title="Reset Text Zoom"
          aria-label="Reset article text zoom to default"
          className="flex h-7 items-center gap-1 rounded-md px-2 text-xs text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
        >
          <RotateCcw className="h-3 w-3" />
          <span className="font-mono text-[10px]">Reset</span>
        </button>
      </div>
    </div>
  );
}

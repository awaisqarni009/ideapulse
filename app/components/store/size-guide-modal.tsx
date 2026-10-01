'use client';

import React from 'react';
import { SIZE_CHART } from '@/lib/store/products';

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SizeGuideModal({ isOpen, onClose }: SizeGuideModalProps) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="size-guide-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-300"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl rounded-2xl border border-white/10 bg-[#0e131f] p-6 shadow-2xl transition-all duration-300 sm:p-8">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h2
              id="size-guide-title"
              className="font-display text-xl font-bold tracking-tight text-white sm:text-2xl"
            >
              Size & Fit Architecture
            </h2>
            <p className="mt-1 text-xs text-slate-400 sm:text-sm">
              All PULSEWEAR hoodies & jackets feature a modern oversized boxy streetwear silhouette.
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-slate-400 transition-colors hover:border-white/20 hover:text-white"
            aria-label="Close Size Guide"
          >
            ✕
          </button>
        </div>

        {/* Measuring Tip */}
        <div className="my-5 rounded-xl border border-indigo-500/20 bg-indigo-500/10 p-3.5 text-xs text-indigo-200 sm:text-sm">
          💡 <strong className="font-semibold text-white">Fit Advisory:</strong> If you want the
          signature oversized drape shown in our campaign lookbook, select your true size. For a
          standard tailored fit, size down one size.
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="border-b border-white/10 bg-white/[0.03] text-slate-400">
              <tr>
                <th className="px-4 py-3 font-semibold text-white">Size</th>
                <th className="px-4 py-3 font-semibold">Chest Width</th>
                <th className="px-4 py-3 font-semibold">Body Length</th>
                <th className="px-4 py-3 font-semibold">Sleeve Length</th>
                <th className="px-4 py-3 font-semibold">Recommended Height</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {SIZE_CHART.map((item) => (
                <tr key={item.size} className="hover:bg-white/[0.02]">
                  <td className="px-4 py-3 font-bold text-indigo-400">{item.size}</td>
                  <td className="px-4 py-3">
                    {item.chestCm} cm / {(item.chestCm * 0.3937).toFixed(1)} in
                  </td>
                  <td className="px-4 py-3">
                    {item.lengthCm} cm / {(item.lengthCm * 0.3937).toFixed(1)} in
                  </td>
                  <td className="px-4 py-3">
                    {item.sleeveCm} cm / {(item.sleeveCm * 0.3937).toFixed(1)} in
                  </td>
                  <td className="px-4 py-3 text-slate-400">{item.recommendedHeight}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-xl bg-indigo-600 px-6 py-2.5 text-xs font-semibold text-white transition-all hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-500/25 sm:text-sm"
          >
            Got it, back to shopping
          </button>
        </div>
      </div>
    </div>
  );
}

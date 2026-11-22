'use client';

import React from 'react';
import { useTheme } from '@/lib/theme/theme-context';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  className?: string;
}

/**
 * ThemeToggle Component
 * Small single-click button that toggles directly between Dark Mode and Bright Mode.
 * No sliding switch. Accessible and lightweight.
 */
export function ThemeToggle({ className = '' }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to bright mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to Bright Mode' : 'Switch to Dark Mode'}
      className={`flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-slate-300 transition-all hover:border-white/25 hover:bg-white/[0.08] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 active:scale-95 ${className}`}
      style={{
        boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.05)',
      }}
    >
      {isDark ? (
        <Sun className="h-4 w-4 text-amber-400 transition-transform duration-200 hover:rotate-45" />
      ) : (
        <Moon className="h-4 w-4 text-indigo-400 transition-transform duration-200 hover:-rotate-12" />
      )}
    </button>
  );
}

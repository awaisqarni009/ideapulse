'use client';

import React from 'react';
import { useTheme } from '@/lib/theme/theme-context';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  className?: string;
}

/**
 * ThemeToggle Component
 * Interactive switch allowing users to toggle between Dark Mode and Bright Mode.
 * Features specular top border, smooth micro-animation, and accessible ARIA attributes.
 */
export function ThemeToggle({ className = '' }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to bright mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to bright mode' : 'Switch to dark mode'}
      className={`relative inline-flex h-9 w-16 items-center rounded-full border border-[var(--border-default)] bg-[var(--surface-3)] p-1 shadow-sm transition-all duration-300 hover:border-[var(--border-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--indigo-bright)] ${className}`}
      style={{
        boxShadow: 'inset 0 1px 0 var(--edge-specular)',
      }}
    >
      {/* Background icon indicators */}
      <span className="flex w-full justify-between px-1 text-[var(--text-tertiary)]">
        <Sun
          className={`h-3.5 w-3.5 transition-colors ${!isDark ? 'text-amber-500' : 'opacity-40'}`}
        />
        <Moon
          className={`h-3.5 w-3.5 transition-colors ${isDark ? 'text-[var(--cyan-bright)]' : 'opacity-40'}`}
        />
      </span>

      {/* Sliding Thumb pill */}
      <span
        className={`absolute top-1 flex h-7 w-7 items-center justify-center rounded-full border border-[var(--border-subtle)] bg-gradient-to-br transition-transform duration-300 ${
          isDark
            ? 'translate-x-7 from-[var(--indigo)] to-[var(--violet)] text-white shadow-[var(--glow-indigo-sm)]'
            : 'translate-x-0 from-amber-400 to-orange-400 text-slate-900 shadow-md'
        }`}
      >
        {isDark ? (
          <Moon className="h-3.5 w-3.5 text-white" />
        ) : (
          <Sun className="h-3.5 w-3.5 text-slate-950" />
        )}
      </span>
    </button>
  );
}

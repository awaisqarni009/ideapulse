'use client';

import React from 'react';
import Link from 'next/link';
import { LucideIcon } from 'lucide-react';

export interface EmptyStateProps {
  icon: LucideIcon;
  heading: string;
  description: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  className?: string;
}

/**
 * EmptyState Component per DESIGN.md §7.11 and TASKS.md [T-7.7]
 * - 56px line-art glyph at --text-tertiary
 * - --type-h4 line stating the situation
 * - --type-body-sm line in --text-secondary stating what to do
 * - One primary action
 * - Never apologizes and never uses the word "oops"
 */
export function EmptyState({
  icon: Icon,
  heading,
  description,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      role="status"
      className={`glass-panel flex flex-col items-center justify-center rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-2)] p-12 text-center ${className}`}
      style={{ boxShadow: 'inset 0 1px 0 var(--edge-specular)' }}
    >
      {/* 56px line-art glyph at --text-tertiary per §7.11 */}
      <div className="flex h-14 w-14 items-center justify-center text-[var(--text-tertiary)]">
        <Icon className="h-14 w-14 stroke-[1.5]" aria-hidden="true" />
      </div>

      {/* --type-h4 line stating the situation */}
      <h4 className="mt-4 font-display text-[18px] font-medium leading-[26px] tracking-[-0.01em] text-[var(--text-primary)]">
        {heading}
      </h4>

      {/* --type-body-sm line in --text-secondary stating what to do */}
      <p className="mt-2 max-w-md text-[13.5px] leading-[20px] text-[var(--text-secondary)]">
        {description}
      </p>

      {/* Single primary action */}
      {action && (
        <div className="mt-6">
          {action.href ? (
            <Link
              href={action.href}
              className="btn btn-primary inline-flex items-center gap-2 rounded-[var(--radius-md)] px-5 py-2.5 text-xs font-semibold text-white shadow-[var(--glow-indigo-sm)] transition-all hover:shadow-[var(--glow-indigo-md)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--indigo-bright)]"
            >
              {action.label}
            </Link>
          ) : (
            <button
              type="button"
              onClick={action.onClick}
              className="btn btn-primary inline-flex items-center gap-2 rounded-[var(--radius-md)] px-5 py-2.5 text-xs font-semibold text-white shadow-[var(--glow-indigo-sm)] transition-all hover:shadow-[var(--glow-indigo-md)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--indigo-bright)]"
            >
              {action.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

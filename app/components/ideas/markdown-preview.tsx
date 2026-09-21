'use client';

import React from 'react';
import { renderRestrictedMarkdown } from '@/lib/markdown';

interface MarkdownPreviewProps {
  content: string;
  minHeight?: string;
}

export function MarkdownPreview({ content, minHeight = '180px' }: MarkdownPreviewProps) {
  return (
    <div
      style={{ minHeight }}
      className="w-full overflow-y-auto rounded-[var(--radius-sm)] border border-[var(--border-subtle)] bg-[var(--surface-1)] p-4 text-[15px] leading-relaxed text-[var(--text-primary)] transition-all"
    >
      {renderRestrictedMarkdown(content)}
    </div>
  );
}

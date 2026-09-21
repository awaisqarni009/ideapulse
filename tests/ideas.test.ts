import { describe, it, expect } from 'vitest';
import { ideaSubmissionSchema } from '@/lib/validation';
import { formatNextSlotMessage } from '@/lib/ideas';
import { renderRestrictedMarkdown } from '@/lib/markdown';
import React from 'react';
import { renderToString } from 'react-dom/server';

describe('Idea Submission Validation (RULES.md BR-021)', () => {
  const validIdea = {
    title: 'Decentralized Vector Indexing for Edge Devices',
    category: 'ai' as const,
    summary:
      'A compact, memory-mapped vector search index that runs embedded in resource-constrained environments without external services.',
    body: `## Architecture Overview
This library provides high-performance vector search in WebAssembly.

### Features
- Offline-first execution
- Low memory footprint
- Automatic quantization

Learn more at [documentation](https://ideapulse.dev/docs).
Here is an example:
\`\`\`ts
const index = new VectorIndex();
index.insert([0.1, 0.4, 0.9]);
\`\`\`
`,
    tags: ['ai', 'vector-search', 'wasm'],
  };

  it('validates a correct idea submission', () => {
    const result = ideaSubmissionSchema.safeParse(validIdea);
    expect(result.success).toBe(true);
  });

  it('rejects title shorter than 10 characters', () => {
    const result = ideaSubmissionSchema.safeParse({
      ...validIdea,
      title: 'Short',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.title?.[0]).toContain('at least 10');
    }
  });

  it('rejects title longer than 120 characters', () => {
    const result = ideaSubmissionSchema.safeParse({
      ...validIdea,
      title: 'A'.repeat(121),
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.title?.[0]).toContain('exceed 120');
    }
  });

  it('rejects summary shorter than 40 characters', () => {
    const result = ideaSubmissionSchema.safeParse({
      ...validIdea,
      summary: 'Too short summary.',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.summary?.[0]).toContain('at least 40');
    }
  });

  it('rejects summary longer than 280 characters', () => {
    const result = ideaSubmissionSchema.safeParse({
      ...validIdea,
      summary: 'A'.repeat(281),
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.summary?.[0]).toContain('exceed 280');
    }
  });

  it('rejects body shorter than 100 characters', () => {
    const result = ideaSubmissionSchema.safeParse({
      ...validIdea,
      body: 'Too short body. Needs at least 100 characters to be accepted.',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.body?.[0]).toContain('at least 100');
    }
  });

  it('rejects body longer than 5000 characters', () => {
    const result = ideaSubmissionSchema.safeParse({
      ...validIdea,
      body: 'A'.repeat(5001),
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.body?.[0]).toContain('exceed 5000');
    }
  });

  it('rejects more than 5 tags', () => {
    const result = ideaSubmissionSchema.safeParse({
      ...validIdea,
      tags: ['tag1', 'tag2', 'tag3', 'tag4', 'tag5', 'tag6'],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.tags?.[0]).toContain('at most 5');
    }
  });

  it('rejects invalid category', () => {
    const result = ideaSubmissionSchema.safeParse({
      ...validIdea,
      category: 'crypto-pump' as any,
    });
    expect(result.success).toBe(false);
  });
});

describe('Next Slot Formatting (RULES.md BR-020)', () => {
  it('formats next slot UTC timestamp accurately', () => {
    const dateStr = '2026-03-14T09:12:00.000Z';
    const message = formatNextSlotMessage(dateStr);
    expect(message).toBe(
      "You've used this week's submission. Your next slot opens Saturday 14 March at 09:12 UTC.",
    );
  });

  it('handles invalid or empty timestamps gracefully', () => {
    expect(formatNextSlotMessage(undefined)).toBe(
      "You've used this week's submission. Your next slot opens in 7 days.",
    );
    expect(formatNextSlotMessage('invalid-date')).toBe(
      "You've used this week's submission. Your next slot opens in 7 days.",
    );
  });
});

describe('Sanitized Markdown Parser (T-3.5)', () => {
  it('renders bold, italic, and code correctly', () => {
    const md = 'Here is **bold** text and *italic* text and `code` inline.';
    const html = renderToString(renderRestrictedMarkdown(md) as React.ReactElement);
    expect(html).toContain(
      '<strong class="font-semibold text-[var(--text-primary)]">bold</strong>',
    );
    expect(html).toContain('<em class="italic text-[var(--text-primary)]">italic</em>');
    expect(html).toContain('<code class="rounded border border-[var(--border-subtle)]');
  });

  it('renders safe https links with security attributes', () => {
    const md = 'Check [our guide](https://example.com) for details.';
    const html = renderToString(renderRestrictedMarkdown(md) as React.ReactElement);
    expect(html).toContain('href="https://example.com"');
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
  });

  it('neutralizes malicious javascript: links for XSS prevention', () => {
    const md = 'Click [here](javascript:stealTokens()) to win.';
    const html = renderToString(renderRestrictedMarkdown(md) as React.ReactElement);
    expect(html).not.toContain('href="javascript:stealTokens()"');
    expect(html).toContain('<span>[here](javascript:stealTokens())</span>');
  });

  it('renders lists and code blocks correctly', () => {
    const md = `
- Item A
- Item B

\`\`\`ts
const x = 42;
\`\`\`
`;
    const html = renderToString(renderRestrictedMarkdown(md) as React.ReactElement);
    expect(html).toContain('<ul');
    expect(html).toContain('<li');
    expect(html).toContain('<pre><code>const x = 42;</code></pre>');
  });
});

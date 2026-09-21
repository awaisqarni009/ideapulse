import React from 'react';

/**
 * Sanitized Markdown Renderer for IdeaPulse
 * Implements T-3.5 per PRD.md and DESIGN.md.
 *
 * Restricted subset:
 * - Code blocks (```)
 * - Inline code (`)
 * - Bold (**bold**)
 * - Italic (*italic* / _italic_)
 * - Links ([text](https://...)) with protocol validation (http/https only)
 * - Unordered lists (- or *)
 * - Ordered lists (1. )
 * - Blockquotes (> )
 * - Paragraphs
 *
 * Renders purely as React virtual DOM nodes with ZERO dangerouslySetInnerHTML
 * to guarantee XSS immunity.
 */

function parseInline(text: string, keyPrefix: string): React.ReactNode[] {
  const elements: React.ReactNode[] = [];
  // Tokenizer regex matching:
  // 1. inline code: `code`
  // 2. bold: \*\*(.+?)\*\*
  // 3. italic: \*(.+?)\* or _(.+?)_
  // 4. link: \[(.+?)\]\((?:[^()]+|\([^()]*\))*\)
  const regex = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|_[^_]+_|\[[^\]]+\]\((?:[^()]+|\([^()]*\))*\))/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let partIndex = 0;

  while ((match = regex.exec(text)) !== null) {
    // Text before match
    if (match.index > lastIndex) {
      elements.push(
        <React.Fragment key={`${keyPrefix}-t-${partIndex++}`}>
          {text.slice(lastIndex, match.index)}
        </React.Fragment>,
      );
    }

    const token = match[0];

    if (token.startsWith('`') && token.endsWith('`')) {
      elements.push(
        <code
          key={`${keyPrefix}-code-${partIndex++}`}
          className="rounded border border-[var(--border-subtle)] bg-[var(--surface-3)] px-1.5 py-0.5 font-mono text-[13px] text-[var(--cyan-bright)]"
        >
          {token.slice(1, -1)}
        </code>,
      );
    } else if (token.startsWith('**') && token.endsWith('**')) {
      elements.push(
        <strong
          key={`${keyPrefix}-bold-${partIndex++}`}
          className="font-semibold text-[var(--text-primary)]"
        >
          {token.slice(2, -2)}
        </strong>,
      );
    } else if (
      (token.startsWith('*') && token.endsWith('*')) ||
      (token.startsWith('_') && token.endsWith('_'))
    ) {
      elements.push(
        <em key={`${keyPrefix}-em-${partIndex++}`} className="italic text-[var(--text-primary)]">
          {token.slice(1, -1)}
        </em>,
      );
    } else if (token.startsWith('[') && token.includes('](')) {
      const closeBracket = token.indexOf('](');
      const label = token.slice(1, closeBracket);
      const url = token.slice(closeBracket + 2, -1).trim();

      // Only allow http and https protocols to prevent javascript: or data: attacks
      const isSafeProtocol = url.startsWith('http://') || url.startsWith('https://');

      if (isSafeProtocol) {
        elements.push(
          <a
            key={`${keyPrefix}-a-${partIndex++}`}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--indigo-bright)] underline underline-offset-2 hover:text-[var(--indigo)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--indigo-bright)]"
          >
            {label}
          </a>,
        );
      } else {
        // Fallback safely to plaintext if untrusted protocol
        elements.push(<span key={`${keyPrefix}-unsafe-${partIndex++}`}>{token}</span>);
      }
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    elements.push(
      <React.Fragment key={`${keyPrefix}-end-${partIndex}`}>
        {text.slice(lastIndex)}
      </React.Fragment>,
    );
  }

  return elements;
}

export function renderRestrictedMarkdown(markdown: string): React.ReactNode {
  if (!markdown || !markdown.trim()) {
    return <p className="italic text-[var(--text-tertiary)]">Nothing to preview yet.</p>;
  }

  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const nodes: React.ReactNode[] = [];
  let i = 0;
  let blockIndex = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (line === undefined) {
      i++;
      continue;
    }

    // 1. Fenced Code Block
    if (line.trim().startsWith('```')) {
      const codeLines: string[] = [];
      i++;
      while (i < lines.length) {
        const nextLine = lines[i];
        if (nextLine === undefined || nextLine.trim().startsWith('```')) {
          break;
        }
        codeLines.push(nextLine);
        i++;
      }
      i++; // consume closing ```
      nodes.push(
        <div
          key={`code-block-${blockIndex++}`}
          className="my-3 overflow-x-auto rounded-[var(--radius-sm)] border border-[var(--border-subtle)] bg-[var(--surface-1)] p-4 font-mono text-[13px] text-[var(--text-secondary)]"
        >
          <pre>
            <code>{codeLines.join('\n')}</code>
          </pre>
        </div>,
      );
      continue;
    }

    // 2. Unordered List
    if (/^\s*[-*]\s+/.test(line)) {
      const listItems: React.ReactNode[] = [];
      while (i < lines.length) {
        const nextLine = lines[i];
        if (!nextLine || !/^\s*[-*]\s+/.test(nextLine)) {
          break;
        }
        const itemContent = nextLine.replace(/^\s*[-*]\s+/, '');
        listItems.push(
          <li key={`li-${listItems.length}`} className="ml-4 list-disc pl-1">
            {parseInline(itemContent, `li-${blockIndex}-${listItems.length}`)}
          </li>,
        );
        i++;
      }
      nodes.push(
        <ul
          key={`ul-${blockIndex++}`}
          className="my-2 space-y-1 text-[15px] text-[var(--text-secondary)]"
        >
          {listItems}
        </ul>,
      );
      continue;
    }

    // 3. Ordered List
    if (/^\s*\d+\.\s+/.test(line)) {
      const listItems: React.ReactNode[] = [];
      while (i < lines.length) {
        const nextLine = lines[i];
        if (!nextLine || !/^\s*\d+\.\s+/.test(nextLine)) {
          break;
        }
        const itemContent = nextLine.replace(/^\s*\d+\.\s+/, '');
        listItems.push(
          <li key={`oli-${listItems.length}`} className="ml-4 list-decimal pl-1">
            {parseInline(itemContent, `oli-${blockIndex}-${listItems.length}`)}
          </li>,
        );
        i++;
      }
      nodes.push(
        <ol
          key={`ol-${blockIndex++}`}
          className="my-2 space-y-1 text-[15px] text-[var(--text-secondary)]"
        >
          {listItems}
        </ol>,
      );
      continue;
    }

    // 4. Blockquote
    if (/^\s*>\s*/.test(line)) {
      const quoteLines: string[] = [];
      while (i < lines.length) {
        const nextLine = lines[i];
        if (!nextLine || !/^\s*>\s*/.test(nextLine)) {
          break;
        }
        quoteLines.push(nextLine.replace(/^\s*>\s*/, ''));
        i++;
      }
      nodes.push(
        <blockquote
          key={`quote-${blockIndex++}`}
          className="my-3 border-l-2 border-[var(--indigo)] pl-4 italic text-[var(--text-secondary)]"
        >
          {parseInline(quoteLines.join(' '), `quote-${blockIndex}`)}
        </blockquote>,
      );
      continue;
    }

    // 5. Empty line
    if (!line.trim()) {
      i++;
      continue;
    }

    // 6. Regular Paragraph
    const paragraphLines: string[] = [];
    while (i < lines.length) {
      const nextLine = lines[i];
      if (
        !nextLine ||
        !nextLine.trim() ||
        nextLine.trim().startsWith('```') ||
        /^\s*[-*]\s+/.test(nextLine) ||
        /^\s*\d+\.\s+/.test(nextLine) ||
        /^\s*>\s*/.test(nextLine)
      ) {
        break;
      }
      paragraphLines.push(nextLine);
      i++;
    }

    nodes.push(
      <p
        key={`p-${blockIndex++}`}
        className="my-2 text-[15px] leading-relaxed text-[var(--text-secondary)]"
      >
        {parseInline(paragraphLines.join(' '), `p-${blockIndex}`)}
      </p>,
    );
  }

  return <div className="prose-pulse space-y-2">{nodes}</div>;
}

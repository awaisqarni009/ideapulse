'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { submitIdeaAction } from '@/app/actions/ideas';
import { CharCounter } from './char-counter';
import { MarkdownPreview } from './markdown-preview';
import { CATEGORIES, CATEGORY_LABELS, type Category, IDEA_LIMITS } from '@/lib/constants';
import { ideaSubmissionSchema } from '@/lib/validation';
import { Sparkles, Eye, Edit3, Columns, AlertCircle, X, Plus } from 'lucide-react';

interface IdeaFormProps {
  cycleId: string;
}

export function IdeaForm({ cycleId: _cycleId }: IdeaFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Category>('product');
  const [summary, setSummary] = useState('');
  const [body, setBody] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  // UI state
  const [editorTab, setEditorTab] = useState<'write' | 'preview' | 'split'>('write');
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [restoredDraftTime, setRestoredDraftTime] = useState<string | null>(null);

  // Draft Autosave & Restore [T-3.6]
  // 1. Restore draft on mount
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem('ideapulse_submission_draft');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.title || parsed.summary || parsed.body || parsed.tags?.length) {
          if (parsed.title) setTitle(parsed.title);
          if (parsed.category) setCategory(parsed.category);
          if (parsed.summary) setSummary(parsed.summary);
          if (parsed.body) setBody(parsed.body);
          if (Array.isArray(parsed.tags)) setTags(parsed.tags);
          setRestoredDraftTime(parsed.savedAt || 'earlier');
        }
      }
    } catch {
      // Ignore localStorage read errors
    }
  }, []);

  // 2. Autosave draft debounced 500ms
  React.useEffect(() => {
    const handler = setTimeout(() => {
      if (title.trim() || summary.trim() || body.trim() || tags.length > 0) {
        try {
          const draft = {
            title,
            category,
            summary,
            body,
            tags,
            savedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
          localStorage.setItem('ideapulse_submission_draft', JSON.stringify(draft));
        } catch {
          // Ignore quota/private mode errors
        }
      }
    }, 500);
    return () => clearTimeout(handler);
  }, [title, category, summary, body, tags]);

  const handleDiscardDraft = () => {
    try {
      localStorage.removeItem('ideapulse_submission_draft');
    } catch {}
    setTitle('');
    setCategory('product');
    setSummary('');
    setBody('');
    setTags([]);
    setRestoredDraftTime(null);
  };

  // Tag management
  const handleAddTag = () => {
    const cleanTag = tagInput
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '');
    if (!cleanTag) return;
    if (tags.length >= IDEA_LIMITS.TAGS_MAX) {
      setErrors((prev) => ({
        ...prev,
        tags: [`You may add at most ${IDEA_LIMITS.TAGS_MAX} tags.`],
      }));
      return;
    }
    if (tags.includes(cleanTag)) {
      setTagInput('');
      return;
    }
    if (cleanTag.length > IDEA_LIMITS.TAG_LENGTH_MAX) {
      setErrors((prev) => ({
        ...prev,
        tags: [`Tag cannot exceed ${IDEA_LIMITS.TAG_LENGTH_MAX} characters.`],
      }));
      return;
    }

    setTags([...tags, cleanTag]);
    setTagInput('');
    setErrors((prev) => {
      const copy = { ...prev };
      delete copy.tags;
      return copy;
    });
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    const formData = {
      title,
      category,
      summary,
      body,
      tags,
    };

    // Client-side Zod validation for instant feedback
    const validation = ideaSubmissionSchema.safeParse(formData);
    if (!validation.success) {
      setErrors(validation.error.flatten().fieldErrors);
      return;
    }

    setErrors({});

    startTransition(async () => {
      const result = await submitIdeaAction(formData);

      if (!result.success) {
        if (result.fieldErrors) {
          setErrors(result.fieldErrors);
        }
        setServerError(result.error);
        return;
      }

      // Clear draft on successful submission per T-3.6
      try {
        localStorage.removeItem('ideapulse_submission_draft');
      } catch {}

      // Success path per T-3.7: redirect to /idea/[slug]?created=1
      router.push(`/idea/${result.slug}?created=1`);
    });
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {/* Restored draft notice [T-3.6] */}
      {restoredDraftTime && (
        <div className="flex items-center justify-between rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-2)] px-4 py-2.5 text-xs text-[var(--text-secondary)]">
          <span>Restored from unsaved draft (saved at {restoredDraftTime}).</span>
          <button
            type="button"
            onClick={handleDiscardDraft}
            className="font-medium text-[var(--accent-warning)] hover:underline focus:outline-none"
          >
            Discard draft
          </button>
        </div>
      )}

      {serverError && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-[var(--radius-md)] border border-[rgba(239,68,68,0.3)] bg-[rgba(239,68,68,0.1)] p-4 text-sm text-[var(--accent-danger)]"
        >
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <div className="leading-relaxed">{serverError}</div>
        </div>
      )}

      {/* 1. Title */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label htmlFor="idea-title" className="text-sm font-medium text-[var(--text-secondary)]">
            Title <span className="text-[var(--accent-danger)]">*</span>
          </label>
          <CharCounter
            current={title.length}
            min={IDEA_LIMITS.TITLE_MIN}
            max={IDEA_LIMITS.TITLE_MAX}
            id="title-counter"
          />
        </div>
        <input
          id="idea-title"
          name="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="E.g., Offline-first sync engine for edge databases"
          aria-invalid={!!errors.title}
          aria-describedby={errors.title ? 'title-error' : 'title-counter'}
          className="w-full rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--surface-2)] px-4 py-2.5 text-[15px] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] backdrop-blur-[var(--blur-sm)] transition-all hover:border-[var(--border-strong)] focus:border-[var(--indigo)] focus:shadow-[var(--glow-indigo-sm)] focus:outline-none aria-[invalid=true]:border-[var(--accent-danger)]"
        />
        {errors.title && (
          <p id="title-error" className="mt-1.5 text-xs text-[var(--accent-danger)]">
            {errors.title[0]}
          </p>
        )}
      </div>

      {/* 2. Category */}
      <div>
        <label
          htmlFor="idea-category"
          className="mb-2 block text-sm font-medium text-[var(--text-secondary)]"
        >
          Category <span className="text-[var(--accent-danger)]">*</span>
        </label>
        <select
          id="idea-category"
          name="category"
          value={category}
          onChange={(e) => setCategory(e.target.value as Category)}
          className="w-full rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--surface-2)] px-4 py-2.5 text-[15px] text-[var(--text-primary)] backdrop-blur-[var(--blur-sm)] transition-all hover:border-[var(--border-strong)] focus:border-[var(--indigo)] focus:shadow-[var(--glow-indigo-sm)] focus:outline-none"
        >
          {CATEGORIES.map((cat) => (
            <option
              key={cat}
              value={cat}
              className="bg-[var(--surface-1)] text-[var(--text-primary)]"
            >
              {CATEGORY_LABELS[cat]}
            </option>
          ))}
        </select>
      </div>

      {/* 3. Summary */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label
            htmlFor="idea-summary"
            className="text-sm font-medium text-[var(--text-secondary)]"
          >
            Summary <span className="text-[var(--accent-danger)]">*</span>
          </label>
          <CharCounter
            current={summary.length}
            min={IDEA_LIMITS.SUMMARY_MIN}
            max={IDEA_LIMITS.SUMMARY_MAX}
            id="summary-counter"
          />
        </div>
        <textarea
          id="idea-summary"
          name="summary"
          rows={3}
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="A concise, punchy problem-solution statement (40–280 characters)..."
          aria-invalid={!!errors.summary}
          aria-describedby={errors.summary ? 'summary-error' : 'summary-counter'}
          className="w-full resize-none rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--surface-2)] px-4 py-2.5 text-[15px] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] backdrop-blur-[var(--blur-sm)] transition-all hover:border-[var(--border-strong)] focus:border-[var(--indigo)] focus:shadow-[var(--glow-indigo-sm)] focus:outline-none aria-[invalid=true]:border-[var(--accent-danger)]"
        />
        {errors.summary && (
          <p id="summary-error" className="mt-1.5 text-xs text-[var(--accent-danger)]">
            {errors.summary[0]}
          </p>
        )}
      </div>

      {/* 4. Tags */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label
            htmlFor="idea-tag-input"
            className="text-sm font-medium text-[var(--text-secondary)]"
          >
            Tags (up to {IDEA_LIMITS.TAGS_MAX})
          </label>
          <span className="text-xs text-[var(--text-tertiary)]">
            {tags.length}/{IDEA_LIMITS.TAGS_MAX}
          </span>
        </div>

        {/* Existing tags chip bar */}
        {tags.length > 0 && (
          <div className="mb-2.5 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-accent)] bg-[rgba(99,102,241,0.12)] px-2.5 py-1 text-xs font-medium text-[var(--indigo-bright)]"
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="rounded-full p-0.5 hover:bg-[rgba(99,102,241,0.2)] focus:outline-none"
                  aria-label={`Remove tag ${tag}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        {tags.length < IDEA_LIMITS.TAGS_MAX && (
          <div className="flex gap-2">
            <input
              id="idea-tag-input"
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              placeholder="Add a tag (e.g. react, postgres, ai) and press Enter"
              className="flex-1 rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--surface-2)] px-4 py-2 text-[14px] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] backdrop-blur-[var(--blur-sm)] transition-all hover:border-[var(--border-strong)] focus:border-[var(--indigo)] focus:outline-none"
            />
            <button
              type="button"
              onClick={handleAddTag}
              disabled={!tagInput.trim()}
              className="btn btn-secondary inline-flex items-center gap-1 px-3 py-2 text-xs"
            >
              <Plus className="h-3.5 w-3.5" /> Add
            </button>
          </div>
        )}
        {errors.tags && (
          <p className="mt-1.5 text-xs text-[var(--accent-danger)]">{errors.tags[0]}</p>
        )}
      </div>

      {/* 5. Detailed Body with Markdown Preview [T-3.5] */}
      <div>
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <label htmlFor="idea-body" className="text-sm font-medium text-[var(--text-secondary)]">
            Detailed Proposal (Markdown) <span className="text-[var(--accent-danger)]">*</span>
          </label>

          <div className="flex items-center gap-3">
            {/* Editor mode switcher */}
            <div className="flex rounded-[var(--radius-xs)] border border-[var(--border-subtle)] bg-[var(--surface-2)] p-0.5">
              <button
                type="button"
                onClick={() => setEditorTab('write')}
                className={`inline-flex items-center gap-1 rounded-[var(--radius-xs)] px-2.5 py-1 text-xs font-medium transition-colors ${
                  editorTab === 'write'
                    ? 'bg-[var(--surface-3)] text-[var(--text-primary)] shadow-sm'
                    : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                }`}
              >
                <Edit3 className="h-3 w-3" /> Write
              </button>
              <button
                type="button"
                onClick={() => setEditorTab('preview')}
                className={`inline-flex items-center gap-1 rounded-[var(--radius-xs)] px-2.5 py-1 text-xs font-medium transition-colors ${
                  editorTab === 'preview'
                    ? 'bg-[var(--surface-3)] text-[var(--text-primary)] shadow-sm'
                    : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                }`}
              >
                <Eye className="h-3 w-3" /> Preview
              </button>
              <button
                type="button"
                onClick={() => setEditorTab('split')}
                className={`hidden items-center gap-1 rounded-[var(--radius-xs)] px-2.5 py-1 text-xs font-medium transition-colors lg:inline-flex ${
                  editorTab === 'split'
                    ? 'bg-[var(--surface-3)] text-[var(--text-primary)] shadow-sm'
                    : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                }`}
              >
                <Columns className="h-3 w-3" /> Split
              </button>
            </div>

            <CharCounter
              current={body.length}
              min={IDEA_LIMITS.BODY_MIN}
              max={IDEA_LIMITS.BODY_MAX}
              id="body-counter"
            />
          </div>
        </div>

        {/* View mode rendering */}
        {editorTab === 'write' && (
          <textarea
            id="idea-body"
            name="body"
            rows={12}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Explain the background, technical architecture, and impact... (100–5000 characters). Markdown supported: bold, italic, code blocks, lists, links."
            aria-invalid={!!errors.body}
            aria-describedby={errors.body ? 'body-error' : 'body-counter'}
            className="w-full rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--surface-2)] p-4 font-mono text-[14px] leading-relaxed text-[var(--text-primary)] placeholder-[var(--text-tertiary)] backdrop-blur-[var(--blur-sm)] transition-all hover:border-[var(--border-strong)] focus:border-[var(--indigo)] focus:shadow-[var(--glow-indigo-sm)] focus:outline-none aria-[invalid=true]:border-[var(--accent-danger)]"
          />
        )}

        {editorTab === 'preview' && <MarkdownPreview content={body} minHeight="280px" />}

        {editorTab === 'split' && (
          <div className="grid grid-cols-2 gap-4">
            <textarea
              id="idea-body-split"
              name="body"
              rows={12}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Type your markdown here..."
              className="w-full rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--surface-2)] p-4 font-mono text-[14px] leading-relaxed text-[var(--text-primary)] placeholder-[var(--text-tertiary)] backdrop-blur-[var(--blur-sm)] focus:border-[var(--indigo)] focus:outline-none"
            />
            <MarkdownPreview content={body} minHeight="280px" />
          </div>
        )}

        {errors.body && (
          <p id="body-error" className="mt-1.5 text-xs text-[var(--accent-danger)]">
            {errors.body[0]}
          </p>
        )}
      </div>

      {/* Submit Button per DESIGN.md §7.1 */}
      <div className="pt-4">
        <button
          type="submit"
          disabled={isPending}
          className="btn btn-primary relative w-full py-3 text-[15px] font-semibold tracking-wide sm:w-auto sm:px-8"
        >
          {isPending ? (
            <span className="inline-flex items-center gap-2">
              <svg
                className="h-4 w-4 animate-spin text-current"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span className="opacity-55">Publishing idea...</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[var(--indigo-bright)]" />
              Publish Idea
            </span>
          )}
        </button>
      </div>
    </form>
  );
}
